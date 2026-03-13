<script lang="ts">
    import { XIcon } from "@lucide/svelte";
    import { Dialog, type WithoutChild } from "bits-ui";
    import type { Snippet } from "svelte";

    type Props = Dialog.RootProps & {
        trigger: Snippet;
        title: string;
        contentProps?: WithoutChild<Dialog.ContentProps>;
    };

    let {
        open = $bindable(false),
        children,
        trigger,
        contentProps,
        title,
        ...restProps
    }: Props = $props();
</script>

<Dialog.Root bind:open {...restProps}>
    <Dialog.Trigger>
        {@render trigger()}
    </Dialog.Trigger>
    <Dialog.Portal>
        <Dialog.Overlay
            class="fixed inset-0 z-50 bg-contrast/75 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
            class=" absolute top-[50%] left-[50%] z-50 w-[calc(100%-2.5rem)] translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-bg p-3 outline-hidden data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 md:max-w-158"
            {...contentProps}>
            <Dialog.Title class="pb-3 text-center text-2xl font-semibold">
                {title}
            </Dialog.Title>

            <Dialog.Close class="absolute top-2 right-3 flex  size-10 items-center justify-center">
                <XIcon size={20} />
            </Dialog.Close>

            <div class="max-h-130 min-h-0 w-full rounded-xl bg-white px-3 py-2">
                {@render children?.()}
            </div>
        </Dialog.Content>
    </Dialog.Portal>
</Dialog.Root>
