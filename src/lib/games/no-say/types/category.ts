export type NoSayCategory = {
    id: string;
    name: string;
    description: string;
    words: NoSayCategoryWord[];
};

export type NoSayCategoryWord = {
    word: string;
    taboos: string[];
};
