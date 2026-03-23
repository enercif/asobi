export type NoSayGoalConfig = {
    mode: "points" | "rounds" | "open";
    points: number;
    rounds: number;
};

export type NoSayTimerConfig = {
    durationSeconds: number;
};

export type NoSaySettingsState = {
    teamInputs: [string, string][];
    selectedCategoryIds: string[];
    goalConfig: NoSayGoalConfig;
    timerConfig: NoSayTimerConfig;
};
