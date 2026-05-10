<script lang="ts">
    import { impostorPresetsState } from "$lib/games/impostor/states/impostor.presets.state.svelte";
    import {
        baseImpostorSettings,
        impostorSettingsState,
    } from "$lib/games/impostor/states/impostor.state.svelte";
    import Dialog from "$lib/ui/dialog.svelte";
    import OptionRow from "$lib/ui/option-row.svelte";
    import TriggerRow from "$lib/ui/trigger-row.svelte";
    import { Gamepad2 } from "@lucide/svelte";

    function getLabelFromPlayers(players: string[]) {
        players = players.filter((player) => player.trim() !== "").map((player) => player.trim());

        if (players.length === 0) {
            return "Leere Voreinstellung";
        } else if (players.length < 5) {
            return players.join(", ");
        } else {
            return `${players.slice(0, 4).join(", ")} + ${players.length - 4}`;
        }
    }

    function onDeletePreset(index: number) {
        impostorPresetsState.current = impostorPresetsState.current.filter(
            (_, presetIndex) => presetIndex !== index,
        );
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
                onDelete={() => onDeletePreset(index)}
                onclick={() => {
                    impostorSettingsState.current = preset;
                }} />

            <div class="mx-2 border-b border-contrast/35"></div>
        {/each}
        <OptionRow
            label="Keine Voreinstellung"
            selected={!impostorPresetsState.current.some(
                (preset) =>
                    JSON.stringify(preset.playerInputs) ===
                    JSON.stringify(impostorSettingsState.current.playerInputs),
            )}
            onclick={() => {
                impostorSettingsState.current = baseImpostorSettings;
            }} />
    </div>
</Dialog>
