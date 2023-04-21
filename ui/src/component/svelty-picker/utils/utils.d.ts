export function usePosition(el: any, { inputEl, visible, inputRect }: {
    inputEl: any;
    visible: any;
    inputRect: any;
}): {
    destroy: () => void;
};
export function scale(node: any, { delay, duration, easing, start, end, opacity }?: {
    delay?: number | undefined;
    duration?: number | undefined;
    easing?: typeof cubicOut | undefined;
    start?: number | undefined;
    end?: number | undefined;
    opacity?: number | undefined;
}): {
    delay: number;
    duration: number;
    easing: typeof cubicOut;
    css: (_t: any, u: any) => string;
};
import { cubicOut } from "svelte/types/runtime/easing";
