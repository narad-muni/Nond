import { get } from 'svelte/store';
export default class Rows {
    rawRows;
    filteredRows;
    rows;
    triggerChange;
    sorted;
    selected;
    selectScope;
    isAllSelected;
    constructor(context) {
        this.rawRows = context.rawRows;
        this.filteredRows = context.filteredRows;
        this.rows = context.rows;
        this.triggerChange = context.triggerChange;
        this.sorted = context.sorted;
        this.selected = context.selected;
        this.selectScope = context.selectScope;
        this.isAllSelected = context.isAllSelected;
    }
    sort(orderBy) {
        if (!orderBy)
            return;
        const sorted = this.getSorted();
        const parsed = this.parse(orderBy);
        if (sorted.identifier !== parsed.identifier) {
            this.sorted.update(store => store.direction = null);
        }
        if (sorted.direction === null || sorted.direction === 'desc') {
            this.sortAsc(orderBy);
        }
        else if (sorted.direction === 'asc') {
            this.sortDesc(orderBy);
        }
    }
    sortAsc(orderBy) {
        if (!orderBy)
            return;
        const parsed = this.parse(orderBy);
        this.sorted.set({ identifier: parsed.identifier, direction: 'asc', fn: parsed.fn });
        this.rawRows.update(store => {
            try {
                store.sort((a, b) => {
                    if (typeof (parsed.fn(b)) === "boolean") {
                        return parsed.fn(a) ? -1 : 1;
                    }
                    else if (!parsed.fn(b))
                        return 1;
                    else if (!parsed.fn(a))
                        return -1;
                    else {
                        return parsed.fn(a).localeCompare(parsed.fn(b));
                    }
                });
                return store;
            }
            catch (e) {
                return store.sort((a, b) => parseFloat(parsed.fn(a)) - parseFloat(parsed.fn(b)));
            }
        });
        this.triggerChange.update(store => { return store + 1; });
    }
    sortDesc(orderBy) {
        if (!orderBy)
            return;
        const parsed = this.parse(orderBy);
        this.sorted.set({ identifier: parsed.identifier, direction: 'desc', fn: parsed.fn });
        this.rawRows.update(store => {
            try {
                store.sort((a, b) => {
                    if (typeof (parsed.fn(b)) === "boolean") {
                        return parsed.fn(a) ? 1 : -1;
                    }
                    else if (!parsed.fn(a))
                        return 1;
                    else if (!parsed.fn(b))
                        return -1;
                    else {
                        return parsed.fn(b).localeCompare(parsed.fn(a));
                    }
                });
                return store;
            }
            catch (e) {
                return store.sort((a, b) => parseFloat(parsed.fn(b)) - parseFloat(parsed.fn(a)));
            }
        });
        this.triggerChange.update(store => { return store + 1; });
    }
    applySorting(params = null) {
        if (params) {
            switch (params.direction) {
                case 'asc': return this.sortAsc(params.orderBy);
                case 'desc': return this.sortDesc(params.orderBy);
                default: return this.sort(params.orderBy);
            }
        }
        const sorted = this.getSorted();
        if (sorted.identifier) {
            return this.applySorting({
                orderBy: sorted.fn,
                direction: sorted.direction
            });
        }
        return;
    }
    parse(orderBy) {
        if (typeof (orderBy) === 'string') {
            return {
                fn: (row) => row[orderBy],
                identifier: orderBy.toString()
            };
        }
        return {
            fn: orderBy,
            identifier: orderBy.toString()
        };
    }
    getSorted() {
        let $sorted;
        this.sorted.subscribe(store => $sorted = store);
        return $sorted;
    }
    select(id) {
        const selected = get(this.selected);
        if (selected.includes(id)) {
            this.selected.set(selected.filter(item => item !== id));
        }
        else {
            this.selected.set([id, ...selected]);
        }
    }
    selectAll(accessor) {
        const isAllSelected = get(this.isAllSelected);
        const selectScope = get(this.selectScope);
        if (isAllSelected) {
            return this.unselectAll();
        }
        const rows = (selectScope === 'page') ? get(this.rows) : get(this.filteredRows);
        this.selected.set(rows.map(row => { return row[accessor]; }));
    }
    unselectAll() {
        this.selected.set([]);
    }
}
