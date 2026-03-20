<script lang="ts">
    import GameGrid from "$lib/ui/game-grid.svelte";
    import GameList from "$lib/ui/game-list.svelte";
    import { GalleryHorizontalIcon, HeartIcon, LayoutGridIcon, SearchIcon } from "@lucide/svelte";

    let deviceMode: "single" | "multi" = $state("single");
    let listMode: "grid" | "list" = $state("list");
</script>

<div class="flex size-full flex-col gap-10">
    <div class="flex flex-row gap-2">
        <div class="flex size-12 w-full flex-row items-center gap-2 rounded-lg bg-white px-2">
            <SearchIcon size={28} />
            <input class="grow text-base outline-0" placeholder="Search your next obsession..." />
        </div>
        <button
            class="flex size-12 shrink-0 items-center justify-center rounded-lg bg-white"
            onclick={() => {
                listMode = listMode === "list" ? "grid" : "list";
            }}>
            {#if listMode === "list"}
                <GalleryHorizontalIcon size={28} />
            {:else}
                <LayoutGridIcon size={28} />
            {/if}
        </button>

        <button class="flex size-12 shrink-0 items-center justify-center rounded-lg bg-white">
            <HeartIcon size={28} />
        </button>
    </div>

    {#if listMode === "list"}
        <GameList />
    {:else}
        <GameGrid />
    {/if}
</div>
