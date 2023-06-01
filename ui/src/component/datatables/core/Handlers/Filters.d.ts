import type Context from '../Context';
import type { Writable } from 'svelte/store';
export default class Filters {
    filters: Writable<any[]>;
    constructor(context: Context);
    set(value: string, filterBy: Function | string, filterType: string): void;
    remove(): void;
    private parse;
}
