import { PersistedState } from "runed";
import type { ImpostorSettings } from "../types/settings";

export const impostorPresetsState = new PersistedState<ImpostorSettings[]>("impostor-presets", []);
