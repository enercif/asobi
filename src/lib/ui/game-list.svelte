<script lang="ts">
    import { horizontalLoop } from "$lib/helper/gsap.helper";
    import type { Game } from "$lib/types/game.type";
    import type { HorizontalLoopTimeline } from "$lib/types/gsap.types";
    import { TimerIcon, UsersIcon } from "@lucide/svelte";
    import { gsap } from "gsap";
    import { Draggable } from "gsap/Draggable";
    import { InertiaPlugin } from "gsap/InertiaPlugin";
    import { onMount } from "svelte";

    gsap.registerPlugin(Draggable, InertiaPlugin);

    interface Props {
        games: Game[];
    }

    let { games }: Props = $props();

    let carousel: HTMLDivElement;
    let cardElements: HTMLDivElement[] = $state([]);

    let currentIndex = $state(0);
    let isSpinning = $state(false);

    let loop: HorizontalLoopTimeline | undefined;

    const maxRotation = 15;
    const minScale = 0.92;
    const minOpacity = 0.75;
    const snapTween: gsap.TweenVars = { duration: 0.85, ease: "power3.out" };

    export async function spinToRandomGame() {
        if (!loop || games.length < 2 || isSpinning) {
            return currentIndex;
        }

        isSpinning = true;

        const currentTime = loop.time();
        const duration = loop.duration();
        const fullTurns = Math.floor(Math.random() * 6) + 5;
        const targetIndex = Math.floor(Math.random() * games.length);
        let targetTime = loop.times[targetIndex] + duration * fullTurns;

        while (targetTime <= currentTime + duration * 2.5) {
            targetTime += duration;
        }

        await new Promise<void>((resolve) => {
            loop?.tweenTo(targetTime, {
                duration: 2.8,
                ease: "power4.inOut",
                modifiers: {
                    time: gsap.utils.wrap(0, duration),
                },
                onComplete: () => {
                    isSpinning = false;
                    resolve();
                },
                onInterrupt: () => {
                    isSpinning = false;
                    resolve();
                },
                overwrite: true,
            });
        });

        return targetIndex;
    }

    onMount(() => {
        if (!carousel) return;

        gsap.set(carousel, { overflow: "visible", scrollSnapType: "none" });

        const slideElements = carousel.querySelectorAll<HTMLElement>("[data-slide]");

        const updateCardTilt = () => {
            const viewportRect = carousel.getBoundingClientRect();
            const viewportCenterX = viewportRect.left + viewportRect.width / 2;

            carousel.querySelectorAll<HTMLElement>("[data-slide]").forEach((slide, index) => {
                const card = cardElements[index];

                if (!card) return;

                const rect = slide.getBoundingClientRect();
                const slideCenterX = rect.left + rect.width / 2;
                const distance = rect.width > 0 ? (slideCenterX - viewportCenterX) / rect.width : 0;
                const direction = gsap.utils.clamp(-1, 1, distance);
                const offset = Math.abs(direction);

                gsap.set(card, {
                    opacity: gsap.utils.interpolate(1, minOpacity, offset),
                    rotate: direction * maxRotation,
                    scale: gsap.utils.interpolate(1, minScale, offset),
                    transformOrigin: "50% 80%",
                });
            });
        };

        const handleResize = () => updateCardTilt();
        window.addEventListener("resize", handleResize);

        if (slideElements.length > 1) {
            loop = horizontalLoop(
                slideElements,
                {
                    center: true,
                    draggable: true,
                    onChange: (_, index) => {
                        currentIndex = index;
                    },
                    paused: true,
                },
                updateCardTilt,
            );

            loop?.toIndex(0, { duration: 0 });
        }

        updateCardTilt();

        return () => {
            window.removeEventListener("resize", handleResize);
            loop?.kill();
            loop?.draggable?.kill();
            loop = undefined;
        };
    });

    function goTo(index: number) {
        if (isSpinning) {
            return;
        }

        loop?.toIndex(index, snapTween);
    }
</script>

<div class="-mx-5 overflow-hidden">
    <div
        bind:this={carousel}
        aria-label="Game carousel"
        class={[
            "flex items-center gap-5 overflow-x-auto px-5 py-3 [-ms-overflow-style:none] [scrollbar-width:none]",
            games.length === 1 && "justify-center",
        ]}>
        {#each games as game, index (game.link + game.name)}
            <a
                data-slide
                href={game.link}
                aria-current={currentIndex === index ? "true" : undefined}
                class={["block shrink-0 basis-[70%] sm:basis-[48%] lg:basis-88"]}
                onclick={(event) => {
                    if (game.link === "#") {
                        event.preventDefault();
                        if (games.length > 1) {
                            goTo(index);
                        }
                        return;
                    }

                    if (games.length > 1 && currentIndex !== index) {
                        event.preventDefault();
                        goTo(index);
                    }
                }}>
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
                        class="absolute bottom-0 left-0 flex h-fit w-full flex-col gap-1.5 px-5 pb-8 text-white">
                        <p class="text-3xl font-bold uppercase">{game.name}</p>

                        <div class="flex flex-row gap-5">
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
                </div>
            </a>
        {/each}
    </div>

    {#if games.length > 1}
        <div class="mt-3 flex justify-center gap-2">
            {#each games as game, index (game.link + game.name)}
                <button
                    aria-label={`Go to ${game.name}`}
                    class={[
                        "rounded-full transition-all duration-200",
                        currentIndex === index ? "w-5 bg-primary" : "size-2 bg-contrast/30",
                    ]}
                    onclick={() => {
                        goTo(index);
                    }}
                    type="button"></button>
            {/each}
        </div>
    {/if}
</div>
