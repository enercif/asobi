<script lang="ts">
	import { createImpostorRound } from "$lib/games/impostor/round";
	import { impostorCategories } from "$lib/games/impostor/categories";
	import DiscussionPhase from "$lib/games/impostor/discussion-phase.svelte";
	import RevealPhase from "$lib/games/impostor/reveal-phase.svelte";
	import SettingsOptionRow from "$lib/games/impostor/settings-option-row.svelte";
	import SettingsToggleRow from "$lib/games/impostor/settings-toggle-row.svelte";
	import SettingsTriggerRow from "$lib/games/impostor/settings-trigger-row.svelte";
	import type {
		ImpostorCountConfig,
		ImpostorGamePhase,
		ImpostorGameResult,
		ImpostorGameSetup,
		ImpostorPlayer,
		ImpostorRoundEndReason,
		ImpostorRound,
		ImpostorTimerConfig,
	} from "$lib/types/impostor-game.type";
    import Dialog from "$lib/ui/dialog.svelte";
    import Slider from "$lib/ui/slider.svelte";
    import Switch from "$lib/ui/switch.svelte";
    import {
        BookmarkIcon,
        ChevronLeft,
        CircleDashedIcon,
        CircleQuestionMarkIcon,
        HatGlassesIcon,
        SearchIcon,
        TimerIcon,
        UserIcon,
    } from "@lucide/svelte";

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

    let players = $derived.by(
        (): ImpostorPlayer[] =>
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
    let normalizedFixedImpostorCount = $derived(clamp(settings.fixedImpostorCount, 1, maxImpostorCount));
    let normalizedRandomImpostorRange = $derived.by(() => {
        const minCount = clamp(Math.min(...settings.randomImpostorRange), 1, maxImpostorCount);
        const maxCount = clamp(Math.max(...settings.randomImpostorRange), minCount, maxImpostorCount);

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

    let gameSetup = $derived.by(
        (): ImpostorGameSetup | null =>
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

	let timerLabel = $derived(settings.timerEnabled ? formatTimer(settings.timerDurationSeconds) : "Aus");
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
		() => currentRound !== null && currentRevealPlayerIndex === currentRound.revealCards.length - 1,
	);
	let discussionStartingPlayer = $derived.by(() => {
		if (currentRound === null) {
			return null;
		}

		const { players: roundPlayers, startingPlayerId } = currentRound;

		return roundPlayers.find((player) => player.id === startingPlayerId) ?? null;
	});
	let resultImpostorPlayers = $derived.by(() => {
		const result = currentResult;

		if (result === null) {
			return [];
		}

		return result.round.players.filter((player) => result.impostorPlayerIds.includes(player.id));
	});

    function clamp(value: number, min: number, max: number) {
        return Math.min(Math.max(value, min), max);
    }

    function formatTimer(seconds: number) {
        return seconds < 60 || seconds % 60 !== 0
            ? `${seconds}s`
            : `${seconds / 60} min`;
    }

    function updatePlayer(index: number, value: string) {
        const nextInputs = [...settings.playerInputs];
        nextInputs[index] = value;

        const visibleInputs = nextInputs.filter((name, inputIndex) => {
            const isLastInput = inputIndex === nextInputs.length - 1;

            return isLastInput || name.trim() !== "";
        });

        settings.playerInputs = visibleInputs.at(-1)?.trim() === "" ? visibleInputs : [...visibleInputs, ""];
    }

    function toggleCategory(categoryId: string) {
        settings.selectedCategoryIds = settings.selectedCategoryIds.includes(categoryId)
            ? settings.selectedCategoryIds.filter((id) => id !== categoryId)
            : [...settings.selectedCategoryIds, categoryId];
    }

    function updateImpostorMode(enabled: boolean) {
        settings.impostorCountMode = enabled ? "random" : "fixed";
    }

	function updateRandomImpostorRange(value: number[]) {
		settings.randomImpostorRange = [value[0] ?? 1, value[1] ?? value[0] ?? 1];
	}

	function startRevealFlow() {
		if (gameSetup === null) {
			return;
		}

		try {
			currentRound = createImpostorRound(gameSetup);
			currentResult = null;
			activeTimerConfig =
				gameSetup.timer.enabled
					? { enabled: true, durationSeconds: gameSetup.timer.durationSeconds }
					: { enabled: false };
			currentRevealPlayerIndex = 0;
			revealedPlayerIds = [];
			phase = "reveal";
			roundError = null;
		} catch (error) {
			roundError = error instanceof Error ? error.message : "Die Runde konnte nicht gestartet werden.";
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

<div class="flex flex-col gap-20 h-full">
	<div class="relative flex flex-row items-center justify-between">
		<a class="bg-white rounded-lg size-12 flex items-center justify-center" href="/">
			<ChevronLeft size={28} />
		</a>

        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <h1 class="text-3xl font-bold">Impostor</h1>
        </div>

        <div class="flex flex-row items-center bg-white rounded-lg">
            <button class="size-12 flex items-center justify-center">
                <CircleQuestionMarkIcon size={28} />
            </button>

            <div class="h-9 border-r border-contrast/50"></div>

            <button
                class="size-12 flex items-center justify-center"
                onclick={() => (starred = !starred)}
            >
                <BookmarkIcon
                    size={28}
                    class={starred
                        ? "fill-primary text-primary duration-150 transition-all"
                        : "fill-none text-black duration-150 transition-all"}
                />
            </button>
		</div>
	</div>

	{#if phase === "setup"}
		<div class="flex flex-col rounded-2xl bg-white text-xl">
			<Dialog title="Spieler">
				{#snippet trigger()}
					<SettingsTriggerRow label="Spieler" value={playerCount}>
						<UserIcon size={28} />
					</SettingsTriggerRow>
				{/snippet}

				<div class="size-full overflow-y-auto flex flex-col gap-3">
					{#each settings.playerInputs as playerName, i (i)}
						<input
							placeholder={`Spieler ${i + 1}`}
							class="text-xl border-none outline-none animate-in animate-out fade-in zoom-in-50"
							value={playerName}
							oninput={(e) => updatePlayer(i, e.currentTarget.value)}
						/>
						{#if i + 1 != settings.playerInputs.length}
							<div class="mx-2 border-b border-contrast/50"></div>
						{/if}
					{/each}
				</div>
			</Dialog>

			<div class="mx-8 border-b border-contrast/50"></div>

			<Dialog title="Impostor">
				{#snippet trigger()}
					<SettingsTriggerRow label="Impostor" value={impostorCountLabel}>
						<HatGlassesIcon size={28} />
					</SettingsTriggerRow>
				{/snippet}

				<div class="flex flex-col gap-3">
					{#if playerCount < minPlayers}
						<p class="text-start text-black/50">
							Bitte mindestens {minPlayers} Spieler hinzufügen
						</p>
					{:else}
						<div class="flex flex-row items-center justify-between">
							<p class="text-xl">Zufällige Anzahl?</p>
							<Switch
								checked={settings.impostorCountMode === "random"}
								onCheckedChange={updateImpostorMode}
							/>
						</div>

						<div class="mx-2 border-b border-contrast/50"></div>
						{#if settings.impostorCountMode === "random"}
							<div class="w-full px-3 pt-10 pb-3">
								<Slider
									step={1}
									min={1}
									max={maxImpostorCount}
									value={normalizedRandomImpostorRange}
									onValueChange={updateRandomImpostorRange}
									type="multiple"
								/>
							</div>

							{#if normalizedRandomImpostorRange[0] === normalizedRandomImpostorRange[1]}
								<p class="text-center text text-black">
									{normalizedRandomImpostorRange[0]} Impostor
								</p>
							{:else}
								<p class="text-center text text-black">
									{normalizedRandomImpostorRange[0]} - {normalizedRandomImpostorRange[1]} Impostor
								</p>
							{/if}
						{:else}
							<div class="w-full min-h-0 max-h-full flex flex-col gap-3 overflow-y-auto">
								{#each Array.from({ length: maxImpostorCount }, (_, index) => index + 1) as impostorCount, i (impostorCount)}
									<SettingsOptionRow
										label={`${impostorCount} Impostor`}
										selected={impostorCount === normalizedFixedImpostorCount}
										onclick={() => (settings.fixedImpostorCount = impostorCount)}
									/>

									{#if i !== maxImpostorCount - 1}
										<div class="mx-2 border-b border-contrast/50"></div>
									{/if}
								{/each}
							</div>
						{/if}
					{/if}
				</div>
			</Dialog>

			<div class="mx-8 border-b border-contrast/50"></div>

			<Dialog title="Kategorien">
				{#snippet trigger()}
					<SettingsTriggerRow label="Kategorien" value={settings.selectedCategoryIds.length}>
						<CircleDashedIcon size={28} />
					</SettingsTriggerRow>
				{/snippet}

				<div class="w-full min-h-0 max-h-full flex flex-col gap-3 overflow-y-auto">
					{#each impostorCategories as impostorCategory, i (impostorCategory.id)}
						<SettingsOptionRow
							label={impostorCategory.name}
							description={impostorCategory.description}
							selected={settings.selectedCategoryIds.includes(impostorCategory.id)}
							onclick={() => toggleCategory(impostorCategory.id)}
						/>

						{#if i != impostorCategories.length - 1}
							<div class="mx-2 border-b border-contrast/50"></div>
						{/if}
					{/each}

					{#if settings.selectedCategoryIds.length === 0}
						<p class="text-sm text-red-500">Bitte mindestens eine Kategorie auswählen</p>
					{/if}
				</div>
			</Dialog>

			<div class="mx-8 border-b border-contrast/50"></div>

			<SettingsToggleRow
				bind:checked={settings.hintsEnabled}
				label="Hinweise"
				description="Impostoren erhalten optional einen Hinweis zum gesuchten Wort."
			>
				<SearchIcon size={28} />
			</SettingsToggleRow>

			<div class="mx-8 border-b border-contrast/50"></div>

			<Dialog title="Zeitlimit">
				{#snippet trigger()}
					<SettingsTriggerRow label="Zeitlimit" value={timerLabel}>
						<TimerIcon size={28} />
					</SettingsTriggerRow>
				{/snippet}

				<div class="flex flex-col gap-3">
					<SettingsToggleRow
						bind:checked={settings.timerEnabled}
						label="Zeitlimit aktivieren"
						description="Begrenzt die Diskussionsphase auf eine feste Dauer."
					>
						<TimerIcon size={28} />
					</SettingsToggleRow>

					{#if settings.timerEnabled}
						<div class="mx-2 border-b border-contrast/50"></div>

						<div class="flex flex-col gap-3">
							{#each timerOptions as timerOption, i (timerOption)}
								<SettingsOptionRow
									label={formatTimer(timerOption)}
									selected={timerOption === settings.timerDurationSeconds}
									onclick={() => (settings.timerDurationSeconds = timerOption)}
								/>

								{#if i !== timerOptions.length - 1}
									<div class="mx-2 border-b border-contrast/50"></div>
								{/if}
							{/each}
						</div>
					{:else}
						<p class="text-sm text-black/50">Der Timer ist aktuell deaktiviert.</p>
					{/if}
				</div>
			</Dialog>
		</div>

		<div class="flex flex-col rounded-2xl bg-white text-xl">
			<div class="flex flex-row items-center gap-3 px-6 py-4">
				<UserIcon size={28} />
				<p>Geräte</p>
			</div>
		</div>

		<div class="flex flex-col gap-2 items-center w-full mt-auto mb-10">
			{#each validationErrors as validationError (validationError)}
				<p class="text-center text-red-500">{validationError}</p>
			{/each}

			{#if roundError}
				<p class="text-center text-red-500">{roundError}</p>
			{/if}

			<button
				class="bg-primary text-white rounded-xl px-6 py-3 font-semibold disabled:bg-primary/50 w-full"
				disabled={!canStart || gameSetup === null}
				type="button"
				onclick={startRevealFlow}
			>
				Spiel starten
			</button>
		</div>
	{:else if phase === "reveal" && currentRevealCard}
		<RevealPhase
			card={currentRevealCard}
			currentPlayerIndex={currentRevealPlayerIndex}
			totalPlayers={currentRound?.revealCards.length ?? 0}
			canAdvance={hasCurrentPlayerRevealed}
			isLastPlayer={isLastRevealPlayer}
			onReveal={markCurrentPlayerAsRevealed}
			onNextPlayer={goToNextRevealPlayer}
			onStartGame={startDiscussionPhase}
		/>
	{:else if phase === "discussion" && currentRound}
		<DiscussionPhase
			round={currentRound}
			timer={activeTimerConfig}
			onShowImpostors={() => endRound("manual")}
			onTimerEnd={() => endRound("timer")}
		/>
	{:else if phase === "results" && currentResult}
		<div class="flex flex-1 flex-col items-center justify-center gap-8 rounded-[2rem] bg-white px-8 py-10 text-center">
			<div class="flex flex-col gap-3">
				<p class="text-sm font-semibold uppercase tracking-[0.35em] text-primary">
					{currentResult.endedReason === "timer" ? "Zeit abgelaufen" : "Runde beendet"}
				</p>
				<h2 class="text-4xl font-bold text-black">Impostors aufgedeckt</h2>
				<p class="max-w-md text-lg text-black/65">
					{discussionStartingPlayer?.name ?? "Ein Spieler"} hat begonnen. Das gesuchte Wort war
					<span class="font-bold text-black">{currentResult.secretWord.word}</span>.
				</p>
			</div>

			<div class="flex flex-wrap items-center justify-center gap-3">
				{#each resultImpostorPlayers as player (player.id)}
					<span class="rounded-full bg-red-600 px-4 py-2 text-base font-semibold text-white">
						{player.name}
					</span>
				{/each}
			</div>

			<p class="text-sm text-black/55">
				Kategorie: {currentResult.secretWord.categoryName}
			</p>
		</div>
	{/if}
</div>
