<script lang="ts">
    import { gamesList } from "$lib/games/gameslist";
    import { favouritesState } from "$lib/state/favourites.state.svelte";
    import { globalSettings } from "$lib/state/settings.state.svelte";
    import type { ListStyle } from "$lib/types/settings.type";
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

    let listMode: ListStyle = $derived(globalSettings.current.listStyle);

    let showFavorites = $derived(globalSettings.current.showFavoritesOnly);
    let favouritePressed = $state(false);

    let leverActive = $state(false);
    let leverPressed = $state(false);

    type GameRef = { spinToRandomGame: () => Promise<number> } | undefined;

    let gameListRef = $state<GameRef>();
    let gameGridRef = $state<GameRef>();

    let activeGameRef = $derived(listMode === "carousel" ? gameListRef : gameGridRef);

    let searchQuery = $state("");
    let filteredGames = $derived(
        gamesList.filter((game) => {
            const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFavorite = !showFavorites || favouritesState.current.includes(game.name);

            return matchesSearch && matchesFavorite;
        }),
    );

    function toggleListMode() {
        globalSettings.current.listStyle =
            globalSettings.current.listStyle === "carousel" ? "grid" : "carousel";
    }

    function handleFavoriteClick() {
        globalSettings.current.showFavoritesOnly = !globalSettings.current.showFavoritesOnly;
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
                data-active={listMode === "carousel"}
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
        {#if listMode === "carousel"}
            {#key filteredGames}
                <GameList bind:this={gameListRef} games={filteredGames} />
            {/key}
        {:else}
            <GameGrid bind:this={gameGridRef} games={filteredGames} />
        {/if}
    </div>
</div>

<Lever active={leverActive} gameRef={activeGameRef} />
