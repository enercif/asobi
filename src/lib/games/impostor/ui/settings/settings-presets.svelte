<script lang="ts">
    import Dialog from "$lib/ui/dialog.svelte";
    import OptionRow from "$lib/ui/option-row.svelte";
    import TriggerRow from "$lib/ui/trigger-row.svelte";
    import { Gamepad2 } from "@lucide/svelte";
    import { impostorPresetsState } from "../../states/impostor.presets.state.svelte";
    import { impostorSettingsState } from "../../states/impostor.state.svelte";

    function getLabelFromPlayers(players: string[]) {
        players = players.filter((player) => player.trim() !== "");

        if (players.length === 0) {
            return "Leere Voreinstellung";
        } else if (players.length <= 5) {
            return players.join(", ");
        } else {
            return `${players[0]} + ${players.length - 1}`;
        }
    }
</script>

<Dialog title="Voreinstellungen">
    {#snippet trigger()}
        <TriggerRow label="Voreinstellungen" value={undefined}>
            <Gamepad2 size={28} />
        </TriggerRow>
    {/snippet}

    <div class="flex size-full max-h-125 flex-col gap-2 overflow-y-auto">
        {#each impostorPresetsState.current as preset, index (index)}
            <OptionRow
                label={getLabelFromPlayers(preset.playerInputs)}
                selected={JSON.stringify(preset.playerInputs) ===
                    JSON.stringify(impostorSettingsState.current.playerInputs)}
                onclick={() => {
                    impostorSettingsState.current = preset;
                }} />

            {#if index + 1 !== impostorPresetsState.current.length}
                <div class="mx-2 border-b border-contrast/35"></div>
            {/if}
        {/each}
    </div>
</Dialog>
