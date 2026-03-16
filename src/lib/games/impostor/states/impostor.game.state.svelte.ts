import type { ImpostorGameState } from "../types/games";

export const impostorGameState = $state<ImpostorGameState>({
    players: [],
    selectedWords: { word: "", hints: [] },
    startingPlayerName: "",
});
