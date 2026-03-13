<script lang="ts">
    import { impostorCategories } from "$lib/games/impostor/categories";
    import SettingsOptionRow from "$lib/games/impostor/settings-option-row.svelte";
    import SettingsToggleRow from "$lib/games/impostor/settings-toggle-row.svelte";
    import SettingsTriggerRow from "$lib/games/impostor/settings-trigger-row.svelte";
    import type { ImpostorCountConfig } from "$lib/types/impostor-game.type";
    import Dialog from "$lib/ui/dialog.svelte";
    import Slider from "$lib/ui/slider.svelte";
    import {
        CircleDashedIcon,
        HatGlassesIcon,
        SearchIcon,
        TimerIcon,
        UserIcon,
    } from "@lucide/svelte";

    type Props = {
        playerInputs?: string[];
        impostorCountMode?: ImpostorCountConfig["mode"];
        fixedImpostorCount?: number;
        randomImpostorRange?: [number, number];
        selectedCategoryIds?: string[];
        hintsEnabled?: boolean;
        timerEnabled?: boolean;
        timerDurationSeconds?: number;
        playerCount: number;
        minPlayers: number;
        maxImpostorCount: number;
        normalizedFixedImpostorCount: number;
        normalizedRandomImpostorRange: [number, number];
        impostorCountLabel: string;
        timerLabel: string;
        timerOptions: readonly number[];
        validationErrors: string[];
        roundError: string | null;
        canStart: boolean;
        canSubmit: boolean;
        onStart: () => void;
    };

    let {
        playerInputs = $bindable([""]),
        impostorCountMode = $bindable<ImpostorCountConfig["mode"]>("fixed"),
        fixedImpostorCount = $bindable(1),
        randomImpostorRange = $bindable<[number, number]>([1, 2]),
        selectedCategoryIds = $bindable<string[]>([]),
        hintsEnabled = $bindable(false),
        timerEnabled = $bindable(false),
        timerDurationSeconds = $bindable(180),
        playerCount,
        minPlayers,
        maxImpostorCount,
        normalizedFixedImpostorCount,
        normalizedRandomImpostorRange,
        impostorCountLabel,
        timerLabel,
        timerOptions,
        validationErrors,
        roundError,
        canStart,
        canSubmit,
        onStart,
    }: Props = $props();

    function formatTimer(seconds: number) {
        return seconds < 60 || seconds % 60 !== 0 ? `${seconds}s` : `${seconds / 60} min`;
    }

    function updatePlayer(index: number, value: string) {
        const nextInputs = [...playerInputs];
        nextInputs[index] = value;

        const visibleInputs = nextInputs.filter((name, inputIndex) => {
            const isLastInput = inputIndex === nextInputs.length - 1;

            return isLastInput || name.trim() !== "";
        });

        playerInputs = visibleInputs.at(-1)?.trim() === "" ? visibleInputs : [...visibleInputs, ""];
    }

    function toggleCategory(categoryId: string) {
        selectedCategoryIds = selectedCategoryIds.includes(categoryId)
            ? selectedCategoryIds.filter((id) => id !== categoryId)
            : [...selectedCategoryIds, categoryId];
    }

    function updateImpostorMode(enabled: boolean) {
        impostorCountMode = enabled ? "random" : "fixed";
    }

    function updateRandomImpostorRange(value: number[]) {
        randomImpostorRange = [value[0] ?? 1, value[1] ?? value[0] ?? 1];
    }
</script>

