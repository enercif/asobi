export type ImpostorCategory = {
    id: string;
    name: string;
    description: string;
    words: {
        word: string;
        hints: string[];
    }[];
};
