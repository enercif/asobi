<script lang="ts">
    import { m } from "$lib/paraglide/messages";
    import type { Game } from "$lib/types/game.type";
    import GameGrid from "$lib/ui/game-grid.svelte";
    import GameList from "$lib/ui/game-list.svelte";
    import { Columns2Icon, Grid2x2Icon, SearchIcon, UserIcon, UsersIcon } from "@lucide/svelte";

    let deviceMode: "single" | "multi" = $state("single");
    let listMode: "grid" | "list" = $state("list");

    const games: Game[] = [
        { name: "Impostor", link: "/impostor" },
        { name: "Werwolf", link: "/werwolf" },
        { name: "Finde den Lügner", link: "/finde-den-luegner" },
        { name: "Stadt Land Fluss", link: "/stadt-land-fluss" },
        { name: "Quiz", link: "/quiz" },
        { name: "Pictionary", link: "/pictionary" },
        { name: "Scharade", link: "/scharade" },
        { name: "Mafia", link: "/mafia" },
    ];
</script>

<div class="flex flex-col size-full gap-10">
    <div class="flex flex-row items-center justify-between">
        <p class="text-xl font-bold">Asobi</p>
        <p class="bg-white px-4 py-1 rounded-lg">Enis</p>
    </div>

    <div class="flex flex-row items-start justify-between gap-10">
        <p class="text-5xl font-bold">{m.sad_active_mole_bask()}</p>

        <div class="flex flex-col gap-2">
            <button
                class="bg-white rounded-lg size-14 flex items-center justify-center"
                onclick={() => {
                    listMode = listMode === "list" ? "grid" : "list";
                }}
            >
                {#if listMode === "list"}
                    <Columns2Icon size={28} />
                {:else}
                    <Grid2x2Icon size={28} />
                {/if}
            </button>

            <button
                class="bg-white rounded-lg size-14 flex items-center justify-center"
                onclick={() => {
                    deviceMode = deviceMode === "single" ? "multi" : "single";
                }}
            >
                {#if deviceMode === "single"}
                    <UserIcon size={28} />
                {:else}
                    <UsersIcon size={28} />
                {/if}
            </button>

            <button class="bg-white rounded-lg size-14 flex items-center justify-center">
                <SearchIcon size={28} />
            </button>
        </div>
    </div>

    {#if listMode === "list"}
        <GameList {games} />
    {:else}
        <GameGrid {games} />
    {/if}
</div>
