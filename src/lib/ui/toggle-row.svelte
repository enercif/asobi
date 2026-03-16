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

<div class="flex items-center gap-3 px-6 py-4">
    {@render children()}

    <div class="flex h-full flex-col justify-center space-y-1">
        <p class="text-base leading-tight font-medium text-black">{label}</p>
        {#if description}
            <p class="text-sm leading-snug text-black/60">{description}</p>
        {/if}
    </div>

    <Switch class="ml-auto shrink-0 self-center" bind:checked {onCheckedChange} />
</div>
