export default class Search {
    globalSearch;
    constructor(context) {
        this.globalSearch = context.globalSearch;
    }
    set(value, scope = null) {
        this.globalSearch.update(store => {
            store = {
                value: value ?? '',
                scope: scope ?? null
            };
            return store;
        });
    }
    remove() {
        this.globalSearch.set({ value: null, scope: null });
    }
}
