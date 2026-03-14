<script lang="ts">
    import type { ImpostorRevealCard } from "$lib/games/impostor/types";

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
    const secretHeadline = $derived(card.word ?? "Impostor");

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

<div class=" flex h-full flex-col justify-start gap-10">
    <div class="flex flex-col items-center gap-1 text-center">
        <h2 class="text-4xl font-bold text-black">{card.player.name}</h2>
        <p class="text-base text-black/60">Spieler {currentPlayerIndex + 1} von {totalPlayers}</p>
    </div>

    <button
        class={`flex h-fit w-full touch-none flex-col items-center justify-center gap-6 rounded-4xl  bg-white px-8 py-10 text-center text-black shadow-sm transition-transform select-none `}
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
        <div class="flex w-full max-w-xl flex-col items-center gap-8">
            <div class="relative flex min-h-48 w-full items-center justify-center">
                <div
                    class={`flex max-w-lg flex-col items-center gap-1 text-center transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none ${
                        isHoldingCard
                            ? "translate-y-18 rotate-[1.5deg] opacity-100"
                            : "translate-y-0 -rotate-[1.5deg] opacity-0"
                    }`}>
                    <p
                        class={`text-3xl font-extrabold tracking-[0.2em] text-balance uppercase ${card.word ? "text-black" : "text-red-600"}`}>
                        {secretHeadline}
                    </p>

                    {#if card.hint}
                        <p class="max-w-sm text-base font-semibold text-black">
                            Hinweis: {card.hint}
                        </p>
                    {/if}
                </div>

                <div
                    class={`pointer-events-none absolute inset-x-6 top-1/2 flex -translate-y-1/2 justify-center transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                        isHoldingCard ? "-translate-y-22 -rotate-10" : "-rotate-2"
                    }`}>
                    <div
                        class="flex min-h-20 w-full max-w-[24rem] items-center justify-center rounded-xl border border-red-900/60 bg-red-600 px-4 py-3.5 shadow-[0_18px_40px_-24px_rgba(127,29,29,0.85)] will-change-transform">
                        <p
                            class="divide-dashed border-4 border-dashed py-1.5 text-3xl font-black tracking-[0.35em] text-white uppercase">
                            TOP SECRET
                        </p>
                    </div>
                </div>
            </div>

            <p class="text-sm text-black/60">
                {isHoldingCard ? "Loslassen zum Verbergen" : "Gedrückt halten zum Aufdecken"}
            </p>
        </div>
    </button>

    <div class="mt-auto mb-10 flex flex-col items-center gap-3 text-center">
        <button
            class="w-full rounded-xl bg-primary px-6 py-3 text-lg font-semibold text-white disabled:cursor-not-allowed disabled:bg-primary/50 disabled:text-white/70"
            type="button"
            disabled={!canAdvance}
            onclick={isLastPlayer ? onStartGame : onNextPlayer}>
            {isLastPlayer ? "Spiel starten" : "Nächster Spieler"}
        </button>
    </div>
</div>
