<script lang="ts">
	import type { ImpostorRound, ImpostorTimerConfig } from "$lib/types/impostor-game.type";

	type Props = {
		round: ImpostorRound;
		timer: ImpostorTimerConfig;
		onShowImpostors: () => void;
		onTimerEnd: () => void;
	};

	const timerCircleRadius = 112;
	const timerCircleCircumference = 2 * Math.PI * timerCircleRadius;

	let { round, timer, onShowImpostors, onTimerEnd }: Props = $props();

	let hasEnded = $state(false);
	let elapsedMs = $state(0);

	let startingPlayer = $derived.by(
		() => round.players.find((player) => player.id === round.startingPlayerId) ?? round.players[0],
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
	let strokeDashoffset = $derived(timerCircleCircumference * (1 - progress));
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
		<p class="text-sm font-semibold uppercase tracking-[0.35em] text-primary">Diskussion läuft</p>
		<h2 class="text-4xl font-bold text-black text-balance">{startingPlayer?.name ?? "Ein Spieler"} beginnt</h2>
		<p class="text-base text-black/60">
			Startet mit eurem ersten Hinweis und findet gemeinsam den Impostor.
		</p>
	</div>

	<div class="flex flex-1 flex-col items-center justify-center gap-6 rounded-[2rem] bg-white px-8 py-10 text-center shadow-sm">
		<div class="relative flex size-72 items-center justify-center">
			<svg class="size-full -rotate-90" viewBox="0 0 260 260" aria-hidden="true">
				<circle
					cx="130"
					cy="130"
					r={timerCircleRadius}
					fill="none"
					stroke="currentColor"
					stroke-width="16"
					class="text-black/10"
				/>
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
					class={timer.enabled ? "text-primary" : "text-primary/35"}
				/>
			</svg>

			<div class="absolute inset-0 flex flex-col items-center justify-center gap-2">
				<p class="text-sm font-semibold uppercase tracking-[0.35em] text-black/45">{timer.enabled ? "Restzeit" : "Zeitlimit"}</p>
				<p class="text-5xl font-black text-black tabular-nums">{timerStatusLabel}</p>
				<p class="max-w-[11rem] text-sm text-black/55">
					{timer.enabled
						? `${timer.durationSeconds} Sekunden für die Gesprächsrunde`
						: "Die Runde läuft ohne automatisches Ende."}
				</p>
			</div>
		</div>

		<div class="flex flex-wrap items-center justify-center gap-2">
			{#each round.players as player (player.id)}
				<span
					class={`rounded-full px-3 py-1 text-sm font-medium ${
						player.id === round.startingPlayerId ? "bg-primary text-white" : "bg-black/5 text-black/65"
					}`}
				>
					{player.name}
				</span>
			{/each}
		</div>
	</div>

	<button
		class="w-full rounded-xl bg-red-600 px-6 py-3 text-lg font-semibold text-white"
		type="button"
		onclick={revealImpostors}
	>
		Impostors anzeigen
	</button>
</div>
