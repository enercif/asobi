import type { ImpostorCategory } from "$lib/types/impostor-category.type";

export const impostorCategories: ImpostorCategory[] = [
    {
        id: "1",
        name: "Tiere",
        description: "Verschiedene Tiere",
        words: [
            {
                word: "Hund",
                hints: ["Bellt", "Vier Beine", "Haustier"],
            },
            {
                word: "Katze",
                hints: ["Miau", "Vier Beine", "Haustier"],
            },
            {
                word: "Elefant",
                hints: ["Rüssel", "Groß", "Dickhäuter"],
            },
        ],
    },
    {
        id: "2",
        name: "Essen",
        description: "Verschiedene Gerichte und Lebensmittel",
        words: [
            {
                word: "Pizza",
                hints: ["Italienisch", "Käse", "Teig"],
            },
            {
                word: "Burger",
                hints: ["Fast Food", "Brötchen", "Fleisch"],
            },
            {
                word: "Sushi",
                hints: ["Japanisch", "Reis", "Roh"],
            },
        ],
    },
];
