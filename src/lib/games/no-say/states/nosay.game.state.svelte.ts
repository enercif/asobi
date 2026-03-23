import type { NoSayGameState } from "../types/games";

export const impostorGameState = $state<NoSayGameState>({
    teams: [],
    selectedWords: { word: "", taboos: [] },
});
