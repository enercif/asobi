<script lang="ts">
    import type { ImpostorRound, ImpostorTimerConfig } from "$lib/games/impostor/types";
    import DiscussionTimerCircle from "$lib/games/impostor/ui/discussion-timer-circle.svelte";

    type Props = {
        round: ImpostorRound;
        timer: ImpostorTimerConfig;
        onShowImpostors: () => void;
        onTimerEnd: () => void;
    };

    let { round, timer, onShowImpostors, onTimerEnd }: Props = $props();

    let hasEnded = $state(false);
    let elapsedMs = $state(0);

    let startingPlayer = $derived.by(
        () =>
            round.players.find((player) => player.id === round.startingPlayerId) ??
            round.players[0],
    );
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
                onTimerEnd();
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
        onShowImpostors();
    }
</script>

<div class="flex h-full flex-col gap-8">
    <div class="flex flex-col gap-3 text-center">
        <h2 class="text-4xl font-bold text-balance text-black">
            {startingPlayer?.name ?? "Ein Spieler"} beginnt
        </h2>
    </div>

    <div
        class="flex flex-col items-center justify-center gap-6 rounded-4xl bg-white px-8 py-10 text-center shadow-sm">
        <DiscussionTimerCircle {timer} statusLabel={timerStatusLabel} {strokeDashoffset} />
    </div>

    <button
        class="mt-auto mb-10 w-full rounded-xl bg-red-600 px-6 py-3 text-lg font-semibold text-white"
        type="button"
        onclick={revealImpostors}>
        Impostors anzeigen
    </button>
</div>
