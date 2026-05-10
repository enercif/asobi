<script lang="ts">
    import { ChevronDown } from "@lucide/svelte";
    import type { Snippet } from "svelte";

    let {
        children,
        label,
        value,
    }: {
        children: Snippet;
        label: string;
        value: number | string | undefined;
    } = $props();
</script>

<div class="flex flex-row items-center gap-3 px-6 py-4">
    {@render children()}
    <p class="text-base font-medium">{label}</p>

    <p class="ml-auto text-base font-medium">
        {#if value !== undefined}
            {value}
        {:else}
            <ChevronDown />
        {/if}
    </p>
</div>
