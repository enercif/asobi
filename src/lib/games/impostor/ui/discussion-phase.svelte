<script lang="ts">
    import DiscussionTimerCircle from "$lib/games/impostor/ui/discussion/discussion-timer-circle.svelte";
    import { impostorGameState } from "../states/impostor.game.state.svelte";
    import { impostorSettingsState } from "../states/impostor.state.svelte";

    type Props = {
        onNextPhase: () => void;
    };

    let { onNextPhase }: Props = $props();

    let hasEnded = $state(false);
    let elapsedMs = $state(0);

    let timer = $derived(impostorSettingsState.timerConfig);
    let totalDurationMs = $derived(timer.enabled ? timer.durationSeconds * 1000 : null);
    let remainingMs = $derived.by(() => {
        if (!timer.enabled || totalDurationMs === null) {
            return null;
        }

        return Math.max(totalDurationMs - elapsedMs, 0);
    });
    let remainingSeconds = $derived.by(() => {
        if (remainingMs === null) {
            return null;
        }

        return Math.ceil(remainingMs / 1000);
    });
    let progress = $derived.by(() => {
        if (!timer.enabled || totalDurationMs === null) {
            return 1;
        }

        return Math.max(Math.min((remainingMs ?? 0) / totalDurationMs, 1), 0);
    });
    let strokeDashoffset = $derived(703.7167544041137 * (1 - progress));
    let timerStatusLabel = $derived.by(() => {
        if (!timer.enabled) {
            return "Offen";
        }

        return formatRemainingTime(remainingSeconds ?? timer.durationSeconds);
    });

    $effect(() => {
        if (!timer.enabled || totalDurationMs === null || hasEnded) {
            return;
        }

        let animationFrameId = 0;
        const startedAt = performance.now();

        elapsedMs = 0;

        const tick = (now: number) => {
            const nextElapsedMs = Math.min(now - startedAt, totalDurationMs);

            elapsedMs = nextElapsedMs;

            if (nextElapsedMs >= totalDurationMs) {
                hasEnded = true;
                onNextPhase();
                return;
            }

            animationFrameId = requestAnimationFrame(tick);
        };

        animationFrameId = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    });

    function formatRemainingTime(totalSeconds: number) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }

    function revealImpostors() {
        if (hasEnded) {
            return;
        }

        hasEnded = true;
        onNextPhase();
    }
</script>

<div class="flex h-full flex-col gap-8">
    <div
        class="mt-8 flex flex-col items-center justify-center gap-6 rounded-4xl bg-white px-8 py-10 text-center shadow-sm">
        <h2 class="text-4xl font-bold text-balance text-black">
            {impostorGameState.startingPlayerName} beginnt
        </h2>
        <DiscussionTimerCircle {timer} statusLabel={timerStatusLabel} {strokeDashoffset} />
    </div>

    <button
        class="mt-auto mb-10 w-full rounded-xl bg-red-600 px-6 py-3 text-lg font-semibold text-white"
        type="button"
        onclick={revealImpostors}>
        Impostors anzeigen
    </button>
</div>
