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
    class="flex w-full items-start gap-3 rounded-2xl px-4 py-3 text-left transition-colors hover:bg-bg/70 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
    {disabled}
    {onclick}>
    <div class="min-w-0 flex-1 space-y-1">
        <p class="text-base leading-tight font-medium text-black">{label}</p>
        {#if description}
            <p class="text-sm leading-snug text-black/60">{description}</p>
        {/if}
    </div>

    {#if selected}
        <p class="mt-0.5 shrink-0 rounded-full bg-primary/10 p-1 text-primary">
            <CheckIcon size={18} />
        </p>
    {/if}
</button>
