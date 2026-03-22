<script lang="ts">
    import { gamesList } from "$lib/games/gameslist";
    import GameGrid from "$lib/ui/game-grid.svelte";
    import GameList from "$lib/ui/game-list.svelte";
    import Lever from "$lib/ui/lever.svelte";
    import {
        DicesIcon,
        GalleryHorizontalIcon,
        HeartIcon,
        LayoutGridIcon,
        SearchIcon,
    } from "@lucide/svelte";

    let deviceMode: "single" | "multi" = $state("single");
    let listMode: "grid" | "list" = $state("list");
    let leverActive = $state(false);
    let gameListRef = $state<
        | {
              spinToRandomGame: () => Promise<number>;
          }
        | undefined
    >();

    let searchQuery = $state("");
    let filteredGames = $derived(
        gamesList.filter((game) => game.name.toLowerCase().includes(searchQuery.toLowerCase())),
    );

    function toggleListMode() {
        listMode = listMode === "list" ? "grid" : "list";
    }
</script>

<div class="flex size-full flex-col gap-10 pb-30">
    <div class="flex flex-row gap-2">
        <div class="flex w-full flex-row items-center gap-2 rounded-lg bg-white px-2">
            <SearchIcon size={28} />
            <input
                bind:value={searchQuery}
                class="w-0 min-w-0 shrink grow text-base outline-0"
                placeholder="Search" />
        </div>
        <button
            class="flex size-12 shrink-0 items-center justify-center rounded-lg bg-white"
            onclick={toggleListMode}>
            {#if listMode === "list"}
                <GalleryHorizontalIcon size={28} />
            {:else}
                <LayoutGridIcon size={28} />
            {/if}
        </button>

        <button class="flex size-12 shrink-0 items-center justify-center rounded-lg bg-white">
            <HeartIcon size={28} />
        </button>

        <button
            class="flex size-12 shrink-0 items-center justify-center rounded-lg bg-white"
            onclick={() => (leverActive = !leverActive)}>
            <DicesIcon size={28} />
        </button>
    </div>

    {#if listMode === "list"}
        <GameList bind:this={gameListRef} games={filteredGames} />
    {:else}
        <GameGrid />
    {/if}
</div>

<Lever active={leverActive} {gameListRef} />
