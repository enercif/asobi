<script lang="ts">
    import { m } from "$lib/paraglide/messages";
    import { BellIcon, MenuIcon, TrophyIcon } from "@lucide/svelte";

    import HouseIcon from "@lucide/svelte/icons/house";
    import "../app.css";

    let { children } = $props();

    let active = $state("Home");

    let navigation = [
        {
            text: m.honest_dull_panda_hush(),
            icon: HouseIcon,
            href: "/",
        },
        {
            text: "Leaderboard",
            icon: TrophyIcon,
            href: "/",
        },
        {
            text: "Messages",
            icon: BellIcon,
            href: "/",
        },
        {
            text: "Settings",
            icon: MenuIcon,
            href: "/test",
        },
    ];
</script>

<div class="bg-[#F5E7C6] h-dvh w-dvw px-5 pt-10 overflow-x-clip">
    {@render children()}

    <div
        class="absolute bottom-0 left-1/2 -translate-y-1/2 -translate-x-1/2 w-fit h-fit bg-[#222222] items-center flex flex-row rounded-2xl p-1.5 gap-2"
    >
        {#each navigation as navigationItem}
            <a
                href={navigationItem.href}
                class=" h-14 min-w-14 flex items-center justify-center rounded-xl flex-row gap-2 px-2 transition-all duration-200 {navigationItem.text ===
                active
                    ? 'bg-[#FA8112] text-white'
                    : 'bg-white text-black'}"
                onclick={() => (active = navigationItem.text)}
            >
                <navigationItem.icon size={26} />
                {#if navigationItem.text === active}
                    <span class="text-lg font-semibold">{navigationItem.text}</span>
                {/if}
            </a>
        {/each}
    </div>
</div>
