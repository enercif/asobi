import type { HorizontalLoopConfig, HorizontalLoopTimeline } from "$lib/types/gsap.types";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";

/*
This helper function makes a group of elements animate along the x-axis in a seamless, responsive loop.

Features:
- Uses xPercent so that even if the widths change (like if the window gets resized), it should still work in most cases.
- When each item animates to the left or right enough, it will loop back to the other side
- Optionally pass in a config object with values like "speed" (default: 1, which travels at roughly 100 pixels per second), paused (boolean),  repeat, reversed, and paddingRight.
- The returned timeline will have the following methods added to it:
- next() - animates to the next element using a timeline.tweenTo() which it returns. You can pass in a vars object to control duration, easing, etc.
- previous() - animates to the previous element using a timeline.tweenTo() which it returns. You can pass in a vars object to control duration, easing, etc.
- toIndex() - pass in a zero-based index value of the element that it should animate to, and optionally pass in a vars object to control duration, easing, etc. Always goes in the shortest direction
- current() - returns the current index (if an animation is in-progress, it reflects the final index)
- times - an Array of the times on the timeline where each element hits the "starting" spot. There's also a label added accordingly, so "label1" is when the 2nd element reaches the start.
*/
export function horizontalLoop(
    items: HTMLElement[] | gsap.DOMTarget,
    config: HorizontalLoopConfig = {},
    onUpdateCallback?: () => void,
): HorizontalLoopTimeline | undefined {
    let timeline: HorizontalLoopTimeline | undefined;
    const loopItems = gsap.utils.toArray(items) as HTMLElement[];
    gsap.context(() => {
        // use a context so that if this is called from within another context or a gsap.matchMedia(), we can perform proper cleanup like the "resize" event handler on the window
        let onChange = config.onChange,
            lastIndex = 0,
            tl = gsap.timeline({
                repeat: config.repeat,
                onUpdate:
                    onChange &&
                    function () {
                        onUpdateCallback && onUpdateCallback(); // custom function added to create parallax movement on the images

                        let i = tl.closestIndex();
                        if (lastIndex !== i) {
                            lastIndex = i;
                            onChange(loopItems[i], i);
                        }
                    },
                paused: config.paused,
                defaults: { ease: "none" },
                onReverseComplete: () => {
                    tl.totalTime(tl.rawTime() + tl.duration() * 100);
                },
            }) as HorizontalLoopTimeline,
            length = loopItems.length,
            startX = loopItems[0].offsetLeft,
            times: number[] = [],
            widths: number[] = [],
            spaceBefore: number[] = [],
            xPercents: number[] = [],
            curIndex = 0,
            indexIsDirty = false,
            center = config.center,
            pixelsPerSecond = (config.speed || 1) * 100,
            snap = config.snap === false ? (v: number) => v : gsap.utils.snap(config.snap || 1), // some browsers shift by a pixel to accommodate flex layouts, so for example if width is 20% the first element's width might be 242px, and the next 243px, alternating back and forth. So we snap to 5 percentage points to make things look more natural
            timeOffset = 0,
            container =
                center === true
                    ? (loopItems[0].parentNode as HTMLElement)
                    : ((gsap.utils.toArray(center as gsap.DOMTarget)[0] ||
                          loopItems[0].parentNode) as HTMLElement),
            totalWidth: number,
            getTotalWidth = () =>
                loopItems[length - 1].offsetLeft +
                (xPercents[length - 1] / 100) * widths[length - 1] -
                startX +
                spaceBefore[0] +
                loopItems[length - 1].offsetWidth *
                    Number(gsap.getProperty(loopItems[length - 1], "scaleX")) +
                (parseFloat(String(config.paddingRight ?? 0)) || 0),
            populateWidths = () => {
                let b1 = container.getBoundingClientRect(),
                    b2: DOMRect;
                loopItems.forEach((el, i) => {
                    widths[i] = parseFloat(gsap.getProperty(el, "width", "px") as string);
                    xPercents[i] = snap(
                        (parseFloat(gsap.getProperty(el, "x", "px") as string) / widths[i]) * 100 +
                            Number(gsap.getProperty(el, "xPercent")),
                    );
                    b2 = el.getBoundingClientRect();
                    spaceBefore[i] = b2.left - (i ? b1.right : b1.left);
                    b1 = b2;
                });
                gsap.set(loopItems, {
                    // convert "x" to "xPercent" to make things responsive, and populate the widths/xPercents Arrays to make lookups faster.
                    xPercent: (i: number) => xPercents[i],
                });
                totalWidth = getTotalWidth();
            },
            timeWrap: (index: number) => number = gsap.utils.wrap(0, 1),
            populateOffsets = () => {
                timeOffset = center
                    ? (tl.duration() * (container.offsetWidth / 2)) / totalWidth
                    : 0;
                center &&
                    times.forEach((t, i) => {
                        times[i] = timeWrap(
                            tl.labels["label" + i] +
                                (tl.duration() * widths[i]) / 2 / totalWidth -
                                timeOffset,
                        );
                    });
            },
            getClosest = (values: number[], value: number, wrap: number) => {
                let i = values.length,
                    closest = 1e10,
                    index = 0,
                    d;
                while (i--) {
                    d = Math.abs(values[i] - value);
                    if (d > wrap / 2) {
                        d = wrap - d;
                    }
                    if (d < closest) {
                        closest = d;
                        index = i;
                    }
                }
                return index;
            },
            populateTimeline = () => {
                let i,
                    item: HTMLElement,
                    curX: number,
                    distanceToStart: number,
                    distanceToLoop: number;
                tl.clear();
                for (i = 0; i < length; i++) {
                    item = loopItems[i];
                    curX = (xPercents[i] / 100) * widths[i];
                    distanceToStart = item.offsetLeft + curX - startX + spaceBefore[0];
                    distanceToLoop =
                        distanceToStart + widths[i] * Number(gsap.getProperty(item, "scaleX"));
                    tl.to(
                        item,
                        {
                            xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100),
                            duration: distanceToLoop / pixelsPerSecond,
                        },
                        0,
                    )
                        .fromTo(
                            item,
                            {
                                xPercent: snap(
                                    ((curX - distanceToLoop + totalWidth) / widths[i]) * 100,
                                ),
                            },
                            {
                                xPercent: xPercents[i],
                                duration:
                                    (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
                                immediateRender: false,
                            },
                            distanceToLoop / pixelsPerSecond,
                        )
                        .add("label" + i, distanceToStart / pixelsPerSecond);
                    times[i] = distanceToStart / pixelsPerSecond;
                }
                timeWrap = gsap.utils.wrap(0, tl.duration());
            },
            refresh = (deep = false) => {
                let progress = tl.progress();
                tl.progress(0, true);
                populateWidths();
                deep && populateTimeline();
                populateOffsets();
                deep && tl.draggable && tl.paused()
                    ? tl.time(times[curIndex], true)
                    : tl.progress(progress, true);
            },
            onResize = () => refresh(true),
            proxy: HTMLElement | null;
        gsap.set(loopItems, { x: 0 });
        populateWidths();
        populateTimeline();
        populateOffsets();
        window.addEventListener("resize", onResize);
        function toIndex(index: number, vars: gsap.TweenVars = {}) {
            Math.abs(index - curIndex) > length / 2 &&
                (index += index > curIndex ? -length : length); // always go in the shortest direction
            let newIndex = gsap.utils.wrap(0, length, index),
                time = times[newIndex];
            if (time > tl.time() !== index > curIndex && index !== curIndex) {
                // if we're wrapping the timeline's playhead, make the proper adjustments
                time += tl.duration() * (index > curIndex ? 1 : -1);
            }
            if (time < 0 || time > tl.duration()) {
                vars.modifiers = { time: timeWrap };
            }
            curIndex = newIndex;
            vars.overwrite = true;
            gsap.killTweensOf(proxy);
            return vars.duration === 0 ? tl.time(timeWrap(time)) : tl.tweenTo(time, vars);
        }
        tl.toIndex = (index: number, vars?: gsap.TweenVars) => toIndex(index, vars);
        tl.closestIndex = (setCurrent = false) => {
            let index = getClosest(times, tl.time(), tl.duration());
            if (setCurrent) {
                curIndex = index;
                indexIsDirty = false;
            }
            return index;
        };
        tl.current = () => (indexIsDirty ? tl.closestIndex(true) : curIndex);
        tl.next = (vars?: gsap.TweenVars) => toIndex(tl.current() + 1, vars);
        tl.previous = (vars?: gsap.TweenVars) => toIndex(tl.current() - 1, vars);
        tl.times = times;
        tl.progress(1, true).progress(0, true); // pre-render for performance
        if (config.reversed) {
            tl.vars.onReverseComplete?.();
            tl.reverse();
        }
        if (config.draggable && typeof Draggable === "function") {
            proxy = document.createElement("div");
            let wrap = gsap.utils.wrap(0, 1),
                ratio: number,
                startProgress: number,
                draggable: ReturnType<typeof Draggable.create>[0],
                lastSnap: number,
                initChangeX: number,
                wasPlaying: boolean,
                align = () => {
                    tl.progress(wrap(startProgress + (draggable.startX - draggable.x) * ratio));
                },
                syncIndex = () => tl.closestIndex(true);
            typeof InertiaPlugin === "undefined" &&
                console.warn(
                    "InertiaPlugin required for momentum-based scrolling and snapping. https://greensock.com/club",
                );
            draggable = Draggable.create(proxy, {
                trigger: loopItems[0].parentNode as Element,
                type: "x",
                onPressInit() {
                    let x = this.x;
                    gsap.killTweensOf(tl);
                    wasPlaying = !tl.paused();
                    tl.pause();
                    startProgress = tl.progress();
                    refresh();
                    ratio = 1 / totalWidth;
                    initChangeX = startProgress / -ratio - x;
                    gsap.set(proxy, { x: startProgress / -ratio });
                },
                onDrag: align,
                onThrowUpdate: align,
                overshootTolerance: 0,
                inertia: true,
                snap(value) {
                    //note: if the user presses and releases in the middle of a throw, due to the sudden correction of proxy.x in the onPressInit(), the velocity could be very large, throwing off the snap. So sense that condition and adjust for it. We also need to set overshootTolerance to 0 to prevent the inertia from causing it to shoot past and come back
                    if (Math.abs(startProgress / -ratio - this.x) < 10) {
                        return lastSnap + initChangeX;
                    }
                    let time = -(value * ratio) * tl.duration(),
                        wrappedTime = timeWrap(time),
                        snapTime = times[getClosest(times, wrappedTime, tl.duration())],
                        dif = snapTime - wrappedTime;
                    Math.abs(dif) > tl.duration() / 2 &&
                        (dif += dif < 0 ? tl.duration() : -tl.duration());
                    lastSnap = (time + dif) / tl.duration() / -ratio;
                    return lastSnap;
                },
                onRelease() {
                    syncIndex();
                    draggable.isThrowing && (indexIsDirty = true);
                },
                onThrowComplete: () => {
                    syncIndex();
                    wasPlaying && tl.play();
                },
            })[0];
            tl.draggable = draggable;
        }
        tl.closestIndex(true);
        lastIndex = curIndex;
        onChange && onChange(loopItems[curIndex], curIndex);
        timeline = tl;
        return () => window.removeEventListener("resize", onResize); // cleanup
    });
    return timeline;
}

