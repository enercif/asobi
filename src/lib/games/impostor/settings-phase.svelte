<script lang="ts">
    import { impostorCategories } from "$lib/games/impostor/categories";
    import {
        formatImpostorTimer,
        getImpostorSettingsState,
    } from "$lib/games/impostor/settings-state.svelte";
    import SettingsOptionRow from "$lib/games/impostor/settings-option-row.svelte";
    import SettingsToggleRow from "$lib/games/impostor/settings-toggle-row.svelte";
    import SettingsTriggerRow from "$lib/games/impostor/settings-trigger-row.svelte";
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
        onStart: () => void;
    };

    let { onStart }: Props = $props();

    const settingsState = getImpostorSettingsState();
</script>

<div class="flex flex-col gap-6">
    <div class="overflow-hidden rounded-3xl bg-white text-xl shadow-sm ring-1 ring-black/5">
        <Dialog title="Spieler">
            {#snippet trigger()}
                <SettingsTriggerRow label="Spieler" value={settingsState.playerCount}>
                    <UserIcon size={28} />
                </SettingsTriggerRow>
            {/snippet}

            <div class="flex size-full flex-col gap-2 overflow-y-auto">
                {#each settingsState.playerInputs as playerName, index (index)}
                    <input
                        autocomplete="off"
                        spellcheck="false"
                        placeholder={`Spieler ${index + 1}`}
                        class="rounded-2xl bg-bg/60 px-4 py-3 text-base ring-1 ring-transparent outline-hidden transition animate-in animate-out fade-in zoom-in-50 focus:bg-white focus:ring-primary/15 sm:text-lg"
                        value={playerName}
                        oninput={(event) =>
                            settingsState.updatePlayer(index, event.currentTarget.value)} />

                    {#if index + 1 !== settingsState.playerInputs.length}
                        <div class="mx-2 border-b border-contrast/35"></div>
                    {/if}
                {/each}
            </div>
        </Dialog>

        <div class="mx-4 border-b border-contrast/35 sm:mx-6"></div>

        <Dialog title="Impostor">
            {#snippet trigger()}
                <SettingsTriggerRow label="Impostor" value={settingsState.impostorCountLabel}>
                    <HatGlassesIcon size={28} />
                </SettingsTriggerRow>
            {/snippet}

            <div class="flex flex-col gap-3">
                <SettingsToggleRow
                    checked={settingsState.impostorCountMode === "random"}
                    label="Zufällige Anzahl"
                    description="Legt den Bereich pro Runde neu fest."
                    onCheckedChange={settingsState.updateImpostorMode}>
                    <HatGlassesIcon size={28} />
                </SettingsToggleRow>

                <div class="mx-2 border-b border-contrast/35"></div>

                {#if settingsState.playerCount < settingsState.minPlayers}
                    <p class="px-4 pb-1 text-sm leading-snug text-black/50">
                        Mehr Spieler freischalten weitere Impostor-Optionen.
                    </p>
                {:else if settingsState.impostorCountMode === "random"}
                    <div class="space-y-4 rounded-2xl bg-bg/60 px-4 py-4">
                        <Slider
                            type="multiple"
                            max={settingsState.maxImpostorCount}
                            min={1}
                            step={1}
                            value={settingsState.normalizedRandomImpostorRange}
                            onValueChange={settingsState.updateRandomImpostorRange} />

                        <div
                            class="flex items-center justify-between text-xs font-medium tracking-wide text-black/45 uppercase">
                            <span>1</span>
                            <span>{settingsState.maxImpostorCount}</span>
                        </div>

                        {#if settingsState.normalizedRandomImpostorRange[0] === settingsState.normalizedRandomImpostorRange[1]}
                            <p class="text-center text-sm font-medium text-black/70">
                                {settingsState.normalizedRandomImpostorRange[0]} Impostor
                            </p>
                        {:else}
                            <p class="text-center text-sm font-medium text-black/70">
                                {settingsState.normalizedRandomImpostorRange[0]} -
                                {settingsState.normalizedRandomImpostorRange[1]} Impostor
                            </p>
                        {/if}
                    </div>
                {:else}
                    <div class="flex max-h-full min-h-0 w-full flex-col gap-2 overflow-y-auto">
                        {#each Array.from({ length: settingsState.maxImpostorCount }, (_, index) => index + 1) as impostorCount, index (impostorCount)}
                            <SettingsOptionRow
                                label={`${impostorCount} Impostor`}
                                selected={impostorCount ===
                                    settingsState.normalizedFixedImpostorCount}
                                onclick={() =>
                                    (settingsState.fixedImpostorCount = impostorCount)} />

                            {#if index !== settingsState.maxImpostorCount - 1}
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
                <SettingsTriggerRow
                    label="Kategorien"
                    value={settingsState.selectedCategoryIds.length}>
                    <CircleDashedIcon size={28} />
                </SettingsTriggerRow>
            {/snippet}

            <div class="flex max-h-full min-h-0 w-full flex-col gap-2 overflow-y-auto">
                {#each impostorCategories as impostorCategory, index (impostorCategory.id)}
                    <SettingsOptionRow
                        label={impostorCategory.name}
                        description={impostorCategory.description}
                        selected={settingsState.selectedCategoryIds.includes(impostorCategory.id)}
                        onclick={() => settingsState.toggleCategory(impostorCategory.id)} />

                    {#if index !== impostorCategories.length - 1}
                        <div class="mx-2 border-b border-contrast/35"></div>
                    {/if}
                {/each}

                {#if settingsState.selectedCategoryIds.length === 0}
                    <p class="px-4 pb-1 text-sm text-red-500">
                        Bitte mindestens eine Kategorie auswählen
                    </p>
                {/if}
            </div>
        </Dialog>

        <div class="mx-4 border-b border-contrast/35 sm:mx-6"></div>

        <SettingsToggleRow
            bind:checked={settingsState.hintsEnabled}
            label="Hinweise"
            description="Zeigt zusätzliche Hilfen zur gesuchten Kategorie an.">
            <SearchIcon size={28} />
        </SettingsToggleRow>

        <div class="mx-4 border-b border-contrast/35 sm:mx-6"></div>

        <Dialog title="Zeitlimit">
            {#snippet trigger()}
                <SettingsTriggerRow label="Zeitlimit" value={settingsState.timerLabel}>
                    <TimerIcon size={28} />
                </SettingsTriggerRow>
            {/snippet}

            <div class="flex flex-col gap-3">
                <SettingsToggleRow
                    bind:checked={settingsState.timerEnabled}
                    label="Zeitlimit aktivieren"
                    description="Beendet die Diskussionsphase nach Ablauf automatisch.">
                    <TimerIcon size={28} />
                </SettingsToggleRow>

                {#if settingsState.timerEnabled}
                    <div class="mx-2 border-b border-contrast/35"></div>

                    <div class="flex flex-col gap-2">
                        {#each settingsState.timerOptions as timerOption, index (timerOption)}
                            <SettingsOptionRow
                                label={formatImpostorTimer(timerOption)}
                                selected={timerOption === settingsState.timerDurationSeconds}
                                onclick={() =>
                                    (settingsState.timerDurationSeconds = timerOption)} />

                            {#if index !== settingsState.timerOptions.length - 1}
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
        {#each settingsState.validationErrors as validationError (validationError)}
            <p class="text-center text-red-500">{validationError}</p>
        {/each}

        {#if settingsState.roundError}
            <p class="text-center text-red-500">{settingsState.roundError}</p>
        {/if}

        <button
            class="w-full rounded-xl bg-primary px-6 py-3 font-semibold text-white disabled:bg-primary/50"
            disabled={!settingsState.canStart || !settingsState.canSubmit}
            type="button"
            onclick={onStart}>
            Spiel starten
        </button>
    </div>
</div>
