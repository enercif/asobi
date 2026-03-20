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

    function isCurrentRoute(href: string) {
        return page.route.id === href;
    }
</script>

<div class="h-dvh w-dvw overflow-x-clip px-5 pt-10 md:mx-auto md:max-w-2xl">
    {#if page.route.id?.includes("games")}
        {@render children()}
    {:else}
        <div class="flex size-full flex-col gap-8">
            <div class="flex flex-row items-start justify-between">
                <div class="flex flex-col">
                    <p class="text-5xl font-bold">Asobi</p>
                    <p class="text-3xl font-medium italic">
                        {#if isCurrentRoute("/")}
                            {m.sad_active_mole_bask()}
                        {:else if isCurrentRoute("/leaderboard")}
                            Leaderboard
                        {:else if isCurrentRoute("/messages")}
                            Messages
                        {:else if isCurrentRoute("/settings")}
                            Settings
                        {/if}
                    </p>
                </div>
                <p class="rounded-lg bg-white px-4 py-1">Enis</p>
            </div>
            {@render children()}
        </div>

        <div
            class="absolute bottom-8 left-1/2 flex h-fit w-fit -translate-x-1/2 flex-row items-center gap-2 rounded-2xl bg-contrast p-1.5">
            {#each navigation as navigationItem}
                <a
                    href={navigationItem.href}
                    class=" flex h-14 min-w-14 flex-row items-center justify-center gap-2 rounded-xl px-2 transition-[background-color] duration-200 {navigationItem.href ===
                    page.route.id
                        ? 'bg-primary text-white'
                        : 'bg-white text-black'}">
                    <navigationItem.icon size={26} />
                    {#if isCurrentRoute(navigationItem.href)}
                        <span class="text-lg font-semibold">{navigationItem.text}</span>
                    {/if}
                </a>
            {/each}
        </div>
    {/if}
</div>
