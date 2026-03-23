<script lang="ts">
    import Dialog from "$lib/ui/dialog.svelte";
    import { CircleDashedIcon } from "@lucide/svelte";

    import OptionRow from "$lib/ui/option-row.svelte";
    import TriggerRow from "$lib/ui/trigger-row.svelte";
    import { noSayCategoriesDE } from "../../catgories/categories";
    import { noSaySettingsState } from "../../states/nosay.settings.state.svelte";

    function toggleCategory(id: string) {
        if (noSaySettingsState.selectedCategoryIds.includes(id)) {
            if (noSaySettingsState.selectedCategoryIds.length === 1) {
                return;
            }
            noSaySettingsState.selectedCategoryIds = noSaySettingsState.selectedCategoryIds.filter(
                (categoryId) => categoryId !== id,
            );
        } else {
            noSaySettingsState.selectedCategoryIds = [
                ...noSaySettingsState.selectedCategoryIds,
                id,
            ];
        }
    }
</script>

<Dialog title="Kategorien">
    {#snippet trigger()}
        <TriggerRow
            label="Kategorien"
            value={`${noSaySettingsState.selectedCategoryIds.length} / ${noSayCategoriesDE.length}`}>
            <CircleDashedIcon size={28} />
        </TriggerRow>
    {/snippet}

    <div class="flex max-h-125 min-h-0 w-full flex-col gap-2 overflow-y-auto">
        {#each noSayCategoriesDE as noSayCategory, index (noSayCategory.id)}
            <OptionRow
                label={noSayCategory.name}
                description={noSayCategory.description}
                selected={noSaySettingsState.selectedCategoryIds.includes(noSayCategory.id)}
                onclick={() => toggleCategory(noSayCategory.id)} />

            {#if index !== noSayCategoriesDE.length - 1}
                <div class="mx-2 border-b border-contrast/35"></div>
            {/if}
        {/each}
    </div>
</Dialog>