<div class="flex flex-col gap-6">
    <div class="overflow-hidden rounded-3xl bg-white text-xl shadow-sm ring-1 ring-black/5">
        <Dialog title="Spieler">
            {#snippet trigger()}
                <SettingsTriggerRow label="Spieler" value={playerCount}>
                    <UserIcon size={28} />
                </SettingsTriggerRow>
            {/snippet}

            <div class="flex size-full flex-col gap-2 overflow-y-auto">
                {#each playerInputs as playerName, index (index)}
                    <input
                        autocomplete="off"
                        spellcheck="false"
                        placeholder={`Spieler ${index + 1}`}
                        class="rounded-2xl bg-bg/60 px-4 py-3 text-base ring-1 ring-transparent outline-hidden transition animate-in animate-out fade-in zoom-in-50 focus:bg-white focus:ring-primary/15 sm:text-lg"
                        value={playerName}
                        oninput={(event) => updatePlayer(index, event.currentTarget.value)} />

                    {#if index + 1 !== playerInputs.length}
                        <div class="mx-2 border-b border-contrast/35"></div>
                    {/if}
                {/each}
            </div>
        </Dialog>

        <div class="mx-4 border-b border-contrast/35 sm:mx-6"></div>

        <Dialog title="Impostor">
            {#snippet trigger()}
                <SettingsTriggerRow label="Impostor" value={impostorCountLabel}>
                    <HatGlassesIcon size={28} />
                </SettingsTriggerRow>
            {/snippet}

            <div class="flex flex-col gap-3">
                <SettingsToggleRow
                    checked={impostorCountMode === "random"}
                    label="Zufällige Anzahl"
                    description="Legt den Bereich pro Runde neu fest."
                    onCheckedChange={updateImpostorMode}>
                    <HatGlassesIcon size={28} />
                </SettingsToggleRow>

                <div class="mx-2 border-b border-contrast/35"></div>

                {#if playerCount < minPlayers}
                    <p class="px-4 pb-1 text-sm leading-snug text-black/50">
                        Mehr Spieler freischalten weitere Impostor-Optionen.
                    </p>
                {:else if impostorCountMode === "random"}
                    <div class="space-y-4 rounded-2xl bg-bg/60 px-4 py-4">
                        <Slider
                            type="multiple"
                            max={maxImpostorCount}
                            min={1}
                            step={1}
                            value={normalizedRandomImpostorRange}
                            onValueChange={updateRandomImpostorRange} />

                        <div
                            class="flex items-center justify-between text-xs font-medium tracking-wide text-black/45 uppercase">
                            <span>1</span>
                            <span>{maxImpostorCount}</span>
                        </div>

                        {#if normalizedRandomImpostorRange[0] === normalizedRandomImpostorRange[1]}
                            <p class="text-center text-sm font-medium text-black/70">
                                {normalizedRandomImpostorRange[0]} Impostor
                            </p>
                        {:else}
                            <p class="text-center text-sm font-medium text-black/70">
                                {normalizedRandomImpostorRange[0]} - {normalizedRandomImpostorRange[1]}
                                Impostor
                            </p>
                        {/if}
                    </div>
                {:else}
                    <div class="flex max-h-full min-h-0 w-full flex-col gap-2 overflow-y-auto">
                        {#each Array.from({ length: maxImpostorCount }, (_, index) => index + 1) as impostorCount, index (impostorCount)}
                            <SettingsOptionRow
                                label={`${impostorCount} Impostor`}
                                selected={impostorCount === normalizedFixedImpostorCount}
                                onclick={() => (fixedImpostorCount = impostorCount)} />

                            {#if index !== maxImpostorCount - 1}
                                <div class="mx-2 border-b border-contrast/35"></div>
                            {/if}
                        {/each}
                    </div>
                {/if}
            </div>
        </Dialog>

        <div class="mx-4 border-b border-contrast/35 sm:mx-6"></div>

        <Dialog title="Kategorien">
            {#snippet trigger()}
                <SettingsTriggerRow label="Kategorien" value={selectedCategoryIds.length}>
                    <CircleDashedIcon size={28} />
                </SettingsTriggerRow>
            {/snippet}

            <div class="flex max-h-full min-h-0 w-full flex-col gap-2 overflow-y-auto">
                {#each impostorCategories as impostorCategory, index (impostorCategory.id)}
                    <SettingsOptionRow
                        label={impostorCategory.name}
                        description={impostorCategory.description}
                        selected={selectedCategoryIds.includes(impostorCategory.id)}
                        onclick={() => toggleCategory(impostorCategory.id)} />

                    {#if index !== impostorCategories.length - 1}
                        <div class="mx-2 border-b border-contrast/35"></div>
                    {/if}
                {/each}

                {#if selectedCategoryIds.length === 0}
                    <p class="px-4 pb-1 text-sm text-red-500">
                        Bitte mindestens eine Kategorie auswählen
                    </p>
                {/if}
            </div>
        </Dialog>

        <div class="mx-4 border-b border-contrast/35 sm:mx-6"></div>

        <SettingsToggleRow
            bind:checked={hintsEnabled}
            label="Hinweise"
            description="Zeigt zusätzliche Hilfen zur gesuchten Kategorie an.">
            <SearchIcon size={28} />
        </SettingsToggleRow>

        <div class="mx-4 border-b border-contrast/35 sm:mx-6"></div>

        <Dialog title="Zeitlimit">
            {#snippet trigger()}
                <SettingsTriggerRow label="Zeitlimit" value={timerLabel}>
                    <TimerIcon size={28} />
                </SettingsTriggerRow>
            {/snippet}

            <div class="flex flex-col gap-3">
                <SettingsToggleRow
                    bind:checked={timerEnabled}
                    label="Zeitlimit aktivieren"
                    description="Beendet die Diskussionsphase nach Ablauf automatisch.">
                    <TimerIcon size={28} />
                </SettingsToggleRow>

                {#if timerEnabled}
                    <div class="mx-2 border-b border-contrast/35"></div>

                    <div class="flex flex-col gap-2">
                        {#each timerOptions as timerOption, index (timerOption)}
                            <SettingsOptionRow
                                label={formatTimer(timerOption)}
                                selected={timerOption === timerDurationSeconds}
                                onclick={() => (timerDurationSeconds = timerOption)} />

                            {#if index !== timerOptions.length - 1}
                                <div class="mx-2 border-b border-contrast/35"></div>
                            {/if}
                        {/each}
                    </div>
                {:else}
                    <p class="px-4 pb-1 text-sm leading-snug text-black/50">
                        Der Timer ist aktuell deaktiviert.
                    </p>
                {/if}
            </div>
        </Dialog>
    </div>

    <div class="mb-10 flex w-full flex-col items-center gap-2">
        {#each validationErrors as validationError (validationError)}
            <p class="text-center text-red-500">{validationError}</p>
        {/each}

        {#if roundError}
            <p class="text-center text-red-500">{roundError}</p>
        {/if}

        <button
            class="w-full rounded-xl bg-primary px-6 py-3 font-semibold text-white disabled:bg-primary/50"
            disabled={!canStart || !canSubmit}
            type="button"
            onclick={onStart}>
            Spiel starten
        </button>
    </div>
</div>
