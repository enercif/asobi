import type { ImpostorCategoryWord } from "./category";

export type ImpostorGamePhase = "reveal" | "discussion" | "results" | "setup";

export type ImpostorPlayer = {
    id: string;
    name: string;
    role: ImpostorRole;
};

export type ImpostorRole = "civilian" | "impostor";

export type ImpostorGame = {
    players: ImpostorPlayer[];
    selectedWords: ImpostorCategoryWord;
    startingPlayerName: string;
};
