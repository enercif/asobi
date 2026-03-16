export type ImpostorCategory = {
    id: string;
    name: string;
    description: string;
    words: ImpostorCategoryWord[];
};

export type ImpostorCategoryWord = {
    word: string;
    hints: string[];
};
