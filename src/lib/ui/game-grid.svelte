<script lang="ts">
    import { gamesList } from "$lib/games/gameslist";
</script>

<div class="grid h-full grid-cols-2 gap-5 overflow-y-scroll pb-20 md:grid-cols-3 lg:grid-cols-4">
    {#each gamesList as game}
        <a
            href={game.link}
            class="flex aspect-2/3 items-center justify-center rounded-2xl bg-[#A6FAFF] text-xl font-bold">
            {game.name}
        </a>
    {/each}
</div>
