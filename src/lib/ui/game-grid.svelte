<script lang="ts">
    import { gamesList } from "$lib/games/gameslist";
</script>

<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 h-full pb-10 overflow-y-scroll">
    {#each gamesList as game}
        <a
            href={game.link}
            class="rounded-2xl bg-[#A6FAFF] aspect-2/3 flex items-center justify-center text-xl font-bold"
        >
            {game.name}
        </a>
    {/each}
</div>
