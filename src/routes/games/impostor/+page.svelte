<script lang="ts">
    import {
        createImpostorSettingsState,
        setImpostorSettingsState,
    } from "$lib/games/impostor/settings-state.svelte";
    import DiscussionPhase from "$lib/games/impostor/ui/discussion-phase.svelte";
    import ResultsPhase from "$lib/games/impostor/ui/results-phase.svelte";
    import { createImpostorRound } from "$lib/games/impostor/round";
    import RevealPhase from "$lib/games/impostor/ui/reveal-phase.svelte";
    import SettingsPhase from "$lib/games/impostor/ui/settings-phase.svelte";
    import type {
        ImpostorGamePhase,
        ImpostorGameResult,
        ImpostorGameSetup,
        ImpostorPlayer,
        ImpostorRound,
        ImpostorRoundEndReason,
        ImpostorTimerConfig,
    } from "$lib/games/impostor/types";
    import Dialog from "$lib/ui/dialog.svelte";
    import { BookmarkIcon, ChevronLeft, CircleQuestionMarkIcon } from "@lucide/svelte";

    const settingsState = createImpostorSettingsState();
    setImpostorSettingsState(settingsState);

    let starred = $state(false);
    let phase = $state<"setup" | ImpostorGamePhase>("setup");
    let currentRound = $state<ImpostorRound | null>(null);
    let currentResult = $state<ImpostorGameResult | null>(null);
    let activeTimerConfig = $state<ImpostorTimerConfig>({ enabled: false });
    let currentRevealPlayerIndex = $state(0);
    let revealedPlayerIds = $state<ImpostorPlayer["id"][]>([]);

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

    function beginRound(setup: ImpostorGameSetup) {
        currentRound = createImpostorRound(setup);
        currentResult = null;
        activeTimerConfig = setup.timer.enabled
            ? { enabled: true, durationSeconds: setup.timer.durationSeconds }
            : { enabled: false };
        currentRevealPlayerIndex = 0;
        revealedPlayerIds = [];
        phase = "reveal";
        settingsState.clearRoundError();
    }

    function startRevealFlow() {
        const gameSetup = settingsState.gameSetup;

        if (gameSetup === null) {
            return;
        }

        try {
            beginRound(gameSetup);
        } catch (error) {
            settingsState.setRoundError(
                error instanceof Error ? error.message : "Die Runde konnte nicht gestartet werden.",
            );
        }
    }

    function startNextGame() {
        const gameSetup = settingsState.gameSetup;

        if (gameSetup === null) {
            return;
        }

        try {
            beginRound(gameSetup);
        } catch (error) {
            settingsState.setRoundError(
                error instanceof Error
                    ? error.message
                    : "Die nächste Runde konnte nicht gestartet werden.",
            );
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
        <SettingsPhase onStart={startRevealFlow} />
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
