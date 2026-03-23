import type { NoSaySettingsState } from "../types/settings";

export const NOSAY_MIN_TEAMS = 1;
export const NOSAY_TIMER_OPTIONS = [30, 60, 120, 180, 300, 600] as const;

export const noSaySettingsState = $state<NoSaySettingsState>({
    teamInputs: [["", ""]],
    selectedCategoryIds: ["1"],
    goalConfig: {
        mode: "points",
        points: 20,
        rounds: 5,
    },
    timerConfig: {
        durationSeconds: 60,
    },
});

export function getTeamCount() {
    return noSaySettingsState.teamInputs.filter(
        (team) => team[0].trim() !== "" && team[1].trim() !== "",
    ).length;
}

export function getValidationErrors() {
    const errors: string[] = [];

    if (getTeamCount() < NOSAY_MIN_TEAMS) {
        errors.push(`Bitte mindestens ${NOSAY_MIN_TEAMS} Teams hinzufügen`);
    }

    if (noSaySettingsState.selectedCategoryIds.length === 0) {
        errors.push("Bitte mindestens eine Kategorie auswählen");
    }

    return errors;
}
