<script lang="ts">
    import type { ImpostorTimerConfig } from "$lib/games/impostor/types";

    type Props = {
        timer: ImpostorTimerConfig;
        statusLabel: string;
        strokeDashoffset: number;
    };

    const timerCircleRadius = 112;
    const timerCircleCircumference = 2 * Math.PI * timerCircleRadius;

    let { timer, statusLabel, strokeDashoffset }: Props = $props();
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
            stroke-dashoffset={strokeDashoffset}
            class={timer.enabled ? "text-primary" : "text-primary/35"} />
    </svg>

    <div class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
        <p class="text-sm font-semibold tracking-[0.35em] text-black/45 uppercase">
            {timer.enabled ? "Restzeit" : "Zeitlimit"}
        </p>
        <p class="text-5xl font-black text-black tabular-nums" aria-live="polite">{statusLabel}</p>
        <p class="max-w-[11rem] text-sm text-black/55">
            {timer.enabled
                ? `${timer.durationSeconds} Sekunden für die Gesprächsrunde`
                : "Die Runde läuft ohne automatisches Ende."}
        </p>
    </div>
</div>
