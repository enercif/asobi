<script lang="ts">
    import Dialog from "$lib/ui/dialog.svelte";
    import TriggerRow from "$lib/ui/trigger-row.svelte";
    import { GoalIcon } from "@lucide/svelte";
    import { Tabs } from "bits-ui";
</script>

<Dialog title="Ziel">
    {#snippet trigger()}
        <TriggerRow label="Ziel" value={"10 Punkte"}>
            <GoalIcon size={28} />
        </TriggerRow>
    {/snippet}

    <Tabs.Root value="round">
        <Tabs.List class="relative flex flex-row items-center justify-between">
            <Tabs.Trigger value="round" class="px-4 py-2">Runden</Tabs.Trigger>

            <Tabs.Trigger
                value="point"
                class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2  px-4 py-2"
                >Punkte</Tabs.Trigger>

            <Tabs.Trigger value="open" class="px-4 py-2">Offen</Tabs.Trigger>
        </Tabs.List>
        <div class=" border-b border-contrast/35 sm:mx-6"></div>

        <Tabs.Content value="round">Runde Content</Tabs.Content>

        <Tabs.Content value="point">Punkte Content</Tabs.Content>

        <Tabs.Content value="open">Offen Content</Tabs.Content>
    </Tabs.Root>
</Dialog>
