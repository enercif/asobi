<script lang="ts">
    import { gamesList } from "$lib/games/gameslist";
    import {
        type EmblaCarouselType,
        type EmblaOptionsType,
        type EmblaPluginType,
    } from "embla-carousel";
    import useEmblaCarousel from "embla-carousel-svelte";

    let options: EmblaOptionsType = {
        align: "center",
        dragFree: true,
        containScroll: false,
        loop: false,
    };
    let plugins: EmblaPluginType[] = [];
    let emblaApi: EmblaCarouselType | undefined;

    const maxRot = 15;
    const maxX = 0;
    const minScale = 0.92;
    const minOpacity = 0.75;

    let activeSnap = $state(0);
    let scrollSnaps: number[] = $state([]);

    let slideStyles: Array<{ r: number; x: number; s: number; o: number }> = $state([]);
    let isSnapping = $state(false);

    let viewportCenterX = 0;

    let throttle = 2;

    function snapToSlide(index: number) {
        emblaApi?.scrollTo(index);
    }

    const setupSnaps = (api: EmblaCarouselType) => {
        scrollSnaps = api.scrollSnapList();
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
        if (throttle < 2) {
            throttle++;
            return;
        }
        throttle = 0;

        const slides = api.slideNodes();
        if (slides.length === 0) return;

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
        activeSnap = api.selectedScrollSnap();
        setTimeout(() => {
            const target = getNearestSnap(api);
            isSnapping = true;
            api.scrollTo(target);
            isSnapping = false;
        }, 500);
    };

    function setupCarousel(embla: EmblaCarouselType) {
        const viewport = embla.rootNode();
        const viewportRect = viewport.getBoundingClientRect();
        viewportCenterX = viewportRect.left + viewportRect.width / 2;

        setupSnaps(embla);
        updateTween(embla);
    }

    function onScrollEvent(api: EmblaCarouselType) {
        updateTween(api);
    }

    function onSelectEvent(api: EmblaCarouselType) {
        isSnapping ? (isSnapping = false) : snapToNearest(api);
        updateTween(api);
    }

    const onInit = (event: CustomEvent<EmblaCarouselType>) => {
        emblaApi = event.detail;

        setupCarousel(emblaApi);

        emblaApi.on("reInit", () => {
            setupCarousel(emblaApi!);
        });

        emblaApi.on("scroll", () => onScrollEvent(emblaApi!));
        emblaApi.on("select", () => onSelectEvent(emblaApi!));
    };
</script>

<div class="w-full" use:useEmblaCarousel={{ options, plugins }} onemblaInit={onInit}>
    <div class="flex touch-pan-y touch-pinch-zoom gap-5">
        {#each gamesList as game, index}
            <a
                href={game.link}
                class="slide aspect-2/3 w-52 min-w-0 shrink-0 grow-0 basis-[70%] rounded-2xl"
                style="
                            --r: {slideStyles[index]?.r ?? 0}deg;
                            --x: {slideStyles[index]?.x ?? 0}px;
                            --s: {slideStyles[index]?.s ?? 1};
                            --o: {slideStyles[index]?.o ?? 1};
                        ">
                <img
                    src={game.cover}
                    alt={game.name}
                    class="h-full w-full rounded-2xl object-cover" />
            </a>
        {/each}
    </div>
</div>

<!-- Dots -->
<div class="mx-auto flex flex-row items-center gap-2">
    {#each scrollSnaps as _, index (index)}
        <button
            aria-label="Button Index {index}"
            class="rounded-full"
            class:bg-orange-500={index === activeSnap}
            class:bg-black={index !== activeSnap}
            class:size-3={index === activeSnap}
            class:size-2={index !== activeSnap}
            onclick={() => snapToSlide(index)}></button>
    {/each}
</div>

<style>
    .slide {
        transform: translateX(var(--x)) rotate(var(--r)) scale(var(--s));
        opacity: var(--o);
        transform-origin: 50% 80%;
        will-change: transform, opacity;

        transition:
            transform 420ms cubic-bezier(0.22, 1, 0.36, 1),
            opacity 420ms cubic-bezier(0.22, 1, 0.36, 1);
    }
</style>
