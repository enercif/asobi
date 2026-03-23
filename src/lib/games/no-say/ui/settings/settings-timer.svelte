<script lang="ts">
    import { formatTimeSmall } from "$lib/helper/format.helper";
    import Dialog from "$lib/ui/dialog.svelte";
    import OptionRow from "$lib/ui/option-row.svelte";
    import TriggerRow from "$lib/ui/trigger-row.svelte";
    import { TimerIcon } from "@lucide/svelte";
    import {
        NOSAY_TIMER_OPTIONS,
        noSaySettingsState,
    } from "../../states/nosay.settings.state.svelte";

    let label = $derived(formatTimeSmall(noSaySettingsState.timerConfig.durationSeconds));
</script>

<Dialog title="Rundenzeit">
    {#snippet trigger()}
        <TriggerRow label="Rundenzeit" value={label}>
            <TimerIcon size={28} />
        </TriggerRow>
    {/snippet}

    <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-2">
            {#each NOSAY_TIMER_OPTIONS as timerOption, index (timerOption)}
                <OptionRow
                    label={formatTimeSmall(timerOption)}
                    selected={timerOption === noSaySettingsState.timerConfig.durationSeconds}
                    onclick={() =>
                        (noSaySettingsState.timerConfig.durationSeconds = timerOption)} />

                {#if index !== NOSAY_TIMER_OPTIONS.length - 1}
                    <div class="mx-2 border-b border-contrast/35"></div>
                {/if}
            {/each}
        </div>
    </div>
</Dialog>
