import type Context from '../Context';
export type Sorted = {
    fn?: Function;
    identifier: string | null;
    direction: 'asc' | 'desc' | null;
    locales?: string;
    options?: Object;
};
export type SortingParams = {
    locales?: string;
    options?: Object;
};
export default class Rows {
    private rawRows;
    private filteredRows;
    private rows;
    private triggerChange;
    private sorted;
    private selected;
    private selectScope;
    private isAllSelected;
    constructor(context: Context);
    sort(orderBy: Function | string): void;
    sortAsc(orderBy: Function | string): void;
    sortDesc(orderBy: Function | string): void;
    applySorting(params?: {
        orderBy: Function | string;
        direction?: 'asc' | 'desc' | null;
    } | null): any;
    private parse;
    private getSorted;
    select(id: any): void;
    selectAll(accessor: string): void;
    unselectAll(): void;
}
