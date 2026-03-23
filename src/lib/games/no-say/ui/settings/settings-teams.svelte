<script lang="ts">
    import Dialog from "$lib/ui/dialog.svelte";
    import TriggerRow from "$lib/ui/trigger-row.svelte";
    import { UserIcon } from "@lucide/svelte";
    import { getTeamCount, noSaySettingsState } from "../../states/nosay.settings.state.svelte";

    function onPlayerInputChange(teamIndex: number, playerIndex: 0 | 1, value: string) {
        const nextInputs: [string, string][] = noSaySettingsState.teamInputs.map(
            (team) => [...team] as [string, string],
        );

        nextInputs[teamIndex][playerIndex] = value;

        const normalized = nextInputs
            .map(([player1, player2]) => [player1.trim(), player2.trim()] as [string, string])
            .filter(([player1, player2], index, arr) => {
                const isLastTeam = index === arr.length - 1;
                const isEmptyTeam = player1 === "" && player2 === "";

                return !isEmptyTeam || isLastTeam;
            });

        const lastTeam = normalized.at(-1);
        const lastTeamIsFilled = !!lastTeam && lastTeam[0] !== "" && lastTeam[1] !== "";

        noSaySettingsState.teamInputs = lastTeamIsFilled
            ? [...normalized, ["", ""]]
            : normalized.length === 0
              ? [["", ""]]
              : normalized;
    }
</script>

<Dialog title="Teams">
    {#snippet trigger()}
        <TriggerRow label="Teams" value={getTeamCount()}>
            <UserIcon size={28} />
        </TriggerRow>
    {/snippet}

    <div class="flex size-full max-h-125 flex-col gap-2 overflow-y-auto">
        {#each noSaySettingsState.teamInputs as teamInput, index (index)}
            <div class="grid grid-cols-2 divide-x divide-contrast/35">
                <input
                    autocomplete="off"
                    spellcheck="false"
                    placeholder={`Team ${index + 1} Spieler 1`}
                    class="px-4 py-1.5 text-base ring-1 ring-transparent outline-hidden transition animate-in animate-out fade-in zoom-in-50 sm:text-lg"
                    value={teamInput[0]}
                    oninput={(event) => {
                        onPlayerInputChange(index, 0, event.currentTarget.value);
                    }} />

                <input
                    autocomplete="off"
                    spellcheck="false"
                    placeholder={`Team ${index + 1} Spieler 2`}
                    class="px-4 py-1.5 text-base ring-1 ring-transparent outline-hidden transition animate-in animate-out fade-in zoom-in-50 sm:text-lg"
                    value={teamInput[1]}
                    oninput={(event) => {
                        onPlayerInputChange(index, 1, event.currentTarget.value);
                    }} />
            </div>

            {#if index + 1 !== noSaySettingsState.teamInputs.length}
                <div class="mx-2 border-b border-contrast/35"></div>
            {/if}
        {/each}
    </div>
</Dialog>
