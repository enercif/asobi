<script lang="ts">
    import { m } from "$lib/paraglide/messages";
    import GameGrid from "$lib/ui/game-grid.svelte";
    import GameList from "$lib/ui/game-list.svelte";
    import { Columns2Icon, Grid2x2Icon, SearchIcon } from "@lucide/svelte";

    let deviceMode: "single" | "multi" = $state("single");
    let listMode: "grid" | "list" = $state("list");
</script>

<div class="flex size-full flex-col gap-8">
    <div class="flex flex-row items-start justify-between gap-5">
        <p class="text-5xl font-bold">{m.sad_active_mole_bask()}</p>

        <div class="flex flex-col gap-2">
            <button
                class="flex size-12 items-center justify-center rounded-lg bg-white"
                onclick={() => {
                    listMode = listMode === "list" ? "grid" : "list";
                }}>
                {#if listMode === "list"}
                    <Columns2Icon size={28} />
                {:else}
                    <Grid2x2Icon size={28} />
                {/if}
            </button>

            <button class="flex size-12 items-center justify-center rounded-lg bg-white">
                <SearchIcon size={28} />
            </button>
        </div>
    </div>

    {#if listMode === "list"}
        <GameList />
    {:else}
        <GameGrid />
    {/if}
</div>
