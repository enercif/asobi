import { getLocale } from "$lib/paraglide/runtime";
import { allCategories } from "./categories";
import { impostorGameState } from "./states/impostor.game.state.svelte";
import { impostorSettingsState } from "./states/impostor.state.svelte";
import type { ImpostorCategoryWord } from "./types/category";
import type { ImpostorPlayer } from "./types/games";

export function startRound() {
    const players: ImpostorPlayer[] = mapPlayerInputsToPlayers();
    const playersWithRoles = randomizeImpostorRoles(players);
    impostorGameState.players = playersWithRoles;
    impostorGameState.selectedWords = selectRandomWord();
    impostorGameState.startingPlayerName =
        playersWithRoles[Math.floor(Math.random() * playersWithRoles.length)].name;
}

function mapPlayerInputsToPlayers(): ImpostorPlayer[] {
    return impostorSettingsState.playerInputs
        .filter((player) => player.trim() !== "")
        .map((name) => ({ id: crypto.randomUUID(), name, role: "civilian" }));
}

function randomizeImpostorRoles(players: ImpostorPlayer[]): ImpostorPlayer[] {
    const config = impostorSettingsState.impostorConfig;

    const impostorCount =
        config.mode === "fixed" ? config.count : getRandomImpostorCount(config.randomRange);

    for (let i = 0; i < impostorCount; i++) {
        const nonImpostorPlayers = players.filter((player) => player.role !== "impostor");
        const randomIndex = Math.floor(Math.random() * nonImpostorPlayers.length);
        nonImpostorPlayers[randomIndex].role = "impostor";
        players.find((player) => player.id === nonImpostorPlayers[randomIndex].id)!.role =
            "impostor";
    }
    return players;
}

function getRandomImpostorCount(randomRange: number[]): number {
    const [min, max] = randomRange;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function selectRandomWord(): ImpostorCategoryWord {
    let availableCategories = [];

    switch (getLocale()) {
        case "de":
            availableCategories = allCategories.de;
        case "en":
            //TODO: add english categories and set
            availableCategories = allCategories.de;
    }

    const selectedCategoryIds = impostorSettingsState.selectedCategoryIds;
    const filteredCategories = availableCategories.filter((word) =>
        selectedCategoryIds.includes(word.id),
    );
    const availableWords = filteredCategories.flatMap((category) => category.words);

    const randomIndex = Math.floor(Math.random() * availableWords.length);
    return availableWords[randomIndex];
}
