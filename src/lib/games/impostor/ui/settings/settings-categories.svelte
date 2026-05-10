<script lang="ts">
    import { impostorCategoriesDE } from "$lib/games/impostor/categories";

    import Dialog from "$lib/ui/dialog.svelte";
    import { CircleDashedIcon } from "@lucide/svelte";

    import OptionRow from "$lib/ui/option-row.svelte";
    import TriggerRow from "$lib/ui/trigger-row.svelte";
    import { impostorSettingsState } from "../../states/impostor.state.svelte";

    function toggleCategory(id: string) {
        if (impostorSettingsState.current.selectedCategoryIds.includes(id)) {
            if (impostorSettingsState.current.selectedCategoryIds.length === 1) {
                // prevent deselecting the last category
                return;
            }
            impostorSettingsState.current.selectedCategoryIds =
                impostorSettingsState.current.selectedCategoryIds.filter(
                    (categoryId) => categoryId !== id,
                );
        } else {
            impostorSettingsState.current.selectedCategoryIds = [
                ...impostorSettingsState.current.selectedCategoryIds,
                id,
            ];
        }
    }
</script>

<Dialog title="Kategorien">
    {#snippet trigger()}
        <TriggerRow
            label="Kategorien"
            value={`${impostorSettingsState.current.selectedCategoryIds.length} / ${impostorCategoriesDE.length}`}>
            <CircleDashedIcon size={28} />
        </TriggerRow>
    {/snippet}

    <div class="flex max-h-125 min-h-0 w-full flex-col gap-2 overflow-y-auto">
        {#each impostorCategoriesDE as impostorCategory, index (impostorCategory.id)}
            <OptionRow
                label={impostorCategory.name}
                description={impostorCategory.description}
                selected={impostorSettingsState.current.selectedCategoryIds.includes(
                    impostorCategory.id,
                )}
                onclick={() => toggleCategory(impostorCategory.id)} />

            {#if index !== impostorCategoriesDE.length - 1}
                <div class="mx-2 border-b border-contrast/35"></div>
            {/if}
        {/each}
    </div>
</Dialog>
