import { createContext } from "svelte";

import { impostorCategories } from "$lib/games/impostor/categories";
import type {
    ImpostorCountConfig,
    ImpostorGameSetup,
    ImpostorPlayer,
    ImpostorTimerConfig,
} from "$lib/types/impostor-game.type";

const defaultCategoryIds = impostorCategories[0] ? [impostorCategories[0].id] : [];

export const impostorMinPlayers = 3;
export const impostorTimerOptions = [60, 120, 180, 300, 600] as const;
export const impostorRandomCountMinPlayers = 5;

type ImpostorCountMode = ImpostorCountConfig["mode"];

export class ImpostorSettingsState {
    minPlayers = impostorMinPlayers;
    timerOptions = impostorTimerOptions;

    playerInputs = $state([""]);
    impostorCountMode = $state<ImpostorCountMode>("fixed");
    fixedImpostorCount = $state(1);
    randomImpostorRange = $state<[number, number]>([1, 2]);
    selectedCategoryIds = $state<string[]>([...defaultCategoryIds]);
    hintsEnabled = $state(false);
    timerEnabled = $state(false);
    timerDurationSeconds = $state(180);
    roundError = $state<string | null>(null);

    players = $derived.by((): ImpostorPlayer[] =>
        this.playerInputs
            .map((name) => name.trim())
            .filter((name) => name.length > 0)
            .map((name, index) => ({
                id: `player-${index + 1}`,
                name,
            })),
    );
    playerCount = $derived(this.players.length);
    maxImpostorCount = $derived(getMaxImpostorCount(this.playerCount));
    canUseRandomImpostorCount = $derived(this.playerCount >= impostorRandomCountMinPlayers);
    effectiveImpostorCountMode = $derived<ImpostorCountMode>(
        this.canUseRandomImpostorCount && this.impostorCountMode === "random" ? "random" : "fixed",
    );
    normalizedFixedImpostorCount = $derived(
        clamp(this.fixedImpostorCount, 1, this.maxImpostorCount),
    );
    normalizedRandomImpostorRange = $derived.by(() => {
        const minCount = clamp(Math.min(...this.randomImpostorRange), 1, this.maxImpostorCount);
        const maxCount = clamp(
            Math.max(...this.randomImpostorRange),
            minCount,
            this.maxImpostorCount,
        );

        return [minCount, maxCount] as [number, number];
    });

    impostorCountConfig = $derived.by(
        (): ImpostorCountConfig =>
            this.effectiveImpostorCountMode === "random"
                ? {
                      mode: "random",
                      min: this.normalizedRandomImpostorRange[0],
                      max: this.normalizedRandomImpostorRange[1],
                  }
                : {
                      mode: "fixed",
                      count: this.normalizedFixedImpostorCount,
                  },
    );

    timerConfig = $derived.by(
        (): ImpostorTimerConfig =>
            this.timerEnabled
                ? {
                      enabled: true,
                      durationSeconds: this.timerDurationSeconds,
                  }
                : {
                      enabled: false,
                  },
    );

    validationErrors = $derived.by(() => {
        const errors: string[] = [];

        if (this.playerCount < this.minPlayers) {
            errors.push(`Bitte mindestens ${this.minPlayers} Spieler hinzufügen`);
        }

        if (this.selectedCategoryIds.length === 0) {
            errors.push("Bitte mindestens eine Kategorie auswählen");
        }

        if (this.playerCount >= this.minPlayers) {
            if (this.impostorCountConfig.mode === "fixed") {
                if (
                    this.impostorCountConfig.count < 1 ||
                    this.impostorCountConfig.count >= this.playerCount
                ) {
                    errors.push("Bitte eine gültige Anzahl an Impostoren auswählen");
                }
            } else if (
                this.impostorCountConfig.min < 1 ||
                this.impostorCountConfig.max >= this.playerCount ||
                this.impostorCountConfig.min > this.impostorCountConfig.max
            ) {
                errors.push("Bitte einen gültigen Impostor-Bereich auswählen");
            }
        }

        return errors;
    });

    canStart = $derived(this.validationErrors.length === 0);
    gameSetup = $derived.by((): ImpostorGameSetup | null =>
        this.canStart
            ? {
                  players: this.players,
                  selectedCategoryIds: [...this.selectedCategoryIds],
                  impostorCount: this.impostorCountConfig,
                  hintsEnabled: this.hintsEnabled,
                  timer: this.timerConfig,
              }
            : null,
    );
    canSubmit = $derived(this.gameSetup !== null);

    impostorCountLabel = $derived.by(() => {
        if (this.playerCount < this.minPlayers) {
            return "–";
        }

        if (this.impostorCountConfig.mode === "fixed") {
            return this.impostorCountConfig.count.toString();
        }

        return this.impostorCountConfig.min === this.impostorCountConfig.max
            ? this.impostorCountConfig.min.toString()
            : `${this.impostorCountConfig.min} - ${this.impostorCountConfig.max}`;
    });
    timerLabel = $derived(
        this.timerEnabled ? formatImpostorTimer(this.timerDurationSeconds) : "Aus",
    );

    updatePlayer = (index: number, value: string) => {
        const nextInputs = [...this.playerInputs];
        nextInputs[index] = value;

        const visibleInputs = nextInputs.filter((name, inputIndex) => {
            const isLastInput = inputIndex === nextInputs.length - 1;

            return isLastInput || name.trim() !== "";
        });

        this.playerInputs =
            visibleInputs.at(-1)?.trim() === "" ? visibleInputs : [...visibleInputs, ""];
    };

    toggleCategory = (categoryId: string) => {
        this.selectedCategoryIds = this.selectedCategoryIds.includes(categoryId)
            ? this.selectedCategoryIds.filter((id) => id !== categoryId)
            : [...this.selectedCategoryIds, categoryId];
    };

    updateImpostorMode = (enabled: boolean) => {
        this.impostorCountMode = enabled && this.canUseRandomImpostorCount ? "random" : "fixed";
    };

    updateRandomImpostorRange = (value: number[]) => {
        this.randomImpostorRange = [value[0] ?? 1, value[1] ?? value[0] ?? 1];
    };

    setRoundError = (message: string) => {
        this.roundError = message;
    };

    clearRoundError = () => {
        this.roundError = null;
    };
}

export function createImpostorSettingsState() {
    return new ImpostorSettingsState();
}

export const [getImpostorSettingsState, setImpostorSettingsState] =
    createContext<ImpostorSettingsState>();

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

function getMaxImpostorCount(playerCount: number) {
    return Math.max(1, Math.floor((playerCount - 1) / 2));
}

export function formatImpostorTimer(seconds: number) {
    return seconds < 60 || seconds % 60 !== 0 ? `${seconds}s` : `${seconds / 60} min`;
}
