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
    let activePointerId = $state<number | null>(null);

    function startReveal() {
        isHoldingCard = true;
        onReveal();
    }

    function endReveal(pointerId?: number) {
        if (pointerId !== undefined && activePointerId !== null && pointerId !== activePointerId) {
            return;
        }

        activePointerId = null;
        isHoldingCard = false;
    }

    function handlePointerdown(event: PointerEvent) {
        if (!event.isPrimary || event.button !== 0) {
            return;
        }

        const button = event.currentTarget as HTMLButtonElement;

        activePointerId = event.pointerId;
        button.setPointerCapture(event.pointerId);
        startReveal();
    }

    function handlePointerup(event: PointerEvent) {
        if (activePointerId !== event.pointerId) {
            return;
        }

        const button = event.currentTarget as HTMLButtonElement;

        if (button.hasPointerCapture(event.pointerId)) {
            button.releasePointerCapture(event.pointerId);
        }

        endReveal(event.pointerId);
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

<div class="flex h-full flex-col justify-center gap-6">
    <div class="flex flex-col items-center gap-2 text-center">
        <h2 class="text-4xl font-bold text-black">{card.player.name}</h2>
        <p class="text-base text-black/60">Spieler {currentPlayerIndex + 1} von {totalPlayers}</p>
    </div>

    <button
        class={`flex min-h-[22rem] w-full flex-1 touch-none flex-col items-center justify-center gap-6 rounded-[2rem] border-2 px-8 py-10 text-center shadow-sm transition-transform select-none ${
            isHoldingCard
                ? "border-primary/20 bg-white text-black"
                : "border-red-700 bg-red-600 text-white active:scale-[0.99]"
        }`}
        aria-pressed={isHoldingCard}
        type="button"
        onpointerdown={handlePointerdown}
        onpointerup={handlePointerup}
        onpointerleave={() => endReveal(activePointerId ?? undefined)}
        onpointercancel={(event) => endReveal(event.pointerId)}
        onlostpointercapture={(event) => endReveal(event.pointerId)}
        onkeydown={handleKeydown}
        onkeyup={handleKeyup}
        onblur={() => endReveal()}>
        {#if isHoldingCard}
            <div class="flex flex-col items-center gap-4">
                <p class="text-sm font-semibold tracking-[0.35em] text-primary uppercase">
                    {card.label}
                </p>

                {#if card.word}
                    <p
                        class="text-5xl font-black tracking-[0.2em] text-balance text-black uppercase">
                        {card.word}
                    </p>
                {:else}
                    <p
                        class="text-4xl font-black tracking-[0.2em] text-balance text-red-600 uppercase">
                        Du bist der Impostor
                    </p>
                {/if}

                {#if card.hint}
                    <p class="max-w-sm text-base text-black/65">Hinweis: {card.hint}</p>
                {/if}
            </div>
        {:else}
            <div class="flex flex-col items-center justify-center">
                <p class="text-5xl font-black tracking-[0.35em] text-white uppercase">TOP SECRET</p>
            </div>
        {/if}
    </button>

    <div class="flex flex-col items-center gap-3 text-center">
        {#if canAdvance}
            <button
                class="w-full rounded-xl bg-primary px-6 py-3 text-lg font-semibold text-white"
                type="button"
                onclick={isLastPlayer ? onStartGame : onNextPlayer}>
                {isLastPlayer ? "Spiel starten" : "Nächster Spieler"}
            </button>
        {/if}
    </div>
</div>
