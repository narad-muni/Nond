import type { Writable, Readable } from 'svelte/store';
import type { Params } from '../DataHandler';
import type { Sorted } from './Handlers/Rows';
export default class Context {
    rowsPerPage: Writable<number | null>;
    pageNumber: Writable<number>;
    triggerChange: Writable<number>;
    globalSearch: Writable<{
        value: string | null;
        scope: string[] | null;
    }>;
    filters: Writable<any[]>;
    rawRows: Writable<any[]>;
    filteredRows: Readable<any[]>;
    rows: Readable<any[]>;
    rowCount: Readable<{
        total: number;
        start: number;
        end: number;
    }>;
    pages: Readable<number[]>;
    pagesWithEllipsis: Readable<number[]>;
    pageCount: Readable<number>;
    sorted: Writable<Sorted>;
    selected: Writable<any[]>;
    selectScope: Writable<'page' | 'all'>;
    isAllSelected: Readable<boolean>;
    constructor(data: any[], params: Params);
    private createFilteredRows;
    private createPaginatedRows;
    private createRowCount;
    private createPages;
    private createPagesWithEllipsis;
    private createPageCount;
    private stringMatch;
    private createIsAllSelected;
}
