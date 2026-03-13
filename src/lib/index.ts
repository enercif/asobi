// place files you want to import through the `$lib` alias in this folder.

export type {
    ImpostorAssignment,
    ImpostorCountConfig,
    ImpostorGamePhase,
    ImpostorGameResult,
    ImpostorGameSetup,
    ImpostorPlayer,
    ImpostorRevealCard,
    ImpostorRole,
    ImpostorRound,
    ImpostorRoundEndReason,
    ImpostorSelectedWord,
    ImpostorTimerConfig,
    ImpostorWordEntry,
    ImpostorCategory,
} from "$lib/games/impostor/types";

export {
    createImpostorRound,
    resolveFinalImpostorCount,
    selectRoundWord,
} from "$lib/games/impostor/round";

export type { CreateImpostorRoundOptions } from "$lib/games/impostor/round";
