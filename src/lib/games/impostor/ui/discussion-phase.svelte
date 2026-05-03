<script lang="ts">
    import DiscussionTimerCircle from "$lib/games/impostor/ui/discussion/discussion-timer-circle.svelte";
    import { onDestroy, onMount } from "svelte";
    import { impostorGameState } from "../states/impostor.game.state.svelte";
    import { impostorSettingsState } from "../states/impostor.state.svelte";

    type Props = {
        onNextPhase: () => void;
    };

    let { onNextPhase }: Props = $props();

    let timerConfig = $derived(impostorSettingsState.timerConfig);
    let remainingTime = $derived(timerConfig.durationSeconds);
    let progress = $derived(getProgress());

    let locked = $state(true);

    let interval: NodeJS.Timeout;

    function getProgress() {
        if (remainingTime === timerConfig.durationSeconds || remainingTime === 0) {
            return remainingTime / timerConfig.durationSeconds;
        }
        return (remainingTime - 1) / timerConfig.durationSeconds;
    }

    onMount(() => {
        setTimeout(() => {
            locked = false;
        }, 2000);

        if (timerConfig.enabled) {
            interval = setInterval(() => {
                remainingTime--;
                if (remainingTime <= 0) {
                    clearInterval(interval);
                }
            }, 1000);
        }
    });

    onDestroy(() => {
        clearInterval(interval);
    });
</script>

<div class="flex h-full flex-col gap-8">
    <div
        class="mt-8 flex flex-col items-center justify-center gap-6 rounded-4xl bg-white px-8 py-10 text-center shadow-sm">
        <h2 class="text-4xl font-bold text-balance text-black">
            {impostorGameState.startingPlayerName} beginnt
        </h2>
        <DiscussionTimerCircle {timerConfig} {remainingTime} {progress} />
    </div>

    <button
        class="mt-auto mb-10 w-full rounded-xl bg-red-600 px-6 py-3 text-lg font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:bg-red-300"
        class:animate-alarm={remainingTime <= 0}
        disabled={locked}
        type="button"
        onclick={onNextPhase}>
        Impostors anzeigen
    </button>
</div>
