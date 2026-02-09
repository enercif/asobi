<script lang="ts">
    import { Columns2Icon, Grid2x2Icon, SearchIcon, UserIcon, UsersIcon } from "@lucide/svelte";
    import { type EmblaCarouselType, type EmblaOptionsType } from "embla-carousel";
    import useEmblaCarousel from "embla-carousel-svelte";

    let deviceMode: "single" | "multi" = $state("single");
    let listMode: "grid" | "list" = $state("list");

    let options: EmblaOptionsType = { dragFree: true };
    let plugins: any = [];

    let emblaApi: EmblaCarouselType;
    let activeSnap = $state(0);
    let scrollSnaps: number[] = $state([]);

    const goTo = (index: any) => emblaApi?.scrollTo(index);
    const setupSnaps = (emblaApi: EmblaCarouselType) => (scrollSnaps = emblaApi.scrollSnapList());
    const setActiveSnap = (emblaApi: EmblaCarouselType) => {
        activeSnap = emblaApi.selectedScrollSnap();
    };

    const onInit = (event: CustomEvent<EmblaCarouselType>) => {
        emblaApi = event.detail;
        setupSnaps(emblaApi);
        emblaApi.on("reInit", setupSnaps);
        emblaApi.on("reInit", setActiveSnap);
        emblaApi.on("select", setActiveSnap);
    };
</script>

<div class="flex flex-col size-full gap-10">
    <div class="flex flex-row items-center justify-between">
        <p class="text-xl font-bold">Asobi</p>

        <p class="bg-white px-4 py-1 rounded-lg">Enis</p>
    </div>

    <div class="flex flex-row items-start justify-between gap-10">
        <p class="text-5xl font-bold">Pick a Game to Play</p>

        <div class="flex flex-col gap-2">
            <button
                class="bg-white rounded-lg size-14 flex items-center justify-center"
                onclick={() => {
                    listMode === "list" ? (listMode = "grid") : (listMode = "list");
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
                    deviceMode === "single" ? (deviceMode = "multi") : (deviceMode = "single");
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

    <div class="px-20 relative mx-auto hidden">
        <div
            class="absolute -left-50 -bottom-10 rounded-2xl w-52 bg-[#A6FAFF] aspect-2/3 -rotate-25"
        ></div>
        <div class="rounded-2xl w-52 bg-[#A6FAFF] aspect-2/3"></div>
        <div
            class="absolute -right-50 -bottom-10 rounded-2xl w-52 bg-[#A6FAFF] aspect-2/3 rotate-25"
        ></div>
    </div>

    <div class="flex flex-row gap-2 items-center mx-auto hidden">
        <div class="size-2 bg-black rounded-full"></div>
        <div class="size-3 bg-orange-500 rounded-full"></div>
        <div class="size-2 bg-black rounded-full"></div>
    </div>

    <div class="w-full" use:useEmblaCarousel={{ options, plugins }} onemblaInit={onInit}>
        <div class="flex touch-pan-y touch-pinch-zoom gap-5">
            {#each Array(10), index}
                <div
                    class:-rotate-25={activeSnap - 1 === index}
                    class:-translate-x-14={activeSnap - 1 === index}
                    class:rotate-25={activeSnap + 1 === index}
                    class:translate-x-14={activeSnap + 1 === index}
                    class="rounded-2xl w-52 bg-[#A6FAFF] aspect-2/3 basis-[70%] min-w-0 shrink-0 grow-0"
                ></div>
            {/each}
        </div>
    </div>

    <div class="flex flex-row gap-2 items-center mx-auto">
        {#each scrollSnaps as _, index}
            <button
                aria-label="Button Index {index}"
                class="size-2 bg-black rounded-full"
                onclick={() => goTo(index)}
            ></button>
        {/each}
    </div>
</div>
