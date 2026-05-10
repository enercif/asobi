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

    let listMode: "grid" | "list" = $state("list");

    let showFavorites = $state(false);
    let favouritePressed = $state(false);

    let leverActive = $state(false);
    let leverPressed = $state(false);

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

    function handleFavoriteClick() {
        showFavorites = !showFavorites;
        favouritePressed = true;

        setTimeout(() => {
            favouritePressed = false;
        }, 300);
    }

    async function handleLeverClick() {
        leverActive = !leverActive;
        leverPressed = true;

        setTimeout(() => {
            leverPressed = false;
        }, 300);
    }
</script>

<div class="flex min-h-0 flex-1 flex-col gap-10">
    <div class="flex shrink-0 flex-row gap-2">
        <div class="flex w-full flex-row items-center gap-2 rounded-lg bg-white px-2">
            <SearchIcon size={28} />
            <input
                bind:value={searchQuery}
                class="w-0 min-w-0 shrink grow text-base outline-0"
                placeholder="Search" />
        </div>
        <button
            class="relative flex size-12 shrink-0 items-center justify-center rounded-lg bg-white"
            onclick={toggleListMode}>
            <GalleryHorizontalIcon
                data-active={listMode === "list"}
                size={28}
                class="absolute scale-0 rotate-90 transition-all duration-300 ease-out data-[active=true]:scale-100 data-[active=true]:rotate-0" />
            <LayoutGridIcon
                data-active={listMode === "grid"}
                size={28}
                class="absolute scale-0 -rotate-90 transition-all duration-300 ease-out data-[active=true]:scale-100 data-[active=true]:rotate-0" />
        </button>

        <button
            class="flex size-12 shrink-0 items-center justify-center rounded-lg bg-white"
            onclick={handleFavoriteClick}>
            <HeartIcon
                size={28}
                data-active={showFavorites}
                data-pressed={favouritePressed}
                fill="currentColor"
                class="fill-transparent transition-all duration-300 data-[active=true]:fill-primary  data-[active=true]:text-primary data-[pressed=true]:animate-grow-once" />
        </button>

        <button
            class="flex size-12 shrink-0 items-center justify-center rounded-lg bg-white"
            onclick={handleLeverClick}>
            <DicesIcon
                size={28}
                data-pressed={leverPressed}
                class="transition-all duration-300 data-[pressed=true]:animate-jiggle-once" />
        </button>
    </div>

    <div class="relative min-h-0 flex-1">
        {#if listMode === "list"}
            {#key filteredGames}
                <GameList bind:this={gameListRef} games={filteredGames} />
            {/key}
        {:else}
            <GameGrid games={filteredGames} />
        {/if}
    </div>
</div>

<Lever active={leverActive} {gameListRef} />
