import type { Readable, Writable } from 'svelte/store';
import type { Internationalization } from '$lib';
export type Params = {
    rowsPerPage?: number;
    i18n?: Internationalization;
};
export default class DataHandler {
    private context;
    private rows;
    private pages;
    private globalSearch;
    private filters;
    i18n: Internationalization;
    constructor(data?: any[], params?: Params);
    setRows(data: any[]): void;
    getRows(): Readable<any[]>;
    getSelected(): Writable<any[]>;
    select(id: any): void;
    selectAll(accessor: string, scope?: 'page' | 'all'): void;
    isAllSelected(): Readable<boolean>;
    getRowCount(): Readable<{
        total: number;
        start: number;
        end: number;
    }>;
    getRowsPerPage(): Writable<number | null>;
    sort(orderBy: Function | string): void;
    applySorting(params?: {
        orderBy: Function | string;
        direction?: 'asc' | 'desc' | null;
    } | null): void;
    sortAsc(orderBy: Function | string): void;
    sortDesc(orderBy: Function | string): void;
    getSorted(): Writable<{
        identifier: string | null;
        direction: 'asc' | 'desc' | null;
    }>;
    search(value: string, scope?: string[]): void;
    clearSearch(): void;
    filter(value: string, filterBy: ((row: any) => string | number | boolean) | string): void;
    clearFilters(): void;
    getPages(params?: {
        ellipsis: boolean;
    }): Readable<number[]>;
    getPageCount(): Readable<number>;
    getPageNumber(): Readable<number>;
    setPage(value: number | 'previous' | 'next'): void;
    getTriggerChange(): Writable<number>;
    translate(i18n: Internationalization): Internationalization;
    /**
     * Deprecated
     * use setRows() instead
     */
    update(data: any[]): void;
}
