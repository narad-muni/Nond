import Context from './core/Context';
import Rows from './core/Handlers/Rows';
import Pages from './core/Handlers/Pages';
import GlobalSearch from './core/Handlers/GlobalSearch';
import Filters from './core/Handlers/Filters';
export default class DataHandler {
    context;
    rows;
    pages;
    globalSearch;
    filters;
    i18n;
    constructor(data = [], params = { rowsPerPage: null }) {
        this.i18n = this.translate(params.i18n);
        this.context = new Context(data, params);
        this.rows = new Rows(this.context);
        this.pages = new Pages(this.context);
        this.globalSearch = new GlobalSearch(this.context);
        this.filters = new Filters(this.context);
    }
    setRows(data) {
        this.context.rawRows.set(data);
        this.applySorting();
    }
    getRows() {
        return this.context.rows;
    }
    getSelected() {
        return this.context.selected;
    }
    select(id) {
        this.rows.select(id);
    }
    selectAll(accessor, scope = 'page') {
        this.context.selectScope.set(scope);
        this.rows.selectAll(accessor);
    }
    isAllSelected() {
        return this.context.isAllSelected;
    }
    getRowCount() {
        return this.context.rowCount;
    }
    getRowsPerPage() {
        return this.context.rowsPerPage;
    }
    sort(orderBy) {
        this.setPage(1);
        this.rows.sort(orderBy);
    }
    applySorting(params = null) {
        this.rows.applySorting(params);
    }
    sortAsc(orderBy) {
        this.setPage(1);
        this.rows.sortAsc(orderBy);
    }
    sortDesc(orderBy) {
        this.setPage(1);
        this.rows.sortDesc(orderBy);
    }
    getSorted() {
        return this.context.sorted;
    }
    search(value, scope = null) {
        this.globalSearch.set(value, scope);
    }
    clearSearch() {
        this.globalSearch.remove();
    }
    filter(value, filterBy, filterType) {
        return this.filters.set(value, filterBy, filterType);
    }
    clearFilters() {
        this.filters.remove();
    }
    getPages(params = { ellipsis: false }) {
        if (params.ellipsis) {
            return this.context.pagesWithEllipsis;
        }
        return this.context.pages;
    }
    getPageCount() {
        return this.context.pageCount;
    }
    getPageNumber() {
        return this.context.pageNumber;
    }
    setPage(value) {
        switch (value) {
            case 'previous': return this.pages.previous();
            case 'next': return this.pages.next();
            default: return this.pages.goTo(value);
        }
    }
    getTriggerChange() {
        return this.context.triggerChange;
    }
    translate(i18n) {
        return { ...{
                search: 'Search...',
                show: 'Show',
                entries: 'entries',
                filter: 'Filter',
                rowCount: 'Showing {start} to {end} of {total} entries',
                noRows: 'No entries to found',
                previous: 'Previous',
                next: 'Next'
            }, ...i18n };
    }
    /**
     * Deprecated
     * use setRows() instead
     */
    update(data) {
        console.log('%c%s', 'color:#e65100;background:#fff3e0;font-size:12px;border-radius:4px;padding:4px;text-align:center;', `DataHandler.update(data) method is deprecated. Please use DataHandler.setRows(data) instead`);
        this.context.rawRows.set(data);
    }
}
