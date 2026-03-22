<script lang="ts">
    import { page } from "$app/state";
    import { navigation } from "$lib/navigation";

    function isCurrentRoute(href: string) {
        return page.route.id === href;
    }
</script>

<div
    class="absolute bottom-8 left-1/2 flex h-fit w-fit -translate-x-1/2 flex-row items-center gap-2 rounded-2xl bg-contrast p-1.5">
    {#each navigation as navigationItem}
        <a
            href={navigationItem.href}
            class={`flex h-14 min-w-14 items-center justify-center rounded-xl px-2 transition-[background-color] duration-300 ease-out ${
                isCurrentRoute(navigationItem.href)
                    ? "bg-primary text-white"
                    : "bg-white text-black"
            }`}>
            <navigationItem.icon size={26} class="w-10" />

            <span
                class={`overflow-hidden text-lg font-semibold whitespace-nowrap text-white transition-all duration-300 ease-out ${
                    isCurrentRoute(navigationItem.href) ? "max-w-30 " : "max-w-0"
                }`}>
                {navigationItem.text}
            </span>
        </a>
    {/each}
</div>
