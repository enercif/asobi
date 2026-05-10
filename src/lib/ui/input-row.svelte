<script lang="ts">
    import { Trash2Icon } from "@lucide/svelte";

    const DELETE_WIDTH = 72;
    const SNAP_THRESHOLD = DELETE_WIDTH / 2;

    type Props = {
        value: string;
        placeholder?: string;
        oninput?: (
            event: Event & {
                currentTarget: EventTarget & HTMLInputElement;
            },
        ) => void;
        onDelete?: () => void;
    };

    let { value, placeholder, oninput, onDelete }: Props = $props();

    let offsetX = $state(0);
    let dragging = $state(false);
    let startX = 0;
    let startOffsetX = 0;
    let dragDistance = 0;

    function handlePointerDown(event: PointerEvent) {
        dragging = true;
        startX = event.clientX;
        startOffsetX = offsetX;
        dragDistance = 0;
        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    }

    function handlePointerMove(event: PointerEvent) {
        if (!dragging) return;
        dragDistance = event.clientX - startX;
        offsetX = Math.max(-DELETE_WIDTH, Math.min(0, startOffsetX + dragDistance));
    }

    function handlePointerUp() {
        if (!dragging) return;
        dragging = false;
        offsetX = offsetX < -SNAP_THRESHOLD ? -DELETE_WIDTH : 0;
    }

    function handlePointerCancel() {
        dragging = false;
        dragDistance = 0;
        offsetX = 0;
    }
    function getOpacity() {
        const opacity = Math.abs(offsetX) / DELETE_WIDTH;
        return Math.min(1, Math.max(0, opacity));
    }

    function onDeleteIntern() {
        offsetX = 0;
        onDelete?.();
    }
</script>

{#if onDelete}
    <div class="relative overflow-hidden rounded-2xl bg-inherit">
        <button
            aria-label="Delete input"
            class="absolute top-0 right-0 flex h-full w-18 items-center justify-center rounded-2xl bg-red-500 text-white"
            style="opacity: {getOpacity()};"
            tabindex={offsetX <= -SNAP_THRESHOLD ? 0 : -1}
            onclick={onDeleteIntern}>
            <Trash2Icon size={20} />
        </button>

        <input
            autocomplete="off"
            spellcheck="false"
            {placeholder}
            class="w-full rounded-2xl px-4 py-1.5 text-base ring-1 ring-transparent outline-hidden transition animate-in animate-out fade-in zoom-in-50 sm:text-lg"
            style="touch-action: pan-y; transform: translateX({offsetX}px); {!dragging
                ? 'transition: transform 0.25s ease-out;'
                : ''}"
            {value}
            {oninput}
            onpointerdown={handlePointerDown}
            onpointermove={handlePointerMove}
            onpointerup={handlePointerUp}
            onpointercancel={handlePointerCancel} />
    </div>
{:else}
    <input
        autocomplete="off"
        spellcheck="false"
        {placeholder}
        class="rounded-2xl px-4 py-1.5 text-base ring-1 ring-transparent outline-hidden transition animate-in animate-out fade-in zoom-in-50 sm:text-lg"
        {value}
        {oninput} />
{/if}
