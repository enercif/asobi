<script lang="ts">
    import type { ImpostorGameResult } from "$lib/games/impostor/types";

    type Props = {
        result: ImpostorGameResult;
        onNextGame: () => void;
    };

    let { result, onNextGame }: Props = $props();

    let impostorPlayers = $derived.by(() =>
        result.round.players.filter((player) => result.impostorPlayerIds.includes(player.id)),
    );
    let startingPlayer = $derived.by(
        () => result.round.players.find((player) => player.id === result.startingPlayerId) ?? null,
    );
    let endReasonLabel = $derived(
        result.endedReason === "timer" ? "Zeit abgelaufen" : "Runde beendet",
    );
</script>

<div class="flex flex-1 flex-col gap-8 rounded-[2rem] bg-white px-8 py-10 text-center shadow-sm">
    <div class="flex flex-col gap-3">
        <p class="text-sm font-semibold tracking-[0.35em] text-primary uppercase">
            {endReasonLabel}
        </p>
        <h2 class="text-4xl font-bold text-balance text-black">Impostors aufgedeckt</h2>
        <p class="mx-auto max-w-md text-lg text-black/65">
            {startingPlayer?.name ?? "Ein Spieler"} hat begonnen. Das gesuchte Wort war
            <span class="font-bold text-black">{result.secretWord.word}</span>.
        </p>
    </div>

    <div class="flex flex-col gap-4 rounded-3xl bg-black/[0.03] px-6 py-6">
        <p class="text-sm font-semibold tracking-[0.3em] text-black/45 uppercase">
            {impostorPlayers.length > 1 ? "Die Impostors waren" : "Der Impostor war"}
        </p>
        <div class="flex flex-wrap items-center justify-center gap-3">
            {#each impostorPlayers as player (player.id)}
                <span class="rounded-full bg-red-600 px-4 py-2 text-base font-semibold text-white">
                    {player.name}
                </span>
            {/each}
        </div>
    </div>

    <div class="grid gap-3 text-left sm:grid-cols-2">
        <div class="rounded-2xl bg-black/[0.03] px-5 py-4">
            <p class="text-sm font-semibold tracking-[0.25em] text-black/45 uppercase">Kategorie</p>
            <p class="mt-2 text-lg font-semibold text-black">{result.secretWord.categoryName}</p>
        </div>
        <div class="rounded-2xl bg-black/[0.03] px-5 py-4">
            <p class="text-sm font-semibold tracking-[0.25em] text-black/45 uppercase">
                Startspieler
            </p>
            <p class="mt-2 text-lg font-semibold text-black">
                {startingPlayer?.name ?? "Unbekannt"}
            </p>
        </div>
    </div>

    <button
        class="mt-auto w-full rounded-xl bg-primary px-6 py-3 text-lg font-semibold text-white"
        type="button"
        onclick={onNextGame}>
        Nächstes Spiel
    </button>
</div>
