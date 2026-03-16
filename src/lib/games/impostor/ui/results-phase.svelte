<script lang="ts">
    import { impostorGameState } from "../states/impostor.game.state.svelte";

    type Props = {
        onNextGame: () => void;
    };

    let { onNextGame }: Props = $props();

    let players = $derived(impostorGameState.players);

    let impostorPlayers = $derived.by(() => players.filter((player) => player.role === "impostor"));
</script>

<div class="flex size-full flex-col justify-start">
    <div class="flex flex-col gap-8 rounded-4xl bg-white px-8 py-10 text-center shadow-sm">
        <div class="flex flex-col gap-3">
            <h2 class="text-4xl font-bold text-balance text-black">Impostor aufgedeckt</h2>
        </div>

        <div class="grid gap-3 text-left sm:grid-cols-2">
            <div class="rounded-2xl bg-black/3 px-5 py-4">
                <p class="text-sm font-semibold tracking-wider text-black/45">
                    {impostorPlayers.length > 1 ? "Die Impostor waren" : "Der Impostor war"}
                </p>
                <div class="flex flex-wrap items-center justify-start gap-3">
                    {#each impostorPlayers as player (player.id)}
                        <span class="mt-2 text-base font-semibold text-red-600">
                            {player.name}
                        </span>
                    {/each}
                </div>
            </div>
            <div class="rounded-2xl bg-black/3 px-5 py-4">
                <p class="text-sm font-semibold tracking-wider text-black/45">Startspieler</p>
                <p class="mt-2 text-base font-semibold text-black">
                    {impostorGameState.startingPlayerName}
                </p>
            </div>
            <div class="rounded-2xl bg-black/3 px-5 py-4">
                <p class="text-sm font-semibold tracking-wider text-black/45">Gesuchtes Wort</p>
                <p class="mt-2 text-base font-semibold text-black">
                    {impostorGameState.selectedWords.word}
                </p>
            </div>
        </div>
    </div>

    <button
        class="mt-auto mb-10 w-full rounded-xl bg-primary px-6 py-3 text-lg font-semibold text-white"
        type="button"
        onclick={onNextGame}>
        Nächstes Spiel
    </button>
</div>
