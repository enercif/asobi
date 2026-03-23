export function formatTimeSmall(seconds: number) {
    return seconds < 60 || seconds % 60 !== 0 ? `${seconds}s` : `${seconds / 60} min`;
}
