/** @typedef {typeof __propDef.props}  TimeProps */
/** @typedef {typeof __propDef.events}  TimeEvents */
/** @typedef {typeof __propDef.slots}  TimeSlots */
export default class Time extends SvelteComponentTyped<{
    i18n: i18nType;
    date?: Date | null | undefined;
    startDate?: Date | null | undefined;
    endDate?: Date | null | undefined;
    minuteIncrement?: number | undefined;
    showMeridian?: boolean | undefined;
    hasDateComponent?: boolean | undefined;
    minuteSwitch?: ((val: boolean | null) => boolean | undefined) | undefined;
    makeTick?: ((val: number) => void) | undefined;
}, {
    time: CustomEvent<any>;
    close: CustomEvent<any>;
    switch: CustomEvent<any>;
    'time-switch': CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {}> {
    get minuteSwitch(): (val: boolean | null) => boolean | undefined;
    get makeTick(): (val: number) => void;
}
export type TimeProps = typeof __propDef.props;
export type TimeEvents = typeof __propDef.events;
export type TimeSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        i18n: i18nType;
        date?: Date | null | undefined;
        startDate?: Date | null | undefined;
        endDate?: Date | null | undefined;
        minuteIncrement?: number | undefined;
        showMeridian?: boolean | undefined;
        hasDateComponent?: boolean | undefined;
        minuteSwitch?: ((val: boolean | null) => boolean | undefined) | undefined;
        makeTick?: ((val: number) => void) | undefined;
    };
    events: {
        time: CustomEvent<any>;
        close: CustomEvent<any>;
        switch: CustomEvent<any>;
        'time-switch': CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
