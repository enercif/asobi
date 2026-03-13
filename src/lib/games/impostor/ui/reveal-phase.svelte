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
    const secretHeadline = $derived(card.word ?? "Du bist der Impostor");
    const secretHeadlineClass = $derived(
        card.word ? "text-5xl text-black sm:text-6xl" : "text-4xl text-red-600 sm:text-5xl",
    );

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
        class={`flex min-h-[22rem] w-full flex-1 touch-none flex-col items-center justify-center gap-6 rounded-[2rem] border-2 bg-white px-8 py-10 text-center text-black shadow-sm transition-transform select-none ${
            isHoldingCard ? "border-primary/20" : "border-red-700/70 active:scale-[0.99]"
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
        <div class="flex w-full max-w-xl flex-col items-center gap-8">
            <div class="flex flex-col items-center gap-3 text-center">
                <p
                    class={`rounded-full px-4 py-1 text-xs font-semibold tracking-[0.35em] uppercase transition-colors duration-200 ${
                        isHoldingCard ? "bg-primary/10 text-primary" : "bg-red-50 text-red-700"
                    }`}>
                    Geheime Karte
                </p>
                <p class="text-sm text-black/60">
                    {isHoldingCard ? "Loslassen zum Verbergen" : "Gedrückt halten zum Aufdecken"}
                </p>
            </div>

            <div
                class="relative flex min-h-[12rem] w-full items-center justify-center overflow-hidden rounded-[1.75rem] border border-black/10 bg-neutral-50 px-6 py-8">
                <div
                    class={`flex max-w-lg flex-col items-center gap-4 text-center transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none ${
                        isHoldingCard
                            ? "translate-y-4 rotate-[1.5deg] opacity-100"
                            : "-translate-y-4 -rotate-[1.5deg] opacity-0"
                    }`}>
                    <p class="text-sm font-semibold tracking-[0.35em] text-primary uppercase">
                        {card.label}
                    </p>

                    <p
                        class={`font-black tracking-[0.2em] text-balance uppercase ${secretHeadlineClass}`}>
                        {secretHeadline}
                    </p>

                    {#if card.hint}
                        <p class="max-w-sm text-base text-black/65">Hinweis: {card.hint}</p>
                    {/if}
                </div>

                <div
                    class={`pointer-events-none absolute inset-x-6 top-1/2 flex -translate-y-1/2 justify-center transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                        isHoldingCard ? "-translate-y-[5.5rem] -rotate-[10deg]" : "rotate-[-2deg]"
                    }`}>
                    <div
                        class="flex min-h-[4.75rem] w-full max-w-[24rem] items-center justify-center rounded-xl border border-red-900/60 bg-red-600 px-6 py-4 shadow-[0_18px_40px_-24px_rgba(127,29,29,0.85)] will-change-transform">
                        <p class="text-3xl font-black tracking-[0.35em] text-white uppercase">
                            TOP SECRET
                        </p>
                    </div>
                </div>
            </div>
        </div>
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
