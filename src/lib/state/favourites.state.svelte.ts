import { PersistedState } from "runed";

export const favouritesState = new PersistedState<string[]>("favourites", []);
