<script lang="ts">
    import { goto } from "$app/navigation";
    import { startRound } from "$lib/games/impostor/round";
    import { impostorPresetsState } from "$lib/games/impostor/states/impostor.presets.state.svelte";
    import { impostorSettingsState } from "$lib/games/impostor/states/impostor.state.svelte";
    import type { ImpostorGamePhase } from "$lib/games/impostor/types/games";
    import DiscussionPhase from "$lib/games/impostor/ui/discussion-phase.svelte";
    import ResultsPhase from "$lib/games/impostor/ui/results-phase.svelte";
    import RevealPhase from "$lib/games/impostor/ui/reveal-phase.svelte";
    import SettingsPhase from "$lib/games/impostor/ui/settings-phase.svelte";
    import { favouritesState } from "$lib/state/favourites.state.svelte";
    import Dialog from "$lib/ui/dialog.svelte";
    import { ChevronLeft, CircleQuestionMarkIcon, HeartIcon } from "@lucide/svelte";

    let favourite = $state(favouritesState.current.includes("Impostor"));
    let phase = $state<ImpostorGamePhase>("setup");

    function startRevealFlow() {
        phase = "reveal";
        let currentIndex = impostorPresetsState.current.findIndex(
            (preset) =>
                JSON.stringify(preset.playerInputs) ===
                JSON.stringify(impostorSettingsState.current.playerInputs),
        );
        if (currentIndex === -1) {
            impostorPresetsState.current.push(impostorSettingsState.current);
        } else {
            impostorPresetsState.current[currentIndex] = impostorSettingsState.current;
        }

        startRound();
    }

    function onFavouriteClick() {
        favourite = !favourite;
        if (favourite) {
            favouritesState.current.push("Impostor");
        } else {
            favouritesState.current = favouritesState.current.filter((v) => v !== "Impostor");
        }
    }

    function startDiscussionPhase() {
        phase = "discussion";
    }

    function startResultPhase() {
        phase = "results";
    }

    function navigateBack() {
        if (phase === "setup") {
            goto("/");
        } else if (phase === "results") {
            phase = "setup"!;
        } else {
            if (
                window.confirm(
                    "Möchtest du das Spiel beenden? Dein aktueller Fortschritt geht verloren.",
                )
            ) {
                phase = "setup";
            }
        }
    }
</script>

<div class="flex h-full flex-col gap-10">
    <div class="relative flex flex-row items-center justify-between">
        <button
            class="flex size-12 items-center justify-center rounded-lg bg-white"
            onclick={navigateBack}
            aria-label="Zurück zur Startseite">
            <ChevronLeft size={28} />
        </button>

        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <h1 class="text-3xl font-bold">Impostor</h1>
        </div>

        {#if phase === "setup"}
            <div class="flex flex-row items-center rounded-lg bg-white">
                <Dialog title="So funktioniert Impostor">
                    {#snippet trigger()}
                        <div
                            class="flex size-12 items-center justify-center"
                            aria-label="Spielregeln anzeigen">
                            <CircleQuestionMarkIcon size={28} />
                        </div>
                    {/snippet}

                    <div class="flex flex-col gap-3 text-left text-black/70">
                        <p>Tragt alle Spieler ein, wählt Kategorien und startet die Runde.</p>
                        <p>
                            Vor jeder Karte wird das Gerät an die angezeigte Person weitergegeben.
                        </p>
                        <p>
                            Geheime Karten bleiben nur sichtbar, solange sie gedrückt gehalten
                            werden.
                        </p>
                        <p>
                            Nach allen Reveals startet die Diskussion mit einem zufälligen
                            Startspieler.
                        </p>
                    </div>
                </Dialog>

                <div class="h-9 border-r border-contrast/50"></div>

                <button
                    class="flex size-12 items-center justify-center"
                    type="button"
                    aria-label={favourite ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
                    onclick={onFavouriteClick}>
                    <HeartIcon
                        size={28}
                        class={favourite
                            ? "fill-primary text-primary transition-all duration-150"
                            : "fill-none text-black transition-all duration-150"} />
                </button>
            </div>
        {/if}
    </div>

    {#if phase === "setup"}
        <SettingsPhase onNextPhase={startRevealFlow} />
    {:else if phase === "reveal"}
        <RevealPhase onNextPhase={startDiscussionPhase} />
    {:else if phase === "discussion"}
        <DiscussionPhase onNextPhase={startResultPhase} />
    {:else if phase === "results"}
        <ResultsPhase onNextGame={startRevealFlow} />
    {/if}
</div>
