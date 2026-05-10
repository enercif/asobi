<script lang="ts">
    import type { Game } from "$lib/types/game.type";
    import { TimerIcon, UsersIcon } from "@lucide/svelte";

    interface Props {
        games: Game[];
    }

    let { games }: Props = $props();

    let cardElements: HTMLDivElement[] = $state([]);
    let highlightedIndex = $state(-1);
    let isSpinning = $state(false);

    export async function spinToRandomGame(): Promise<number> {
        if (isSpinning || games.length < 2) return -1;

        isSpinning = true;

        const targetIndex = Math.floor(Math.random() * games.length);
        const start = highlightedIndex >= 0 ? highlightedIndex : 0;
        const laps = 3;
        const stepsToTarget = (targetIndex - start + games.length) % games.length || games.length;
        const totalSteps = laps * games.length + stepsToTarget;

        await new Promise<void>((resolve) => {
            let step = 0;

            const tick = () => {
                step++;
                highlightedIndex = (start + step) % games.length;

                if (step >= totalSteps) {
                    isSpinning = false;
                    cardElements[targetIndex]?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                    resolve();
                    return;
                }

                const progress = step / totalSteps;
                const delay = 40 + 280 * Math.pow(progress, 2);
                setTimeout(tick, delay);
            };

            setTimeout(tick, 40);
        });

        return targetIndex;
    }
</script>

<div
    class="grid h-full min-h-0 grid-cols-2 gap-5 overflow-y-auto pb-30 [-ms-overflow-style:none] [scrollbar-width:none] md:grid-cols-3 lg:grid-cols-4">
    {#each games as game, index (game.link + game.name)}
        <a href={game.link}>
            <div
                bind:this={cardElements[index]}
                class="relative aspect-2/3 overflow-hidden rounded-2xl bg-white will-change-transform">
                <img
                    alt={game.name}
                    class="game-cover size-full object-cover"
                    src={game.cover}
                    data-flip-id={`game-${game.name}`} />

                <div
                    class="absolute inset-0 bg-linear-to-b from-transparent via-transparent
                          to-black/85 to-95%">
                </div>

                <div
                    class="absolute bottom-0 left-0 flex h-fit w-full flex-col gap-1.5 px-5 pb-6 text-white">
                    <p class="text-xl font-bold uppercase">{game.name}</p>

                    <div class="flex flex-row gap-3">
                        <div class="flex flex-row gap-1">
                            <UsersIcon size={20} />
                            <p class="text-sm font-medium">2+</p>
                        </div>

                        <div class="flex flex-row gap-1">
                            <TimerIcon size={20} />
                            <p class="text-sm font-medium">5m</p>
                        </div>
                    </div>
                </div>

                {#if highlightedIndex === index}
                    <div
                        class="pointer-events-none absolute inset-0 rounded-2xl ring-4 ring-primary ring-inset">
                    </div>
                {/if}
            </div>
        </a>
    {/each}
</div>
