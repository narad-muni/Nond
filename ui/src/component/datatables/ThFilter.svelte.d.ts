import { SvelteComponentTyped } from "svelte";
import type { DataHandler } from './core';
declare const __propDef: {
    props: {
        handler: DataHandler;
        filterBy?: any;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type ThFilterProps = typeof __propDef.props;
export type ThFilterEvents = typeof __propDef.events;
export type ThFilterSlots = typeof __propDef.slots;
export default class ThFilter extends SvelteComponentTyped<ThFilterProps, ThFilterEvents, ThFilterSlots> {
}
export {};
