<script lang="ts">
	import type { ImpostorRevealCard } from "$lib/types/impostor-game.type";

	type Props = {
		card: ImpostorRevealCard;
		currentPlayerIndex: number;
		totalPlayers: number;
		canAdvance: boolean;
		isLastPlayer: boolean;
		onReveal: () => void;
		onNextPlayer: () => void;
		onStartGame: () => void;
	};

	let {
		card,
		currentPlayerIndex,
		totalPlayers,
		canAdvance,
		isLastPlayer,
		onReveal,
		onNextPlayer,
		onStartGame,
	}: Props = $props();

	let isHoldingCard = $state(false);

	function startReveal() {
		isHoldingCard = true;
		onReveal();
	}

	function endReveal() {
		isHoldingCard = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.repeat || (event.key !== " " && event.key !== "Enter")) {
			return;
		}

		event.preventDefault();
		startReveal();
	}

	function handleKeyup(event: KeyboardEvent) {
		if (event.key !== " " && event.key !== "Enter") {
			return;
		}

		event.preventDefault();
		endReveal();
	}
</script>

<div class="flex h-full flex-col gap-8">
	<div class="flex flex-col gap-3 text-center">
		<p class="text-sm font-semibold uppercase tracking-[0.35em] text-black/45">Geheime Karte</p>
		<h2 class="text-4xl font-bold text-black">{card.player.name}</h2>
		<p class="text-base text-black/60">Spieler {currentPlayerIndex + 1} von {totalPlayers}</p>
	</div>

	<button
		class={`flex min-h-[22rem] w-full flex-1 flex-col items-center justify-center gap-6 rounded-[2rem] border-2 px-8 py-10 text-center shadow-sm transition-transform ${
			isHoldingCard
				? "border-primary/20 bg-white text-black"
				: "border-red-700 bg-red-600 text-white active:scale-[0.99]"
		}`}
		type="button"
		onpointerdown={startReveal}
		onpointerup={endReveal}
		onpointerleave={endReveal}
		onpointercancel={endReveal}
		onkeydown={handleKeydown}
		onkeyup={handleKeyup}
		onblur={endReveal}
	>
		{#if isHoldingCard}
			<div class="flex flex-col items-center gap-4">
				<p class="text-sm font-semibold uppercase tracking-[0.35em] text-primary">{card.label}</p>

				{#if card.word}
					<p class="text-5xl font-black uppercase tracking-[0.2em] text-balance text-black">{card.word}</p>
				{:else}
					<p class="text-4xl font-black uppercase tracking-[0.2em] text-balance text-red-600">
						Du bist der Impostor
					</p>
				{/if}

				{#if card.hint}
					<p class="max-w-sm text-base text-black/65">Hinweis: {card.hint}</p>
				{/if}
			</div>
		{:else}
			<div class="flex flex-col items-center gap-6">
				<p class="text-sm font-semibold uppercase tracking-[0.45em] text-red-100">Freigabe verweigert</p>
				<p class="text-5xl font-black uppercase tracking-[0.35em] text-white">TOP SECRET</p>
				<p class="max-w-xs text-base text-red-100">Gedrückt halten, damit nur du deine Karte siehst.</p>
			</div>
		{/if}
	</button>

	<div class="flex flex-col items-center gap-3 text-center">
		{#if canAdvance}
			<button
				class="w-full rounded-xl bg-primary px-6 py-3 text-lg font-semibold text-white"
				type="button"
				onclick={isLastPlayer ? onStartGame : onNextPlayer}
			>
				{isLastPlayer ? "Spiel starten" : "Nächster Spieler"}
			</button>
		{:else}
			<p class="text-base text-black/60">Halte die Karte gedrückt, um dein Geheimnis aufzudecken.</p>
		{/if}
	</div>
</div>
