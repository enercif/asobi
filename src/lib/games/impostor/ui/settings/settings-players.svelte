<script lang="ts">
    import Dialog from "$lib/ui/dialog.svelte";
    import TriggerRow from "$lib/ui/trigger-row.svelte";
    import { UserIcon } from "@lucide/svelte";
    import { getPlayerCount, impostorSettingsState } from "../../states/impostor.state.svelte";

    function onPlayerInputChange(index: number, value: string) {
        const nextInputs = [...impostorSettingsState.current.playerInputs];
        nextInputs[index] = value;

        const visibleInputs = nextInputs.filter((name, inputIndex) => {
            const isLastInput = inputIndex === nextInputs.length - 1;

            return isLastInput || name.trim() !== "";
        });

        impostorSettingsState.current.playerInputs =
            visibleInputs.at(-1)?.trim() === "" ? visibleInputs : [...visibleInputs, ""];

        const playerCount = getPlayerCount();

        if (playerCount > 3) {
            if (playerCount <= impostorSettingsState.current.impostorConfig.count) {
                impostorSettingsState.current.impostorConfig.count = playerCount - 1;
            }
            if (playerCount <= impostorSettingsState.current.impostorConfig.randomRange[1]) {
                impostorSettingsState.current.impostorConfig.randomRange[1] = playerCount - 1;
            }

            if (playerCount < impostorSettingsState.current.impostorConfig.randomRange[0]) {
                impostorSettingsState.current.impostorConfig.randomRange[0] = playerCount - 2;
            }
        }
    }
</script>

<Dialog title="Spieler">
    {#snippet trigger()}
        <TriggerRow label="Spieler" value={getPlayerCount()}>
            <UserIcon size={28} />
        </TriggerRow>
    {/snippet}

    <div class="flex size-full max-h-125 flex-col gap-2 overflow-y-auto">
        {#each impostorSettingsState.current.playerInputs as playerInput, index (index)}
            <input
                autocomplete="off"
                spellcheck="false"
                placeholder={`Spieler ${index + 1}`}
                class="rounded-2xl px-4 py-1.5 text-base ring-1 ring-transparent outline-hidden transition animate-in animate-out fade-in zoom-in-50 sm:text-lg"
                value={playerInput}
                oninput={(event) => {
                    onPlayerInputChange(index, event.currentTarget.value);
                }} />

            {#if index + 1 !== impostorSettingsState.current.playerInputs.length}
                <div class="mx-2 border-b border-contrast/35"></div>
            {/if}
        {/each}
    </div>
</Dialog>
