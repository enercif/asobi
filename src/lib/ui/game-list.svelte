<script lang="ts">
    import type { Game } from "$lib/types/game.type";
    import {
        type EmblaCarouselType,
        type EmblaOptionsType,
        type EmblaPluginType,
    } from "embla-carousel";
    import useEmblaCarousel from "embla-carousel-svelte";

    interface Props {
        games: Game[];
    }

    let { games }: Props = $props();

    // Center snapped slide
    let options: EmblaOptionsType = {
        align: "center",
        dragFree: true,
        containScroll: false,
        loop: false,
    };

    let plugins: EmblaPluginType[] = [];

    let emblaApi: EmblaCarouselType | undefined;

    let activeSnap = $state(0);
    let scrollSnaps: number[] = $state([]);

    // Per-slide tweened values (rotation/translate/scale/opacity)
    let slideStyles: Array<{ r: number; x: number; s: number; o: number }> = $state([]);
    let isSnapping = $state(false);

    function snapToSlide(index: number) {
        emblaApi?.scrollTo(index);
    }

    const setupSnaps = (api: EmblaCarouselType) => {
        scrollSnaps = api.scrollSnapList();
        // ensure slideStyles matches length immediately
        if (slideStyles.length !== scrollSnaps.length) {
            slideStyles = Array.from({ length: scrollSnaps.length }, () => ({
                r: 0,
                x: 0,
                s: 1,
                o: 1,
            }));
        }
    };

    const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

    function updateTween(api: EmblaCarouselType) {
        const slides = api.slideNodes();
        if (slides.length === 0) return;

        const viewport = api.rootNode();
        const viewportRect = viewport.getBoundingClientRect();
        const viewportCenterX = viewportRect.left + viewportRect.width / 2;

        console.log("Updating tween values, active snap:", api.selectedScrollSnap());

        activeSnap = api.selectedScrollSnap();

        // Tune these values"
        const maxRot = 15; // degrees at ~1 slide width away
        const maxX = 0; // px translate at ~1 slide width away
        const minScale = 0.92; // scale at >= 1 slide width away
        const minOpacity = 0.75;

        slideStyles = slides.map((slide) => {
            const rect = slide.getBoundingClientRect();
            const slideCenterX = rect.left + rect.width / 2;
            const distancePx = slideCenterX - viewportCenterX;
            const distance = rect.width > 0 ? distancePx / rect.width : 0;
            const abs = Math.abs(distance);
            const t = clamp(abs, 0, 1);
            const dir = clamp(distance, -1, 1);

            const r = dir * maxRot;
            const x = dir * maxX;
            const s = 1 - (1 - minScale) * t;
            const o = 1 - (1 - minOpacity) * t;

            return { r, x, s, o };
        });
    }

    const getNearestSnap = (api: EmblaCarouselType) => {
        const snaps = api.scrollSnapList();
        const progress = api.scrollProgress();
        let nearestIndex = 0;
        let minDiff = Infinity;
        snaps.forEach((snap, index) => {
            const diff = Math.abs(snap - progress);
            if (diff < minDiff) {
                minDiff = diff;
                nearestIndex = index;
            }
        });
        return nearestIndex;
    };

    const snapToNearest = (api: EmblaCarouselType) => {
        console.log("Start snap to nearest");

        setTimeout(() => {
            const target = getNearestSnap(api);
            console.log("Snapping to nearest index:", target);
            isSnapping = true;
            api.scrollTo(target);
            isSnapping = false;
        }, 500); // reset snapping state after animation duration
    };

    function setupCarousel(embla: EmblaCarouselType) {
        setupSnaps(embla);
        updateTween(embla);
    }

    const onInit = (event: CustomEvent<EmblaCarouselType>) => {
        emblaApi = event.detail;

        setupCarousel(emblaApi);

        emblaApi.on("reInit", () => {
            setupCarousel(emblaApi!);
        });

        // Smooth during drag and when snapping
        emblaApi.on("scroll", () => updateTween(emblaApi!));
        emblaApi.on("select", () => {
            if (!isSnapping) {
                snapToNearest(emblaApi!);
            } else {
                isSnapping = false;
            }
            updateTween(emblaApi!);
        });
    };
</script>

<!-- Embla -->
<div class="w-full" use:useEmblaCarousel={{ options, plugins }} onemblaInit={onInit}>
    <div class="flex touch-pan-y touch-pinch-zoom gap-5">
        {#each games as game, index}
            <a
                href={game.link}
                class="slide rounded-2xl w-52 bg-[#A6FAFF] aspect-2/3 basis-[70%] min-w-0 shrink-0 grow-0"
                style="
                            --r: {slideStyles[index]?.r ?? 0}deg;
                            --x: {slideStyles[index]?.x ?? 0}px;
                            --s: {slideStyles[index]?.s ?? 1};
                            --o: {slideStyles[index]?.o ?? 1};
                        "
            >
                <!-- Example content -->
                <div class="p-4 font-bold">{game.name}</div>
            </a>
        {/each}
    </div>
</div>

<!-- Dots -->
<div class="flex flex-row gap-2 items-center mx-auto">
    {#each scrollSnaps as _, index (index)}
        <button
            aria-label="Button Index {index}"
            class="rounded-full"
            class:bg-orange-500={index === activeSnap}
            class:bg-black={index !== activeSnap}
            class:size-3={index === activeSnap}
            class:size-2={index !== activeSnap}
            onclick={() => snapToSlide(index)}
        ></button>
    {/each}
</div>

<style>
    .slide {
        transform: translateX(var(--x)) rotate(var(--r)) scale(var(--s));
        opacity: var(--o);
        transform-origin: 50% 80%;
        will-change: transform, opacity;

        /* Smooth animation when snapping */
        transition:
            transform 420ms cubic-bezier(0.22, 1, 0.36, 1),
            opacity 420ms cubic-bezier(0.22, 1, 0.36, 1);
    }
</style>
