<script lang="ts">
    import Dialog from "$lib/ui/dialog.svelte";
    import Slider from "$lib/ui/slider.svelte";
    import { HatGlassesIcon } from "@lucide/svelte";

    import OptionRow from "$lib/ui/option-row.svelte";
    import ToggleRow from "$lib/ui/toggle-row.svelte";
    import TriggerRow from "$lib/ui/trigger-row.svelte";
    import {
        IMPOSTOR_MIN_PLAYERS,
        impostorSettingsState,
    } from "../../states/impostor.state.svelte";

    let hasMinPlayers = $derived(
        impostorSettingsState.playerInputs.length - 1 >= IMPOSTOR_MIN_PLAYERS,
    );

    let label = $derived.by(() => {
        if (!hasMinPlayers) {
            return "-";
        } else if (impostorSettingsState.impostorConfig.mode === "random") {
            if (
                impostorSettingsState.impostorConfig.randomRange[0] ===
                impostorSettingsState.impostorConfig.randomRange[1]
            ) {
                return `${impostorSettingsState.impostorConfig.randomRange[0]}`;
            } else {
                return `${impostorSettingsState.impostorConfig.randomRange[0]} - ${impostorSettingsState.impostorConfig.randomRange[1]}`;
            }
        } else {
            return `${impostorSettingsState.impostorConfig.count}`;
        }
    });

    function onCheckedChange(checked: boolean) {
        impostorSettingsState.impostorConfig.mode = checked ? "random" : "fixed";
    }
</script>

<Dialog title="Impostor">
    {#snippet trigger()}
        <TriggerRow label="Impostor" value={label}>
            <HatGlassesIcon size={28} />
        </TriggerRow>
    {/snippet}

    <div class="flex flex-col gap-1.5">
        {#if hasMinPlayers}
            <ToggleRow
                checked={impostorSettingsState.impostorConfig.mode === "random"}
                label="Zufällige Anzahl"
                {onCheckedChange}>
                <HatGlassesIcon size={28} />
            </ToggleRow>

            <div class="mx-2 border-b border-contrast/35"></div>
        {/if}

        {#if !hasMinPlayers}
            <p class=" pb-1 text-center text-base leading-snug text-black/50">
                Bitte zuerst mindestens {IMPOSTOR_MIN_PLAYERS} Spieler hinzufügen
            </p>
        {:else if impostorSettingsState.impostorConfig.mode === "random"}
            <div class="mt-8 space-y-4 rounded-2xl px-4 py-4">
                <div class="px-3">
                    <Slider
                        type="multiple"
                        max={impostorSettingsState.playerInputs.length - 2}
                        min={1}
                        step={1}
                        bind:value={impostorSettingsState.impostorConfig.randomRange} />
                </div>

                {#if impostorSettingsState.impostorConfig.randomRange[0] === impostorSettingsState.impostorConfig.randomRange[1]}
                    <p class="text-center text-sm font-medium text-black/70">
                        {impostorSettingsState.impostorConfig.randomRange[0]} Impostor
                    </p>
                {:else}
                    <p class="text-center text-sm font-medium text-black/70">
                        {impostorSettingsState.impostorConfig.randomRange[0]} -
                        {impostorSettingsState.impostorConfig.randomRange[1]} Impostor
                    </p>
                {/if}
            </div>
        {:else}
            <div class="flex max-h-100 min-h-0 w-full flex-col gap-1.5 overflow-y-auto">
                {#each Array.from({ length: impostorSettingsState.playerInputs.length - 2 }, (_, index) => index + 1) as impostorCount, index (impostorCount)}
                    <OptionRow
                        label={`${impostorCount} Impostor`}
                        selected={impostorCount === impostorSettingsState.impostorConfig.count}
                        onclick={() =>
                            (impostorSettingsState.impostorConfig.count = impostorCount)} />

                    {#if index !== impostorSettingsState.playerInputs.length - 3}
                        <div class="mx-1 border-b border-contrast/35"></div>
                    {/if}
                {/each}
            </div>
        {/if}
    </div>
</Dialog>
