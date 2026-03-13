<script lang="ts">
    import { createImpostorRound } from "$lib/games/impostor/round";
    import { impostorCategories } from "$lib/games/impostor/categories";
    import DiscussionPhase from "$lib/games/impostor/discussion-phase.svelte";
    import ResultsPhase from "$lib/games/impostor/results-phase.svelte";
    import RevealPhase from "$lib/games/impostor/reveal-phase.svelte";
    import SettingsPhase from "$lib/games/impostor/settings-phase.svelte";
    import type {
        ImpostorCountConfig,
        ImpostorGamePhase,
        ImpostorGameResult,
        ImpostorGameSetup,
        ImpostorPlayer,
        ImpostorRound,
        ImpostorRoundEndReason,
        ImpostorTimerConfig,
    } from "$lib/types/impostor-game.type";
    import Dialog from "$lib/ui/dialog.svelte";
    import { BookmarkIcon, ChevronLeft, CircleQuestionMarkIcon } from "@lucide/svelte";

    const minPlayers = 3;
    const timerOptions = [60, 120, 180, 300, 600] as const;

    type ImpostorCountMode = ImpostorCountConfig["mode"];

    let starred = $state(false);
    let phase = $state<"setup" | ImpostorGamePhase>("setup");
    let currentRound = $state<ImpostorRound | null>(null);
    let currentResult = $state<ImpostorGameResult | null>(null);
    let activeTimerConfig = $state<ImpostorTimerConfig>({ enabled: false });
    let currentRevealPlayerIndex = $state(0);
    let revealedPlayerIds = $state<ImpostorPlayer["id"][]>([]);
    let roundError = $state<string | null>(null);

    let settings = $state({
        playerInputs: [""],
        impostorCountMode: "fixed" as ImpostorCountMode,
        fixedImpostorCount: 1,
        randomImpostorRange: [1, 2] as [number, number],
        selectedCategoryIds: impostorCategories[0] ? [impostorCategories[0].id] : [],
        hintsEnabled: false,
        timerEnabled: false,
        timerDurationSeconds: 180,
    });

    let players = $derived.by((): ImpostorPlayer[] =>
        settings.playerInputs
            .map((name) => name.trim())
            .filter((name) => name.length > 0)
            .map((name, index) => ({
                id: `player-${index + 1}`,
                name,
            })),
    );
    let playerCount = $derived(players.length);
    let maxImpostorCount = $derived(Math.max(1, playerCount - 1));
    let normalizedFixedImpostorCount = $derived(
        clamp(settings.fixedImpostorCount, 1, maxImpostorCount),
    );
    let normalizedRandomImpostorRange = $derived.by(() => {
        const minCount = clamp(Math.min(...settings.randomImpostorRange), 1, maxImpostorCount);
        const maxCount = clamp(
            Math.max(...settings.randomImpostorRange),
            minCount,
            maxImpostorCount,
        );

        return [minCount, maxCount] as [number, number];
    });

    let impostorCountConfig = $derived.by(
        (): ImpostorCountConfig =>
            settings.impostorCountMode === "random"
                ? {
                      mode: "random",
                      min: normalizedRandomImpostorRange[0],
                      max: normalizedRandomImpostorRange[1],
                  }
                : {
                      mode: "fixed",
                      count: normalizedFixedImpostorCount,
                  },
    );

    let timerConfig = $derived.by(
        (): ImpostorTimerConfig =>
            settings.timerEnabled
                ? {
                      enabled: true,
                      durationSeconds: settings.timerDurationSeconds,
                  }
                : {
                      enabled: false,
                  },
    );

    let validationErrors = $derived.by(() => {
        const errors: string[] = [];

        if (playerCount < minPlayers) {
            errors.push(`Bitte mindestens ${minPlayers} Spieler hinzufügen`);
        }

        if (settings.selectedCategoryIds.length === 0) {
            errors.push("Bitte mindestens eine Kategorie auswählen");
        }

        if (playerCount >= minPlayers) {
            if (impostorCountConfig.mode === "fixed") {
                if (impostorCountConfig.count < 1 || impostorCountConfig.count >= playerCount) {
                    errors.push("Bitte eine gültige Anzahl an Impostoren auswählen");
                }
            } else if (
                impostorCountConfig.min < 1 ||
                impostorCountConfig.max >= playerCount ||
                impostorCountConfig.min > impostorCountConfig.max
            ) {
                errors.push("Bitte einen gültigen Impostor-Bereich auswählen");
            }
        }

        return errors;
    });

    let canStart = $derived(validationErrors.length === 0);
    let gameSetup = $derived.by((): ImpostorGameSetup | null =>
        canStart
            ? {
                  players,
                  selectedCategoryIds: [...settings.selectedCategoryIds],
                  impostorCount: impostorCountConfig,
                  hintsEnabled: settings.hintsEnabled,
                  timer: timerConfig,
              }
            : null,
    );

    let impostorCountLabel = $derived.by(() => {
        if (playerCount < minPlayers) {
            return "–";
        }

        if (impostorCountConfig.mode === "fixed") {
            return impostorCountConfig.count.toString();
        }

        return impostorCountConfig.min === impostorCountConfig.max
            ? impostorCountConfig.min.toString()
            : `${impostorCountConfig.min} - ${impostorCountConfig.max}`;
    });
    let timerLabel = $derived(
        settings.timerEnabled ? formatTimer(settings.timerDurationSeconds) : "Aus",
    );
    let currentRevealCard = $derived.by(() => {
        if (phase !== "reveal" || currentRound === null) {
            return null;
        }

        return currentRound.revealCards[currentRevealPlayerIndex] ?? null;
    });
    let hasCurrentPlayerRevealed = $derived.by(() => {
        const activePlayerId = currentRevealCard?.player.id;

        return activePlayerId ? revealedPlayerIds.includes(activePlayerId) : false;
    });
    let isLastRevealPlayer = $derived.by(
        () =>
            currentRound !== null &&
            currentRevealPlayerIndex === currentRound.revealCards.length - 1,
    );

    function clamp(value: number, min: number, max: number) {
        return Math.min(Math.max(value, min), max);
    }

    function formatTimer(seconds: number) {
        return seconds < 60 || seconds % 60 !== 0 ? `${seconds}s` : `${seconds / 60} min`;
    }

    function beginRound(setup: ImpostorGameSetup) {
        currentRound = createImpostorRound(setup);
        currentResult = null;
        activeTimerConfig = setup.timer.enabled
            ? { enabled: true, durationSeconds: setup.timer.durationSeconds }
            : { enabled: false };
        currentRevealPlayerIndex = 0;
        revealedPlayerIds = [];
        phase = "reveal";
        roundError = null;
    }

    function startRevealFlow() {
        if (gameSetup === null) {
            return;
        }

        try {
            beginRound(gameSetup);
        } catch (error) {
            roundError =
                error instanceof Error ? error.message : "Die Runde konnte nicht gestartet werden.";
        }
    }

    function startNextGame() {
        if (gameSetup === null) {
            return;
        }

        try {
            beginRound(gameSetup);
        } catch (error) {
            roundError =
                error instanceof Error
                    ? error.message
                    : "Die nächste Runde konnte nicht gestartet werden.";
            phase = "setup";
        }
    }

    function markCurrentPlayerAsRevealed() {
        const activePlayerId = currentRevealCard?.player.id;

        if (!activePlayerId || revealedPlayerIds.includes(activePlayerId)) {
            return;
        }

        revealedPlayerIds = [...revealedPlayerIds, activePlayerId];
    }

    function goToNextRevealPlayer() {
        if (!hasCurrentPlayerRevealed || currentRound === null || isLastRevealPlayer) {
            return;
        }

        currentRevealPlayerIndex += 1;
    }

    function startDiscussionPhase() {
        if (!hasCurrentPlayerRevealed || currentRound === null) {
            return;
        }

        phase = "discussion";
    }

    function endRound(endedReason: ImpostorRoundEndReason) {
        if (currentRound === null) {
            return;
        }

        currentResult = {
            endedReason,
            secretWord: currentRound.selectedWord,
            startingPlayerId: currentRound.startingPlayerId,
            impostorPlayerIds: currentRound.assignments
                .filter((assignment) => assignment.role === "impostor")
                .map((assignment) => assignment.playerId),
            round: currentRound,
        };
        phase = "results";
    }
