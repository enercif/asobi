import { m } from "$lib/paraglide/messages";
import { BellIcon, HouseIcon, MenuIcon, TrophyIcon } from "@lucide/svelte";

export const navigation = [
    {
        text: m.honest_dull_panda_hush(),
        icon: HouseIcon,
        href: "/",
    },
    {
        text: "Leaderboard",
        icon: TrophyIcon,
        href: "/leaderboard",
    },
    {
        text: "Messages",
        icon: BellIcon,
        href: "/messages",
    },
    {
        text: "Settings",
        icon: MenuIcon,
        href: "/settings",
    },
];
