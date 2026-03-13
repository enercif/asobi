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
            class="absolute top-[50%] left-[50%] z-50 w-[calc(100%-1.5rem)] max-w-[38rem] translate-x-[-50%] translate-y-[-50%] rounded-[1.75rem] bg-bg p-4 shadow-xl outline-hidden data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:w-[calc(100%-2.5rem)] sm:p-5"
            {...contentProps}>
            <Dialog.Title class="pr-10 pb-3 text-center text-xl font-semibold sm:text-2xl">
                {title}
            </Dialog.Title>

            <Dialog.Close
                class="absolute top-3 right-3 flex size-10 items-center justify-center rounded-full text-black/60 transition-colors hover:bg-white/80 hover:text-black">
                <XIcon size={20} />
            </Dialog.Close>

            <div
                class="max-h-[min(32rem,calc(100svh-8rem))] min-h-0 w-full rounded-2xl bg-white px-3 py-3 sm:px-4">
                {@render children?.()}
            </div>
        </Dialog.Content>
    </Dialog.Portal>
</Dialog.Root>
