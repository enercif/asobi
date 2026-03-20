<script lang="ts">
    import { draw } from "svelte/transition";
    import type { ImpostorTimerConfig } from "../../types/settings";

    type Props = {
        timerConfig: ImpostorTimerConfig;
        remainingTime: number;
        progress: number;
    };

    let { timerConfig, remainingTime, progress }: Props = $props();

    const timerCircleRadius = 112;
    const timerCircleCircumference = 2 * Math.PI * timerCircleRadius;

    let dashOffset = $derived(timerCircleCircumference * (1 - progress));

    function formatRemainingTime(totalSeconds: number) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
</script>

<div class="relative flex size-72 items-center justify-center">
    <svg class="size-full -rotate-90" viewBox="0 0 260 260" aria-hidden="true">
        <circle
            cx="130"
            cy="130"
            r={timerCircleRadius}
            fill="none"
            stroke="currentColor"
            stroke-width="16"
            class="text-black/10" />

        <circle
            cx="130"
            cy="130"
            r={timerCircleRadius}
            fill="none"
            stroke="currentColor"
            stroke-width="16"
            stroke-linecap="round"
            stroke-dasharray={timerCircleCircumference}
            stroke-dashoffset={dashOffset}
            class="{timerConfig.enabled
                ? 'text-primary'
                : 'text-primary/35'} transition-[stroke-dashoffset] duration-1000 ease-linear" />

        {#if remainingTime === 0}
            <circle
                in:draw={{ duration: 1000 }}
                cx="130"
                cy="130"
                r={timerCircleRadius}
                fill="none"
                stroke="red"
                stroke-width="10"
                stroke-linecap="round" />
        {/if}
    </svg>

    <div class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
        {#if timerConfig.enabled}
            <p
                class="text-5xl font-black text-black tabular-nums transition-colors duration-300"
                aria-live="polite"
                class:text-red-600={remainingTime <= 5}>
                {formatRemainingTime(remainingTime)}
            </p>
        {:else}
            <p class="wider text-sm font-semibold tracking-wider text-black/45">Kein Zeitlimit</p>
        {/if}
    </div>
</div>
