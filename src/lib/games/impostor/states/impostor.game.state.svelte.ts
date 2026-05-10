import type { ImpostorGame } from "../types/games";

export const impostorGameState = $state<ImpostorGame>({
    players: [],
    selectedWords: { word: "", hints: [] },
    startingPlayerName: "",
});
