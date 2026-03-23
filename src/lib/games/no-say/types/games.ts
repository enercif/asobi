import type { NoSayCategoryWord } from "./category";

export type NoSayGamePhase = "reveal" | "discussion" | "results" | "setup";

export type NoSayTeam = {
    players: NoSayPlayer[];
};

export type NoSayPlayer = {
    id: string;
    name: string;
};

export type NoSayGameState = {
    teams: NoSayTeam[];
    selectedWords: NoSayCategoryWord;
};
