<script lang="ts">
    import { page } from "$app/state";
    import BottomDock from "$lib/ui/bottom-dock.svelte";
    import RouteSubtitle from "$lib/ui/route-subtitle.svelte";

    import { stopOverscroll } from "$lib/helper/gsap.helper";
    import Splash from "$lib/ui/splash.svelte";
    import { onMount } from "svelte";
    import "../app.css";

    let { children } = $props();

    let visible = $state(true);

    onMount(() => {
        stopOverscroll(undefined);
        setTimeout(() => {
            visible = false;
        }, 500);
    });
</script>

<Splash {visible} />

<div class="h-dvh w-dvw overflow-x-clip px-5 pt-10 md:mx-auto md:max-w-2xl">
    {#if page.route.id?.includes("games")}
        {@render children()}
    {:else}
        <div class="flex size-full min-h-0 flex-col gap-8">
            <div class="flex flex-row items-start justify-between">
                <div class="flex grow flex-col">
                    <p class="text-5xl font-bold">Asobi</p>
                    <p class="text-3xl font-semibold text-primary italic">
                        <RouteSubtitle />
                    </p>
                </div>
                <p class="rounded-lg bg-white px-4 py-1">Enis</p>
            </div>
            {@render children()}
        </div>

        <BottomDock />
    {/if}
</div>
