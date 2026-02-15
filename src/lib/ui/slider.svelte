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
    class="relative flex w-full touch-none select-none items-center"
>
    {#snippet children({ tickItems, thumbItems })}
        <span
            class="bg-contrast/25 relative h-2 w-full grow cursor-pointer overflow-hidden rounded-full"
        >
            <Slider.Range class="bg-primary absolute h-full" />
        </span>
        {#each thumbItems as { index } (index)}
            <Slider.Thumb
                {index}
                class="bg-white z-5 focus-visible:outline-hidden border-contrast/25 border data-active:scale-[0.98] block size-6.5 cursor-pointer rounded-full shadow-sm transition-colors disabled:pointer-events-none disabled:opacity-50"
            />
        {/each}
        {#each tickItems as { index, value } (index)}
            <Slider.Tick {index} class="bg-white z-1 h-2 w-0.5" />
            <Slider.TickLabel
                {index}
                class="text-black/25 data-bounded:text-black mb-5 text-sm font-medium leading-none"
                position="top"
            >
                {value}
            </Slider.TickLabel>
        {/each}
    {/snippet}
</Slider.Root>
