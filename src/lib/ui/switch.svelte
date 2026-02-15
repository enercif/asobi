<script lang="ts">
    import { cn } from "$lib/utils";
    import { Switch, type WithoutChildrenOrChild } from "bits-ui";

    let {
        checked = $bindable(false),
        ref = $bindable(null),
        class: className,
        ...restProps
    }: WithoutChildrenOrChild<Switch.RootProps> = $props();
</script>

<Switch.Root
    bind:checked
    bind:ref
    {...restProps}
    class={cn(
        "data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-[#F5E7C6] inline-flex h-7.75 min-h-7.75 w-12.5 cursor-pointer items-center rounded-full px-0.75 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ",
        className,
    )}
>
    <Switch.Thumb
        class="bg-white pointer-events-none size-6.25 shrink-0 rounded-full transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 "
    />
</Switch.Root>
