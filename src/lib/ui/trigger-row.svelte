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

<div class="flex flex-row items-center gap-3 px-6 py-4">
    {@render children()}
    <p class="text-base font-medium">{label}</p>
    <p class="ml-auto text-base font-medium">{value}</p>
</div>
