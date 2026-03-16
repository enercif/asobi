export type ImpostorCountConfig = {
    mode: "random" | "fixed";
    count: number;
    randomRange: number[];
};

export type ImpostorTimerConfig = {
    enabled: boolean;
    durationSeconds: number;
};

export type ImpostorSettingsState = {
    playerInputs: string[];
    selectedCategoryIds: string[];
    impostorConfig: ImpostorCountConfig;
    hintsEnabled: boolean;
    timerConfig: ImpostorTimerConfig;
};
