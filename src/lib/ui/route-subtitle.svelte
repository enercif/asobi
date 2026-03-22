<script lang="ts">
    import { page } from "$app/state";
    import { navigation } from "$lib/navigation";
    import { m } from "$lib/paraglide/messages";
    import { gsap } from "gsap";
    import { tick } from "svelte";

    let activeSubtitle = $state("");
    let previousSubtitle = $state("");
    let activeSubtitleChars = $state<string[]>([]);
    let previousSubtitleChars = $state<string[]>([]);

    let activeSubtitleElement = $state<HTMLSpanElement | undefined>(undefined);
    let previousSubtitleElement = $state<HTMLSpanElement | undefined>(undefined);
    let subtitleTimeline: gsap.core.Timeline | undefined;
    let subtitleInitialized = false;

    async function animateSubtitleChange() {
        await tick();

        if (!activeSubtitleElement) {
            previousSubtitle = "";
            previousSubtitleChars = [];
            return;
        }

        subtitleTimeline?.kill();

        const incomingChars = Array.from(
            activeSubtitleElement.querySelectorAll<HTMLElement>("[data-subtitle-char]"),
        );
        const outgoingChars = previousSubtitleElement
            ? Array.from(
                  previousSubtitleElement.querySelectorAll<HTMLElement>("[data-subtitle-char]"),
              )
            : [];

        gsap.set(incomingChars, {
            yPercent: -130,
            rotateX: -90,
            transformOrigin: "50% 0%",
            opacity: 0,
        });

        subtitleTimeline = gsap.timeline({
            onComplete: () => {
                previousSubtitle = "";
                previousSubtitleChars = [];
            },
        });

        if (outgoingChars.length) {
            subtitleTimeline.to(
                outgoingChars,
                {
                    yPercent: 130,
                    rotateX: 90,
                    transformOrigin: "50% 100%",
                    opacity: 0,
                    ease: "power2.in",
                    stagger: {
                        each: 0.03,
                        from: "start",
                    },
                    duration: 0.36,
                },
                0,
            );
        }

        subtitleTimeline.to(
            incomingChars,
            {
                yPercent: 0,
                rotateX: 0,
                opacity: 1,
                ease: "power3.out",
                stagger: {
                    each: 0.04,
                    from: "start",
                },
                duration: 0.42,
            },
            outgoingChars.length ? 0.08 : 0,
        );
    }

    function getSubtitleForRoute() {
        const routeId = page.route.id || "";

        if (routeId === "/") {
            return m.sad_active_mole_bask();
        }

        return (
            navigation.filter((navigationItem) => navigationItem.href === routeId)?.[0]?.text || ""
        );
    }

    function toChars(text: string) {
        return Array.from(text);
    }

    $effect(() => {
        const nextSubtitle = getSubtitleForRoute();

        if (!subtitleInitialized) {
            subtitleInitialized = true;
            activeSubtitle = nextSubtitle;
            activeSubtitleChars = toChars(nextSubtitle);
            return;
        }

        if (nextSubtitle === activeSubtitle) {
            return;
        }

        previousSubtitle = activeSubtitle;
        previousSubtitleChars = toChars(previousSubtitle);
        activeSubtitle = nextSubtitle;
        activeSubtitleChars = toChars(nextSubtitle);

        animateSubtitleChange();
    });

    $effect(() => {
        return () => {
            subtitleTimeline?.kill();
        };
    });
</script>

<span class="relative inline-block min-h-[1.2em] w-full overflow-hidden perspective-normal">
    <span class="invisible block whitespace-pre">{activeSubtitle}</span>

    {#if previousSubtitle}
        <span bind:this={previousSubtitleElement} class="absolute inset-0 block whitespace-pre">
            {#each previousSubtitleChars as character}
                <span data-subtitle-char class="inline-block will-change-transform transform-3d"
                    >{character === " " ? "\u00A0" : character}</span>
            {/each}
        </span>
    {/if}

    <span bind:this={activeSubtitleElement} class="absolute inset-0 block whitespace-pre">
        {#each activeSubtitleChars as character}
            <span data-subtitle-char class="inline-block will-change-transform transform-3d"
                >{character === " " ? "\u00A0" : character}</span>
        {/each}
    </span>
</span>
