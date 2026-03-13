export type ImpostorPlayer = {
    id: string;
    name: string;
};

export type ImpostorRole = "civilian" | "impostor";

export type ImpostorWordEntry = {
    word: string;
    hints: string[];
};

export type ImpostorSelectedWord = ImpostorWordEntry & {
    categoryId: string;
    categoryName: string;
};

export type ImpostorCountConfig =
    | {
          mode: "fixed";
          count: number;
      }
    | {
          mode: "random";
          min: number;
          max: number;
      };

export type ImpostorTimerConfig =
    | {
          enabled: false;
      }
    | {
          enabled: true;
          durationSeconds: number;
      };

export type ImpostorGameSetup = {
    players: ImpostorPlayer[];
    selectedCategoryIds: string[];
    impostorCount: ImpostorCountConfig;
    hintsEnabled: boolean;
    timer: ImpostorTimerConfig;
};

export type ImpostorAssignment = {
    playerId: ImpostorPlayer["id"];
    role: ImpostorRole;
    hint?: string;
};

export type ImpostorRevealCard = {
    player: ImpostorPlayer;
    role: ImpostorRole;
    label: string;
    word?: string;
    hint?: string;
};

export type ImpostorRound = {
    players: ImpostorPlayer[];
    selectedWord: ImpostorSelectedWord;
    assignments: ImpostorAssignment[];
    revealCards: ImpostorRevealCard[];
    startingPlayerId: ImpostorPlayer["id"];
};

export type ImpostorGamePhase = "reveal" | "discussion" | "results";

export type ImpostorRoundEndReason = "manual" | "timer";

export type ImpostorGameResult = {
    endedReason: ImpostorRoundEndReason;
    secretWord: ImpostorSelectedWord;
    startingPlayerId: ImpostorPlayer["id"];
    impostorPlayerIds: ImpostorPlayer["id"][];
    round: ImpostorRound;
};
