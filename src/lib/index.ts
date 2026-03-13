// place files you want to import through the `$lib` alias in this folder.

export type {
	ImpostorAssignment,
	ImpostorCountConfig,
	ImpostorDiscussionState,
	ImpostorGamePhase,
	ImpostorGameResult,
	ImpostorGameSetup,
	ImpostorPlayer,
	ImpostorRevealCard,
	ImpostorRevealState,
	ImpostorRole,
	ImpostorRound,
	ImpostorRoundEndReason,
	ImpostorRuntimeState,
	ImpostorSelectedWord,
	ImpostorTimerConfig,
	ImpostorWordEntry,
} from "$lib/types/impostor-game.type";

export type { ImpostorCategory } from "$lib/types/impostor-category.type";

export {
	createImpostorRound,
	resolveFinalImpostorCount,
	selectRoundWord,
} from "$lib/games/impostor/round";

export type { CreateImpostorRoundOptions } from "$lib/games/impostor/round";
