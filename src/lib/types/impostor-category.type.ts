import type { ImpostorWordEntry } from "$lib/types/impostor-game.type";

export type ImpostorCategory = {
    id: string;
    name: string;
    description: string;
    words: ImpostorWordEntry[];
};
