<script lang="ts">
    import { page } from "$app/state";
    import { m } from "$lib/paraglide/messages";
    import { BellIcon, HouseIcon, MenuIcon, TrophyIcon } from "@lucide/svelte";
    import "../app.css";

    let { children } = $props();

    let navigation = [
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
</script>

<div class="h-dvh w-dvw px-5 pt-10 overflow-x-clip md:max-w-2xl md:mx-auto">
    {#if page.route.id?.includes("games")}
        {@render children()}
    {:else}
        <div class="flex flex-col size-full gap-8">
            <div class="flex flex-row items-center justify-between">
                <p class="text-xl font-bold">Asobi</p>
                <p class="bg-white px-4 py-1 rounded-lg">Enis</p>
            </div>
            {@render children()}
        </div>

        <div
            class="absolute bottom-8 left-1/2 -translate-x-1/2 w-fit h-fit bg-contrast items-center flex flex-row rounded-2xl p-1.5 gap-2"
        >
            {#each navigation as navigationItem}
                <a
                    href={navigationItem.href}
                    class=" h-14 min-w-14 flex items-center justify-center rounded-xl flex-row gap-2 px-2 transition-[background-color] duration-200 {navigationItem.href ===
                    page.route.id
                        ? 'bg-primary text-white'
                        : 'bg-white text-black'}"
                >
                    <navigationItem.icon size={26} />
                    {#if navigationItem.href === page.route.id}
                        <span class="text-lg font-semibold">{navigationItem.text}</span>
                    {/if}
                </a>
            {/each}
        </div>
    {/if}
</div>
