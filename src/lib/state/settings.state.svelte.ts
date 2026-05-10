import type { Settings } from "$lib/types/settings.type";
import { PersistedState } from "runed";

export const globalSettings = new PersistedState<Settings>("settings", {
    listStyle: "carousel",
    showFavoritesOnly: false,
});
