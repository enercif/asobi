<script lang="ts">
    import Switch from "$lib/ui/switch.svelte";
    import type { Snippet } from "svelte";

    type Props = {
        children: Snippet;
        label: string;
        description?: string;
        checked?: boolean;
        onCheckedChange?: (checked: boolean) => void;
    };

    let {
        children,
        label,
        description,
        checked = $bindable(false),
        onCheckedChange,
    }: Props = $props();
</script>

<div class="flex items-start gap-3 px-4 py-3 sm:px-6 sm:py-4">
    <div class="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-bg/70 text-black">
        {@render children()}
    </div>

    <div class="min-w-0 flex-1 space-y-1 pt-0.5">
        <p class="text-base leading-tight font-medium text-black">{label}</p>
        {#if description}
            <p class="text-sm leading-snug text-black/60">{description}</p>
        {/if}
    </div>

    <Switch class="mt-1 ml-auto shrink-0" bind:checked {onCheckedChange} />
</div>
