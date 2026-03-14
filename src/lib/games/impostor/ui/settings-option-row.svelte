<script lang="ts">
    import { CheckIcon } from "@lucide/svelte";

    type Props = {
        label: string;
        description?: string;
        selected?: boolean;
        disabled?: boolean;
        onclick?: () => void;
    };

    let { label, description, selected = false, disabled = false, onclick }: Props = $props();
</script>

<button
    class="flex w-full items-center gap-3 rounded-2xl px-4 py-1.5 text-left disabled:cursor-not-allowed disabled:opacity-50"
    {disabled}
    {onclick}>
    <div class="min-w-0 flex-1 space-y-1">
        <p class="text-base leading-tight font-medium text-black">{label}</p>
        {#if description}
            <p class="text-sm leading-snug text-black/60">{description}</p>
        {/if}
    </div>

    <p class="size-8 p-1 text-primary">
        {#if selected}
            <CheckIcon size={24} />
        {/if}
    </p>
</button>
