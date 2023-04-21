/** @typedef {typeof __propDef.props}  CalendarProps */
/** @typedef {typeof __propDef.events}  CalendarEvents */
/** @typedef {typeof __propDef.slots}  CalendarSlots */
export default class Calendar extends SvelteComponentTyped<{
    i18n: i18nType;
    date?: Date | null | undefined;
    startDate?: Date | null | undefined;
    endDate?: Date | null | undefined;
    weekStart?: number | undefined;
    initialView?: number | undefined;
    enableTimeToggle?: boolean | undefined;
    handleGridNav?: ((key: string, shiftKey: boolean) => void) | undefined;
}, {
    date: CustomEvent<any>;
    switch: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {}> {
    get handleGridNav(): (key: string, shiftKey: boolean) => void;
}
export type CalendarProps = typeof __propDef.props;
export type CalendarEvents = typeof __propDef.events;
export type CalendarSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        i18n: i18nType;
        date?: Date | null | undefined;
        startDate?: Date | null | undefined;
        endDate?: Date | null | undefined;
        weekStart?: number | undefined;
        initialView?: number | undefined;
        enableTimeToggle?: boolean | undefined;
        handleGridNav?: ((key: string, shiftKey: boolean) => void) | undefined;
    };
    events: {
        date: CustomEvent<any>;
        switch: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
