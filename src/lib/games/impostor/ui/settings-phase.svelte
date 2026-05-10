<script lang="ts">
    import { SearchIcon } from "@lucide/svelte";

    import ToggleRow from "$lib/ui/toggle-row.svelte";
    import { impostorPresetsState } from "../states/impostor.presets.state.svelte";
    import { getValidationErrors, impostorSettingsState } from "../states/impostor.state.svelte";
    import SettingsCategories from "./settings/settings-categories.svelte";
    import SettingsImpostors from "./settings/settings-impostors.svelte";
    import SettingsPlayers from "./settings/settings-players.svelte";
    import SettingsPresets from "./settings/settings-presets.svelte";
    import SettingsTimer from "./settings/settings-timer.svelte";

    type Props = {
        onNextPhase: () => void;
    };

    let { onNextPhase }: Props = $props();
</script>

<div class="mt-5 flex h-full flex-col gap-6">
    {#if impostorPresetsState.current.length > 0}
        <div
            class="flex w-full flex-col overflow-hidden rounded-3xl bg-white text-xl shadow-sm ring-1 ring-black/5">
            <SettingsPresets />
        </div>
    {/if}

    <div
        class="flex w-full flex-col overflow-hidden rounded-3xl bg-white text-xl shadow-sm ring-1 ring-black/5">
        <SettingsPlayers />

        <div class="mx-4 border-b border-contrast/35 sm:mx-6"></div>

        <SettingsImpostors />

        <div class="mx-4 border-b border-contrast/35 sm:mx-6"></div>

        <SettingsCategories />

        <div class="mx-4 border-b border-contrast/35 sm:mx-6"></div>

        <ToggleRow bind:checked={impostorSettingsState.current.hintsEnabled} label="Hinweise">
            <SearchIcon size={28} />
        </ToggleRow>

        <div class="mx-4 border-b border-contrast/35 sm:mx-6"></div>

        <SettingsTimer />
    </div>

    <div class="mt-auto mb-10 flex w-full flex-col items-center gap-2">
        {#each getValidationErrors() as validationError (validationError)}
            <p class="text-center text-red-500">{validationError}</p>
        {/each}

        <button
            class="w-full rounded-xl bg-primary px-6 py-3 font-semibold text-white disabled:bg-primary/50"
            disabled={getValidationErrors().length > 0}
            type="button"
            onclick={onNextPhase}>
            Spiel starten
        </button>
    </div>
</div>
