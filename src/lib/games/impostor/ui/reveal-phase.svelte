<script lang="ts">
    import { onMount } from "svelte";
    import { impostorGameState } from "../states/impostor.game.state.svelte";
    import { impostorSettingsState } from "../states/impostor.state.svelte";

    type Props = {
        onNextPhase: () => void;
    };

    let { onNextPhase }: Props = $props();

    let isHoldingCard = $state(false);
    let hasHeldCard = $state(false);
    let currentPlayerIndex = $state(0);
    let randomHint = $state("");

    let isLastPlayer = $derived(currentPlayerIndex === impostorGameState.players.length - 1);

    let translateX = $state(0);
    let cardContainer: HTMLDivElement;

    function onPress() {
        isHoldingCard = true;
    }

    function onRelease() {
        isHoldingCard = false;
        hasHeldCard = true;
    }

    function getRandomHint() {
        const hints = impostorGameState.selectedWords.hints;
        return hints[Math.floor(Math.random() * hints.length)];
    }

    function onNextPlayer() {
        if (!hasHeldCard) return;
        currentPlayerIndex += 1;
        hasHeldCard = false;
        randomHint = getRandomHint();
        translateX -= cardContainer.clientWidth + 40;
    }

    onMount(() => {
        randomHint = getRandomHint();
    });
</script>

<div class=" flex h-full flex-col justify-center gap-4">
    <div
        class="mt-10 flex flex-row gap-10 transition-transform duration-500"
        style="translate: {translateX}px;"
        bind:this={cardContainer}>
        {#each impostorGameState.players as player, index}
            <button
                class="flex h-fit shrink-0 basis-full touch-none items-center justify-center gap-6 rounded-4xl bg-white px-8 py-10 text-center text-black shadow-sm transition-transform select-none"
                aria-pressed={isHoldingCard}
                type="button"
                onpointerdown={onPress}
                onpointerup={onRelease}
                onpointerleave={onRelease}>
                <div class="flex w-full max-w-xl flex-col items-center gap-8">
                    <h2 class="text-4xl font-bold text-black">{player.name}</h2>

                    <div class="relative flex min-h-48 w-full items-center justify-center">
                        <div
                            class={`flex max-w-lg flex-col items-center gap-1 text-center transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transition-none ${
                                isHoldingCard
                                    ? "translate-y-18 rotate-[1.5deg] opacity-100"
                                    : "translate-y-0 -rotate-[1.5deg] opacity-0"
                            }`}>
                            <p
                                class={`text-3xl font-extrabold tracking-[0.2em] text-balance uppercase ${player.role === "civilian" ? "text-black" : "text-red-600"}`}>
                                {player.role === "civilian"
                                    ? impostorGameState.selectedWords.word
                                    : "Impostor"}
                            </p>

                            {#if impostorSettingsState.hintsEnabled && player.role === "impostor"}
                                <p class="max-w-sm text-base font-semibold text-black">
                                    Hinweis: {randomHint}
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
                        {isHoldingCard
                            ? "Loslassen zum Verbergen"
                            : "Gedrückt halten zum Aufdecken"}
                    </p>
                </div>
            </button>
        {/each}
    </div>

    <p class="text-center text-base text-black/60">
        Spieler {currentPlayerIndex + 1} von {impostorGameState.players.length}
    </p>

    <div class="mt-auto mb-10 flex flex-col items-center gap-3 text-center">
        <button
            class="w-full rounded-xl bg-primary px-6 py-3 text-lg font-semibold text-white disabled:cursor-not-allowed disabled:bg-primary/50 disabled:text-white/70"
            type="button"
            disabled={!hasHeldCard}
            onclick={isLastPlayer ? onNextPhase : onNextPlayer}>
            {isLastPlayer ? "Diskussion starten" : "Nächster Spieler"}
        </button>
    </div>
</div>
