<script lang="ts">
    import { onDestroy } from "svelte";

    interface Props {
        active: boolean;
        gameRef?:
            | {
                  spinToRandomGame: () => Promise<number>;
              }
            | undefined;
    }

    let { active, gameRef }: Props = $props();

    let leverHandle: HTMLButtonElement;
    let leverOffset = $state(0);
    let isPullingLever = $state(false);
    let isLeverAnimating = $state(false);
    let isLeverLocked = $state(false);

    let leverPointerOffset = 0;
    let leverResetTimer: ReturnType<typeof setTimeout> | undefined;

    const maxLeverPull = 208 - 40;
    const triggerLeverPull = 208 - 40;

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
        if (isLeverAnimating || isLeverLocked || !gameRef) {
            return;
        }

        clearLeverResetTimer();
        isPullingLever = false;
        isLeverAnimating = true;
        isLeverLocked = true;
        leverOffset = maxLeverPull;

        await gameRef.spinToRandomGame();

        isLeverLocked = false;
        resetLever();
    }

    function handleLeverPointerDown(event: PointerEvent) {
        if (isLeverAnimating || isLeverLocked) {
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

<div class="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 overflow-x-clip">
    <div
        class="ml-auto h-8 w-8 rounded-br-xl bg-transparent shadow-[5px_10px_0px_white] transition-transform duration-300 ease-out {active
            ? 'translate-x-0'
            : 'translate-x-full'}">
    </div>

    <div
        class="flex h-60 w-20 items-start justify-center rounded-l-2xl bg-white py-4 pr-3 pl-5 transition-transform duration-300 ease-out {active
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
                disabled={isLeverLocked}
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

    <div
        class="ml-auto h-8 w-8 rounded-tr-xl bg-transparent shadow-[5px_-10px_0px_white] transition-transform duration-300 ease-out {active
            ? 'translate-x-0'
            : 'translate-x-full'}">
    </div>
</div>
