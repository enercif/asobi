<script lang="ts">
    import { fade } from "svelte/transition";

    interface Props {
        visible: boolean;
    }

    let { visible }: Props = $props();
</script>

{#if visible}
    <div
        class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-1 bg-bg"
        transition:fade={{ duration: 300 }}>
        <p class="text-7xl font-bold">Asobi</p>
        <p class="text-4xl font-semibold text-primary italic">play together</p>
    </div>
{/if}