export function stopOverscroll(element: gsap.DOMTarget = window): void {
    const resolved = gsap.utils.toArray(element)[0];
    const normalizedElement: Window | HTMLElement =
        resolved instanceof HTMLElement ? resolved : window;
    const eventSource: Window | HTMLElement =
        normalizedElement === document.body || normalizedElement === document.documentElement
            ? window
            : normalizedElement;
    const isRoot = eventSource === window;
    let scroller: HTMLElement;
    if (isRoot) {
        scroller = (document.scrollingElement as HTMLElement | null) ?? document.documentElement;
    } else {
        scroller = eventSource as HTMLElement;
    }

    let lastScroll = 0;
    let lastTouch: number | null = null;
    let forcing = false;
    let forward = true;

    const ua = `${window.navigator.userAgent}`;
    const getMax = isRoot
        ? () => scroller.scrollHeight - window.innerHeight
        : () => scroller.scrollHeight - scroller.clientHeight;

    const getScrollableParent = (target: EventTarget | null): Element | null => {
        if (!(target instanceof Element)) {
            return null;
        }

        let current: Element | null = target;

        while (current && current !== document.body && current !== document.documentElement) {
            if (current === scroller) {
                return null;
            }

            const { overflowY } = window.getComputedStyle(current);
            const canScrollY =
                (overflowY === "auto" || overflowY === "scroll") &&
                current.scrollHeight > current.clientHeight;

            if (canScrollY) {
                return current;
            }

            current = current.parentElement;
        }

        return null;
    };

    const addListener = (type: string, func: EventListener): void => {
        eventSource.addEventListener(type, func, { passive: false });
    };

    const revert = (): void => {
        scroller.style.overflowY = "auto";
        forcing = false;
    };

    const kill = (): void => {
        forcing = true;
        scroller.style.overflowY = "hidden";
        if (!forward && scroller.scrollTop < 1) {
            scroller.scrollTop = 1;
        } else {
            scroller.scrollTop = getMax() - 1;
        }
        setTimeout(revert, 1);
    };

    const handleTouch = (e: TouchEvent): void => {
        if (getScrollableParent(e.target)) {
            return;
        }

        const evt = e.changedTouches[0];
        if (!evt) {
            return;
        }

        const movingForward = lastTouch === null ? true : evt.pageY <= lastTouch;

        if (
            ((!movingForward && scroller.scrollTop <= 1) ||
                (movingForward && scroller.scrollTop >= getMax() - 1)) &&
            e.type === "touchmove"
        ) {
            e.preventDefault();
        } else {
            lastTouch = evt.pageY;
        }
    };

    const handleScroll = (e: Event): void => {
        if (getScrollableParent(e.target)) {
            return;
        }

        if (!forcing) {
            const scrollTop = scroller.scrollTop;
            forward = scrollTop > lastScroll;
            if ((!forward && scrollTop < 1) || (forward && scrollTop >= getMax() - 1)) {
                e.preventDefault();
                kill();
            }
            lastScroll = scrollTop;
        }
    };

    if ("ontouchend" in document && !!ua.match(/Version\/[\d\.]+.*Safari/)) {
        addListener("scroll", handleScroll as EventListener);
        addListener("touchstart", handleTouch as EventListener);
        addListener("touchmove", handleTouch as EventListener);
    }

    scroller.style.overscrollBehavior = "none";
}