</script>

<div class="flex h-full flex-col gap-20">
    <div class="relative flex flex-row items-center justify-between">
        <a
            class="flex size-12 items-center justify-center rounded-lg bg-white"
            href="/"
            aria-label="Zurück zur Startseite">
            <ChevronLeft size={28} />
        </a>

        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <h1 class="text-3xl font-bold">Impostor</h1>
        </div>

        <div class="flex flex-row items-center rounded-lg bg-white">
            <Dialog title="So funktioniert Impostor">
                {#snippet trigger()}
                    <button
                        class="flex size-12 items-center justify-center"
                        type="button"
                        aria-label="Spielregeln anzeigen">
                        <CircleQuestionMarkIcon size={28} />
                    </button>
                {/snippet}

                <div class="flex flex-col gap-3 text-left text-black/70">
                    <p>Tragt alle Spieler ein, wählt Kategorien und startet die Runde.</p>
                    <p>Vor jeder Karte wird das Gerät an die angezeigte Person weitergegeben.</p>
                    <p>
                        Geheime Karten bleiben nur sichtbar, solange sie gedrückt gehalten werden.
                    </p>
                    <p>
                        Nach allen Reveals startet die Diskussion mit einem zufälligen Startspieler.
                    </p>
                </div>
            </Dialog>

            <div class="h-9 border-r border-contrast/50"></div>

            <button
                class="flex size-12 items-center justify-center"
                type="button"
                aria-label={starred ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
                onclick={() => (starred = !starred)}>
                <BookmarkIcon
                    size={28}
                    class={starred
                        ? "fill-primary text-primary transition-all duration-150"
                        : "fill-none text-black transition-all duration-150"} />
            </button>
        </div>
    </div>

    {#if phase === "setup"}
        <SettingsPhase
            bind:playerInputs={settings.playerInputs}
            bind:impostorCountMode={settings.impostorCountMode}
            bind:fixedImpostorCount={settings.fixedImpostorCount}
            bind:randomImpostorRange={settings.randomImpostorRange}
            bind:selectedCategoryIds={settings.selectedCategoryIds}
            bind:hintsEnabled={settings.hintsEnabled}
            bind:timerEnabled={settings.timerEnabled}
            bind:timerDurationSeconds={settings.timerDurationSeconds}
            {playerCount}
            {minPlayers}
            {maxImpostorCount}
            {normalizedFixedImpostorCount}
            {normalizedRandomImpostorRange}
            {impostorCountLabel}
            {timerLabel}
            {timerOptions}
            {validationErrors}
            {roundError}
            {canStart}
            canSubmit={gameSetup !== null}
            onStart={startRevealFlow} />
    {:else if phase === "reveal" && currentRevealCard}
        <RevealPhase
            card={currentRevealCard}
            currentPlayerIndex={currentRevealPlayerIndex}
            totalPlayers={currentRound?.revealCards.length ?? 0}
            canAdvance={hasCurrentPlayerRevealed}
            isLastPlayer={isLastRevealPlayer}
            onReveal={markCurrentPlayerAsRevealed}
            onNextPlayer={goToNextRevealPlayer}
            onStartGame={startDiscussionPhase} />
    {:else if phase === "discussion" && currentRound}
        <DiscussionPhase
            round={currentRound}
            timer={activeTimerConfig}
            onShowImpostors={() => endRound("manual")}
            onTimerEnd={() => endRound("timer")} />
    {:else if phase === "results" && currentResult}
        <ResultsPhase result={currentResult} onNextGame={startNextGame} />
    {/if}
</div>
