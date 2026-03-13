<script lang="ts">
    import { Slider, type WithoutChildren } from "bits-ui";
    import type { ComponentProps } from "svelte";

    type Props = WithoutChildren<ComponentProps<typeof Slider.Root>>;

    let { value = $bindable(), ref = $bindable(null), ...restProps }: Props = $props();
</script>

<Slider.Root
    bind:value
    bind:ref
    {...restProps as any}
    class="relative flex w-full touch-none items-center select-none">
    {#snippet children({ tickItems, thumbItems })}
        <span
            class="relative h-2 w-full grow cursor-pointer overflow-hidden rounded-full bg-contrast/25">
            <Slider.Range class="absolute h-full bg-primary" />
        </span>
        {#each thumbItems as { index } (index)}
            <Slider.Thumb
                {index}
                class="z-5 block size-6.5 cursor-pointer rounded-full border border-primary/10 bg-white shadow-sm transition-colors focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-active:scale-[0.98]" />
        {/each}
        {#each tickItems as { index, value } (index)}
            <Slider.Tick {index} class="z-1 h-2 w-0.5 rounded-full bg-white/90" />
        {/each}
    {/snippet}
</Slider.Root>
