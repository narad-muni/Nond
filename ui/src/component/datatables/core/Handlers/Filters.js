import {get} from 'svelte/store'

export default class Filters {
    filters;
    constructor(context) {
        this.filters = context.filters;
    }
    set(value, filterBy, filterType) {
        const parsed = this.parse(filterBy);
        this.filters.update(store => {
            const filter = { filterBy: parsed.fn, value: value, identifier: parsed.identifier, filterType: filterType };
            store = store.filter(item => { return item.identifier !== parsed.identifier && item.value.length > 0; });
            store.push(filter);
            return store;
        });
    }
    remove() {
        this.filters.update(store => store = []);
    }
    parse(filterBy) {
        if (typeof (filterBy) === 'string') {
            return {
                fn: (row) => row[filterBy],
                identifier: filterBy.toString()
            };
        }
        return {
            fn: filterBy,
            identifier: filterBy.toString()
        };
    }
}
