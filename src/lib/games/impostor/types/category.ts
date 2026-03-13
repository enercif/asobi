import type { ImpostorWordEntry } from "./game";

export type ImpostorCategory = {
    id: string;
    name: string;
    description: string;
    words: ImpostorWordEntry[];
};
