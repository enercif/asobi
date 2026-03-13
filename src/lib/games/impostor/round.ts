import { impostorCategories } from "$lib/games/impostor/categories";
import type { ImpostorCategory } from "$lib/types/impostor-category.type";
import type {
    ImpostorAssignment,
    ImpostorGameSetup,
    ImpostorPlayer,
    ImpostorRevealCard,
    ImpostorRole,
    ImpostorRound,
    ImpostorSelectedWord,
} from "$lib/types/impostor-game.type";

type RandomNumberGenerator = () => number;

export type CreateImpostorRoundOptions = {
    categories?: ImpostorCategory[];
    random?: RandomNumberGenerator;
};

const roleLabels: Record<ImpostorRole, string> = {
    civilian: "Zivilist",
    impostor: "Impostor",
};

export function createImpostorRound(
    setup: ImpostorGameSetup,
    options: CreateImpostorRoundOptions = {},
): ImpostorRound {
    validateSetup(setup);

    const random = options.random ?? Math.random;
    const availableCategories = options.categories ?? impostorCategories;
    const selectedWord = selectRoundWord(setup.selectedCategoryIds, availableCategories, random);
    const finalImpostorCount = resolveFinalImpostorCount(setup, random);
    const impostorHint = setup.hintsEnabled ? selectImpostorHint(selectedWord, random) : undefined;
    const impostorPlayerIds = selectImpostorPlayerIds(setup.players, finalImpostorCount, random);
    const assignments = createAssignments(setup.players, impostorPlayerIds, impostorHint);
    const revealCards = createRevealCards(setup.players, assignments, selectedWord.word);
    const startingPlayerId = selectStartingPlayer(setup.players, random).id;

    return {
        players: setup.players.map((player) => ({ ...player })),
        selectedWord,
        assignments,
        revealCards,
        startingPlayerId,
    };
}

export function resolveFinalImpostorCount(
    setup: Pick<ImpostorGameSetup, "players" | "impostorCount">,
    random: RandomNumberGenerator = Math.random,
): number {
    const playerCount = setup.players.length;

    if (playerCount < 3) {
        throw new Error("At least 3 players are required to create a round.");
    }

    if (setup.impostorCount.mode === "fixed") {
        assertImpostorCount(setup.impostorCount.count, playerCount);
        return setup.impostorCount.count;
    }

    assertImpostorCount(setup.impostorCount.min, playerCount);
    assertImpostorCount(setup.impostorCount.max, playerCount);

    if (setup.impostorCount.min > setup.impostorCount.max) {
        throw new Error("Impostor range minimum cannot exceed the maximum.");
    }

    return randomInteger(setup.impostorCount.min, setup.impostorCount.max, random);
}

export function selectRoundWord(
    selectedCategoryIds: string[],
    availableCategories: ImpostorCategory[] = impostorCategories,
    random: RandomNumberGenerator = Math.random,
): ImpostorSelectedWord {
    if (selectedCategoryIds.length === 0) {
        throw new Error("At least one category must be selected.");
    }

    const requestedCategoryIds = new Set(selectedCategoryIds);
    const selectedCategories = availableCategories.filter((category) =>
        requestedCategoryIds.has(category.id),
    );

    if (selectedCategories.length !== requestedCategoryIds.size) {
        const availableCategoryIds = new Set(availableCategories.map((category) => category.id));
        const missingCategoryIds = selectedCategoryIds.filter(
            (categoryId) => !availableCategoryIds.has(categoryId),
        );

        throw new Error(`Unknown category ids: ${missingCategoryIds.join(", ")}`);
    }

    const selectableWords = selectedCategories.flatMap((category) =>
        category.words.map((entry) => ({
            word: entry.word,
            hints: [...entry.hints],
            categoryId: category.id,
            categoryName: category.name,
        })),
    );

    if (selectableWords.length === 0) {
        throw new Error("The selected categories do not contain any words.");
    }

    return pickRandom(selectableWords, random);
}

