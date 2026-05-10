<script lang="ts">
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";

    let visible = $state(true);

    onMount(() => {
        setTimeout(() => {
            visible = false;
        }, 500);
    });
</script>

{#if visible}
    <div
        class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-1 bg-bg"
        transition:fade={{ duration: 300 }}>
        <p class="text-7xl font-bold">Asobi</p>
        <p class="text-4xl font-semibold text-primary italic">play together</p>
    </div>
{/if}
