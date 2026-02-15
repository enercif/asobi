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
            class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-contrast/75"
        />
        <Dialog.Content
            class=" rounded-2xl bg-bg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 outline-hidden absolute left-[50%] top-[50%] z-50 w-[calc(100%-2.5rem)] translate-x-[-50%] translate-y-[-50%] p-3 md:max-w-158"
            {...contentProps}
        >
            <Dialog.Title class="text-center text-2xl font-semibold pb-3">
                {title}
            </Dialog.Title>

            <Dialog.Close class="absolute top-2 right-3 size-10  flex items-center justify-center">
                <XIcon size={20} />
            </Dialog.Close>

            <div class="rounded-xl bg-white w-full min-h-0 max-h-130 py-2 px-3">
                {@render children?.()}
            </div>
        </Dialog.Content>
    </Dialog.Portal>
</Dialog.Root>