function validateSetup(setup: ImpostorGameSetup) {
    if (setup.players.length < 3) {
        throw new Error("At least 3 players are required to create a round.");
    }

    const seenPlayerIds = new Set<string>();

    for (const player of setup.players) {
        if (!player.id.trim()) {
            throw new Error("Each player must have a non-empty id.");
        }

        if (!player.name.trim()) {
            throw new Error("Each player must have a non-empty name.");
        }

        if (seenPlayerIds.has(player.id)) {
            throw new Error(`Duplicate player id: ${player.id}`);
        }

        seenPlayerIds.add(player.id);
    }

    if (setup.selectedCategoryIds.length === 0) {
        throw new Error("At least one category must be selected.");
    }

    if (setup.timer.enabled && setup.timer.durationSeconds <= 0) {
        throw new Error("Timer duration must be greater than zero.");
    }
}

function assertImpostorCount(impostorCount: number, playerCount: number) {
    if (!Number.isInteger(impostorCount) || impostorCount < 1 || impostorCount >= playerCount) {
        throw new Error("Impostor count must be at least 1 and less than the player count.");
    }
}

function selectImpostorHint(
    selectedWord: Pick<ImpostorSelectedWord, "hints">,
    random: RandomNumberGenerator,
): string | undefined {
    if (selectedWord.hints.length === 0) {
        return undefined;
    }

    return pickRandom(selectedWord.hints, random);
}

function selectImpostorPlayerIds(
    players: ImpostorPlayer[],
    impostorCount: number,
    random: RandomNumberGenerator,
): Set<ImpostorPlayer["id"]> {
    const shuffledPlayers = shuffle(players, random);

    return new Set(shuffledPlayers.slice(0, impostorCount).map((player) => player.id));
}

function createAssignments(
    players: ImpostorPlayer[],
    impostorPlayerIds: Set<ImpostorPlayer["id"]>,
    impostorHint?: string,
): ImpostorAssignment[] {
    return players.map((player) => {
        const isImpostor = impostorPlayerIds.has(player.id);

        return {
            playerId: player.id,
            role: isImpostor ? "impostor" : "civilian",
            ...(isImpostor && impostorHint ? { hint: impostorHint } : {}),
        };
    });
}

function createRevealCards(
    players: ImpostorPlayer[],
    assignments: ImpostorAssignment[],
    secretWord: string,
): ImpostorRevealCard[] {
    const assignmentsByPlayerId = new Map(
        assignments.map((assignment) => [assignment.playerId, assignment]),
    );

    return players.map((player) => {
        const assignment = assignmentsByPlayerId.get(player.id);

        if (!assignment) {
            throw new Error(`Missing assignment for player ${player.id}`);
        }

        return {
            player: { ...player },
            role: assignment.role,
            label: roleLabels[assignment.role],
            ...(assignment.role === "civilian" ? { word: secretWord } : {}),
            ...(assignment.hint ? { hint: assignment.hint } : {}),
        };
    });
}

function selectStartingPlayer(
    players: ImpostorPlayer[],
    random: RandomNumberGenerator,
): ImpostorPlayer {
    return pickRandom(players, random);
}

function shuffle<T>(values: T[], random: RandomNumberGenerator): T[] {
    const shuffledValues = [...values];

    for (let currentIndex = shuffledValues.length - 1; currentIndex > 0; currentIndex -= 1) {
        const randomIndex = randomInteger(0, currentIndex, random);
        const currentValue = shuffledValues[currentIndex];

        shuffledValues[currentIndex] = shuffledValues[randomIndex];
        shuffledValues[randomIndex] = currentValue;
    }

    return shuffledValues;
}

function pickRandom<T>(values: T[], random: RandomNumberGenerator): T {
    if (values.length === 0) {
        throw new Error("Cannot pick a random value from an empty collection.");
    }

    return values[randomInteger(0, values.length - 1, random)];
}

function randomInteger(min: number, max: number, random: RandomNumberGenerator): number {
    const value = random();

    if (!Number.isFinite(value) || value < 0 || value >= 1) {
        throw new Error(
            "Random generator must return a finite number between 0 (inclusive) and 1 (exclusive).",
        );
    }

    return Math.floor(value * (max - min + 1)) + min;
}
