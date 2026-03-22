<script lang="ts">
    import { gamesList } from "$lib/games/gameslist";
    import GameGrid from "$lib/ui/game-grid.svelte";
    import GameList from "$lib/ui/game-list.svelte";
    import {
        DicesIcon,
        GalleryHorizontalIcon,
        HeartIcon,
        LayoutGridIcon,
        SearchIcon,
    } from "@lucide/svelte";
    import { onDestroy } from "svelte";

    let deviceMode: "single" | "multi" = $state("single");
    let listMode: "grid" | "list" = $state("list");
    let leverActive = $state(false);
    let gameListRef = $state<
        | {
              spinToRandomGame: () => Promise<number>;
          }
        | undefined
    >();

    let leverHandle: HTMLButtonElement;
    let leverOffset = $state(0);
    let isPullingLever = $state(false);
    let isLeverAnimating = $state(false);
    let isLeverLocked = $state(false);

    let leverPointerOffset = 0;
    let leverResetTimer: ReturnType<typeof setTimeout> | undefined;

    let searchQuery = $state("");
    let filteredGames = $derived(
        gamesList.filter((game) => game.name.toLowerCase().includes(searchQuery.toLowerCase())),
    );

    const maxLeverPull = 208 - 40;
    const triggerLeverPull = 208 - 40;

    function toggleListMode() {
        listMode = listMode === "list" ? "grid" : "list";
    }

    function clearLeverResetTimer() {
        if (leverResetTimer) {
            clearTimeout(leverResetTimer);
            leverResetTimer = undefined;
        }
    }

    function resetLever(delay = 0) {
        clearLeverResetTimer();
        isPullingLever = false;
        isLeverAnimating = true;

        leverResetTimer = setTimeout(() => {
            leverOffset = 0;

            leverResetTimer = setTimeout(() => {
                isLeverAnimating = false;
                leverResetTimer = undefined;
            }, 320);
        }, delay);
    }

    async function activateLever() {
        if (isLeverAnimating || isLeverLocked || listMode !== "list" || !gameListRef) {
            return;
        }

        clearLeverResetTimer();
        isPullingLever = false;
        isLeverAnimating = true;
        isLeverLocked = true;
        leverOffset = maxLeverPull;

        await gameListRef.spinToRandomGame();

        isLeverLocked = false;
        resetLever();
    }

    function handleLeverPointerDown(event: PointerEvent) {
        if (isLeverAnimating || isLeverLocked || listMode !== "list") {
            return;
        }

        clearLeverResetTimer();
        isPullingLever = true;
        leverPointerOffset = event.clientY - leverOffset;
        leverHandle.setPointerCapture(event.pointerId);
    }

    function handleLeverPointerMove(event: PointerEvent) {
        if (!isPullingLever) {
            return;
        }

        leverOffset = Math.max(0, Math.min(maxLeverPull, event.clientY - leverPointerOffset));

        if (leverOffset >= triggerLeverPull) {
            leverHandle.releasePointerCapture(event.pointerId);
            void activateLever();
        }
    }

    function handleLeverPointerEnd(event: PointerEvent) {
        if (!isPullingLever) {
            return;
        }

        if (leverHandle.hasPointerCapture(event.pointerId)) {
            leverHandle.releasePointerCapture(event.pointerId);
        }

        resetLever();
    }

    onDestroy(() => {
        clearLeverResetTimer();
    });
</script>

<div class="flex size-full flex-col gap-10">
    <div class="flex flex-row gap-2">
        <div class="flex w-full flex-row items-center gap-2 rounded-lg bg-white px-2">
            <SearchIcon size={28} />
            <input
                bind:value={searchQuery}
                class="w-0 min-w-0 shrink grow text-base outline-0"
                placeholder="Search" />
        </div>
        <button
            class="flex size-12 shrink-0 items-center justify-center rounded-lg bg-white"
            onclick={toggleListMode}>
            {#if listMode === "list"}
                <GalleryHorizontalIcon size={28} />
            {:else}
                <LayoutGridIcon size={28} />
            {/if}
        </button>

        <button class="flex size-12 shrink-0 items-center justify-center rounded-lg bg-white">
            <HeartIcon size={28} />
        </button>

        <button
            class="flex size-12 shrink-0 items-center justify-center rounded-lg bg-white"
            onclick={() => (leverActive = !leverActive)}>
            <DicesIcon size={28} />
        </button>
    </div>

    {#if listMode === "list"}
        <GameList bind:this={gameListRef} games={filteredGames} />
    {:else}
        <GameGrid />
    {/if}
</div>

<div class="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 overflow-clip">
    <div
        class="flex h-60 w-20 items-start justify-center rounded-l-2xl bg-white py-4 pr-3 pl-5 transition-transform duration-300 ease-out {leverActive
            ? 'translate-x-0'
            : 'translate-x-full'}">
        <div class="relative flex h-full w-6 justify-center rounded-full bg-bg py-2">
            <div class=" h-full w-1 rounded-full bg-contrast/15"></div>

            <button
                bind:this={leverHandle}
                aria-label="Pull lever to spin the carousel"
                class={[
                    "pointer-events-auto absolute top-0 left-1/2 flex -translate-x-1/2 touch-none flex-col items-center outline-none",
                    isLeverLocked
                        ? "cursor-not-allowed"
                        : isPullingLever
                          ? "cursor-grabbing"
                          : "cursor-grab",
                    !isPullingLever && "transition-transform duration-300 ease-out",
                ]}
                disabled={isLeverLocked || listMode !== "list"}
                onclick={() => {
                    void activateLever();
                }}
                onpointercancel={handleLeverPointerEnd}
                onpointerdown={handleLeverPointerDown}
                onpointermove={handleLeverPointerMove}
                onpointerup={handleLeverPointerEnd}
                style={`transform:  translateY(${leverOffset}px);`}
                type="button">
                <span
                    class="flex size-10 items-center justify-center rounded-full transition-colors duration-200 {isLeverLocked
                        ? 'bg-primary-dark'
                        : 'bg-primary'}"></span>
            </button>
        </div>
    </div>
</div>
