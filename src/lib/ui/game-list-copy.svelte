<script lang="ts">
    import { horizontalLoop } from "$lib/helper/gsap.helper";
    import { gsap } from "gsap";
    import { Draggable } from "gsap/Draggable";
    import { InertiaPlugin } from "gsap/InertiaPlugin";
    import { onMount } from "svelte";

    gsap.registerPlugin(Draggable, InertiaPlugin);

    onMount(() => {
        const slides = gsap.utils.toArray<HTMLElement>(".carousel-slide");
        const pathWidth = (slides.length - 1) * 5 + 6;
        let activeSlide: HTMLElement | null = null;
        let activeIndex = 0;

        // Initial settings
        gsap.set(".carousel", { overflow: "visible", "scroll-snap-type": "none" });
        gsap.set(".carousel-slide", { perspective: 999, transformOrigin: "50% 50% 0" });
        gsap.set(".carousel-progress", { display: "block" });

        gsap.set(".carousel-progress", { attr: { viewBox: "-1 -1 " + (pathWidth + 2) + " 2" } });
        gsap.set(".carousel-progress path", { attr: { d: "M0,0 " + pathWidth + ",0" } });
        updateProgress(0);

        // create seamless horizontal loop
        const loop = horizontalLoop(
            slides,
            {
                paused: true, // no auto-scroll
                center: true, // snap the active slide to the center
                draggable: true, // requires Draggable & InertiaPlugin
                onChange: (slide, index) => {
                    // called when the active slide changes
                    activeSlide && activeSlide.classList.remove("active");
                    slide.classList.add("active");
                    activeSlide = slide;
                    activeIndex = index;
                    updateProgress();
                },
            },
            slideImgUpdate,
        );

        if (!loop) {
            return;
        }

        // each slide can function as a button to activate itself
        slides.forEach((slide, index) => {
            const imgWrapper = slide.querySelector<HTMLElement>(".carousel-img-wrapper");

            if (!imgWrapper) {
                return;
            }

            imgWrapper.addEventListener("click", () => {
                loop.toIndex(index, { duration: 1, ease: "expo" });
            });

            imgWrapper.addEventListener("pointerover", () => {
                gsap.to(".carousel-slide img", {
                    opacity: (i, t) => (t === slide.querySelector("img") ? 1 : 0.5),
                });
            });

            imgWrapper.addEventListener("pointerout", () => {
                gsap.to(".carousel-slide img", { opacity: 1, ease: "power1.inOut" });
            });
        });

        // center on initial slide
        loop.toIndex(0, { duration: 0 });

        // image parallax
        function slideImgUpdate() {
            slides.forEach((slide) => {
                const rect = slide.getBoundingClientRect();
                const prog = gsap.utils.mapRange(-rect.width, innerWidth, 0, 1, rect.x);
                const val = gsap.utils.clamp(0, 1, prog);

                gsap.set(slide.querySelector(".carousel-img-wrapper"), {
                    rotateY: gsap.utils.interpolate(45, -45, val),
                    scale: gsap.utils.interpolate(0.7, 1.5, gsap.utils.wrapYoyo(0, 0.5, val)),
                    z: gsap.utils.interpolate(-90, -300, gsap.utils.wrapYoyo(0, 0.5, val)),
                });

                gsap.set(slide.querySelector("img"), {
                    xPercent: gsap.utils.interpolate(0, -33, val),
                    scale: gsap.utils.interpolate(1.5, 0.7, gsap.utils.wrapYoyo(0, 0.5, val)),
                });
            });
        }

        // sets svg path appearance to show carousel progress
        function updateProgress(dur: number | null = null) {
            let str = "";
            for (let i = 0; i < slides.length; i++) {
                str += i === activeIndex ? 6 : 0.5;
                str += " " + 4.5 + " ";
            }
            gsap.to(".carousel-progress path", {
                duration: dur === null ? 0.5 : dur,
                attr: { "stroke-dasharray": str },
            });
        }
    });
</script>

<section class="-mx-5">
    <div class="carousel" aria-label="horizontal carousel of images">
        <div class="carousel-slide">
            <div class="carousel-img-wrapper">
                <img
                    src="https://images.unsplash.com/photo-1659733582156-d2a11801e59f?q=50&w=1600"
                    alt="Scenic landscape" />
            </div>
        </div>

        <div class="carousel-slide">
            <div class="carousel-img-wrapper">
                <img
                    src="https://images.unsplash.com/photo-1543362137-5df0547b039d?q=50&w=1600"
                    alt="Scenic landscape" />
            </div>
        </div>

        <div class="carousel-slide">
            <div class="carousel-img-wrapper">
                <img
                    src="https://images.unsplash.com/photo-1631142260228-305ccb610dba?q=50&w=1600"
                    alt="Scenic landscape" />
            </div>
        </div>

        <div class="carousel-slide">
            <div class="carousel-img-wrapper">
                <img
                    src="https://images.unsplash.com/photo-1708022766976-49ca46c0f7de?q=50&w=1600"
                    alt="Scenic landscape" />
            </div>
        </div>

        <div class="carousel-slide">
            <div class="carousel-img-wrapper">
                <img
                    src="https://images.unsplash.com/photo-1631142260079-970258649676?q=50&w=1600"
                    alt="Scenic landscape" />
            </div>
        </div>

        <div class="carousel-slide">
            <div class="carousel-img-wrapper">
                <img
                    src="https://images.unsplash.com/photo-1708022809820-2668e65877b9?q=50&w=1600"
                    alt="Scenic landscape" />
            </div>
        </div>

        <div class="carousel-slide">
            <div class="carousel-img-wrapper">
                <img
                    src="https://images.unsplash.com/photo-1708022796522-ff65b57439de?q=50&w=1600"
                    alt="Scenic landscape" />
            </div>
        </div>

        <div class="carousel-slide">
            <div class="carousel-img-wrapper">
                <img
                    src="https://images.unsplash.com/photo-1708022790103-a514cb89a034?q=50&w=1600"
                    alt="Scenic landscape" />
            </div>
        </div>
    </div>

    <svg class="carousel-progress" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 0 0">
        <path
            stroke="black"
            stroke-width="2"
            stroke-linecap="round"
            d=""
            style="  transition: all 100ms;
" />
    </svg>
</section>

<style>
    section {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    }

    .carousel {
        width: 100%;
        height: 400px;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        display: flex;
        -webkit-overflow-scrolling: touch;
    }

    .carousel-slide {
        position: relative;
        flex: 0 0 25%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: white;
        scroll-snap-align: center;
    }

    .carousel-img-wrapper {
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        overflow: hidden;
    }

    .carousel-slide img {
        width: 150%;
        height: 100%;
        object-fit: cover;
    }

    .carousel-progress {
        display: none; /* displayed in the JS */
        width: 33%;
        max-width: 300px;
        max-height: 8px;
        bottom: 3.5vh;
        pointer-events: none;
        opacity: 0.36;
    }

    /* Simplify the scroll bar appearance */
    ::-webkit-scrollbar {
        height: 13px;
    }

    ::-webkit-scrollbar-track {
        background: transparent;
    }

    ::-webkit-scrollbar-thumb {
        border-top: 6px solid #000;
        background: #555;
        width: 50%;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: #bbb;
    }

    @media (max-width: 500px) {
        .carousel-slide {
            flex: 0 0 50%;
        }
    }
</style>
