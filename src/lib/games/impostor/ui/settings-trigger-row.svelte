<script lang="ts">
    import type { Snippet } from "svelte";

    let {
        children,
        label,
        value,
    }: {
        children: Snippet;
        label: string;
        value: number | string;
    } = $props();
</script>

<div class="flex items-center gap-3 px-4 py-3 text-left sm:px-6 sm:py-4">
    <div class="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-bg/70 text-black">
        {@render children()}
    </div>
    <p class="min-w-0 flex-1 text-base leading-tight font-medium text-black">{label}</p>
    <p class="shrink-0 rounded-full bg-bg px-3 py-1 text-sm font-medium text-black/70">{value}</p>
</div>
