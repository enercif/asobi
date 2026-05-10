import { PersistedState } from "runed";
import type { ImpostorSettings } from "../types/settings";

export const IMPOSTOR_MIN_PLAYERS = 3;
export const IMPOSTOR_TIMER_OPTIONS = [30, 60, 120, 180, 300, 600] as const;

export const baseImpostorSettings: ImpostorSettings = {
    playerInputs: [""],
    impostorConfig: {
        mode: "fixed",
        count: 1,
        randomRange: [1, 2],
    },
    selectedCategoryIds: ["1"],
    hintsEnabled: false,
    timerConfig: {
        enabled: false,
        durationSeconds: 60,
    },
};

export const impostorSettingsState = new PersistedState<ImpostorSettings>(
    "impostor-settings",
    baseImpostorSettings,
);

export function getPlayerCount() {
    return impostorSettingsState.current.playerInputs.length - 1;
}

export function getValidationErrors() {
    const errors: string[] = [];

    if (impostorSettingsState.current.playerInputs.length - 1 < IMPOSTOR_MIN_PLAYERS) {
        errors.push(`Bitte mindestens ${IMPOSTOR_MIN_PLAYERS} Spieler hinzufügen`);
    }

    if (impostorSettingsState.current.selectedCategoryIds.length === 0) {
        errors.push("Bitte mindestens eine Kategorie auswählen");
    }

    if (getPlayerCount() >= IMPOSTOR_MIN_PLAYERS) {
        if (impostorSettingsState.current.impostorConfig.mode === "fixed") {
            if (
                impostorSettingsState.current.impostorConfig.count < 1 ||
                impostorSettingsState.current.impostorConfig.count >= getPlayerCount()
            ) {
                errors.push("Bitte eine gültige Anzahl an Impostoren auswählen");
            }
        } else if (
            impostorSettingsState.current.impostorConfig.randomRange[0] < 1 ||
            impostorSettingsState.current.impostorConfig.randomRange[1] >= getPlayerCount() ||
            impostorSettingsState.current.impostorConfig.randomRange[0] >
                impostorSettingsState.current.impostorConfig.randomRange[1]
        ) {
            errors.push("Bitte einen gültigen Impostor-Bereich auswählen");
        }
    }

    return errors;
}
