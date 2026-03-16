<script lang="ts">
    import Dialog from "$lib/ui/dialog.svelte";
    import OptionRow from "$lib/ui/option-row.svelte";
    import ToggleRow from "$lib/ui/toggle-row.svelte";
    import TriggerRow from "$lib/ui/trigger-row.svelte";
    import { TimerIcon } from "@lucide/svelte";
    import {
        IMPOSTOR_TIMER_OPTIONS,
        impostorSettingsState,
    } from "../../states/impostor.state.svelte";

    export function formatImpostorTimer(seconds: number) {
        return seconds < 60 || seconds % 60 !== 0 ? `${seconds}s` : `${seconds / 60} min`;
    }

    let label = $derived.by(() => {
        if (!impostorSettingsState.timerConfig.enabled) {
            return "Aus";
        }

        return formatImpostorTimer(impostorSettingsState.timerConfig.durationSeconds);
    });
</script>

<Dialog title="Zeitlimit">
    {#snippet trigger()}
        <TriggerRow label="Zeitlimit" value={label}>
            <TimerIcon size={28} />
        </TriggerRow>
    {/snippet}

    <div class="flex flex-col gap-3">
        <ToggleRow
            bind:checked={impostorSettingsState.timerConfig.enabled}
            label="Zeitlimit aktivieren">
            <TimerIcon size={28} />
        </ToggleRow>

        {#if impostorSettingsState.timerConfig.enabled}
            <div class="mx-2 border-b border-contrast/35"></div>

            <div class="flex flex-col gap-2">
                {#each IMPOSTOR_TIMER_OPTIONS as timerOption, index (timerOption)}
                    <OptionRow
                        label={formatImpostorTimer(timerOption)}
                        selected={timerOption === impostorSettingsState.timerConfig.durationSeconds}
                        onclick={() =>
                            (impostorSettingsState.timerConfig.durationSeconds = timerOption)} />

                    {#if index !== IMPOSTOR_TIMER_OPTIONS.length - 1}
                        <div class="mx-2 border-b border-contrast/35"></div>
                    {/if}
                {/each}
            </div>
        {/if}
    </div>
</Dialog>
