export type HorizontalLoopConfig = {
    center?: boolean | string | Element | Element[];
    draggable?: boolean;
    onChange?: (element: HTMLElement, index: number) => void;
    paused?: boolean;
    paddingRight?: number | string;
    repeat?: number;
    reversed?: boolean;
    snap?: number | false;
    speed?: number;
};

export type HorizontalLoopTimeline = gsap.core.Timeline & {
    toIndex: (index: number, vars?: gsap.TweenVars) => gsap.core.Tween | gsap.core.Timeline;
    closestIndex: (setCurrent?: boolean) => number;
    current: () => number;
    next: (vars?: gsap.TweenVars) => gsap.core.Tween | gsap.core.Timeline;
    previous: (vars?: gsap.TweenVars) => gsap.core.Tween | gsap.core.Timeline;
    times: number[];
    draggable?: ReturnType<typeof Draggable.create>[0];
};
