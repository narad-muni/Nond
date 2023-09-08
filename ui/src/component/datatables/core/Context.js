import { writable, derived } from 'svelte/store';
export default class Context {
    rowsPerPage;
    pageNumber;
    triggerChange;
    globalSearch;
    filters;
    rawRows;
    filteredRows;
    rows;
    rowCount;
    pages;
    pagesWithEllipsis;
    pageCount;
    sorted;
    selected;
    selectScope;
    isAllSelected;
    constructor(data, params) {
        this.rowsPerPage = writable(params.rowsPerPage);
        this.pageNumber = writable(1);
        this.triggerChange = writable(0);
        this.globalSearch = writable({ value: null, scope: null });
        this.filters = writable([]);
        this.rawRows = writable(data);
        this.filteredRows = this.createFilteredRows();
        this.rows = this.createPaginatedRows();
        this.rowCount = this.createRowCount();
        this.pages = this.createPages();
        this.pagesWithEllipsis = this.createPagesWithEllipsis();
        this.pageCount = this.createPageCount();
        this.sorted = writable({ identifier: null, direction: null, fn: null });
        this.selected = writable([]);
        this.selectScope = writable('page');
        this.isAllSelected = this.createIsAllSelected();
    }
    createFilteredRows() {
        return derived([this.rawRows, this.globalSearch, this.filters], ([$rawRows, $globalSearch, $filters]) => {
            if ($globalSearch.value) {
                $rawRows = $rawRows.filter(row => {
                    const scope = $globalSearch.scope ?? Object.keys(row);
                    return scope.some(key => {
                        if (row[key]) {
                            return this.stringMatch(row[key], $globalSearch.value);
                        }
                        return '';
                    });
                });
                this.pageNumber.set(1);
                this.selected.set([]);
                this.triggerChange.update(store => { return store + 1; });
            }
            if ($filters.length > 0) {
                $filters.forEach(localFilter => {
                    return $rawRows = $rawRows.filter(row => {
                        const entry = localFilter.filterBy(row);
                        return this.stringMatch(entry, localFilter.value, localFilter.filterType);
                    });
                });
                this.pageNumber.set(1);
                this.selected.set([]);
                this.triggerChange.update(store => { return store + 1; });
            }
            return $rawRows;
        });
    }
    createPaginatedRows() {
        return derived([this.filteredRows, this.rowsPerPage, this.pageNumber], ([$filteredRows, $rowsPerPage, $pageNumber]) => {
            if (!$rowsPerPage) {
                return $filteredRows;
            }
            this.triggerChange.update(store => { return store + 1; });
            return $filteredRows.slice(($pageNumber - 1) * $rowsPerPage, $pageNumber * $rowsPerPage);
        });
    }
    createRowCount() {
        return derived([this.filteredRows, this.pageNumber, this.rowsPerPage], ([$filteredRows, $pageNumber, $rowsPerPage]) => {
            const total = $filteredRows.length;
            if (!$rowsPerPage) {
                return { total: total, start: 1, end: total };
            }
            return {
                total: total,
                start: ($pageNumber * $rowsPerPage - $rowsPerPage) + 1,
                end: Math.min(($pageNumber * $rowsPerPage), $filteredRows.length),
            };
        });
    }
    createPages() {
        return derived([this.rowsPerPage, this.filteredRows], ([$rowsPerPage, $filteredRows]) => {
            if (!$rowsPerPage) {
                return [1];
            }
            const pages = Array.from(Array(Math.ceil($filteredRows.length / $rowsPerPage)));
            return pages.map((row, i) => {
                return i + 1;
            });
        });
    }
    createPagesWithEllipsis() {
        return derived([this.pages, this.pageNumber], ([$pages, $pageNumber]) => {
            if ($pages.length <= 7) {
                return $pages;
            }
            const ellipse = null;
            const firstPage = 1;
            const lastPage = $pages.length;
            if ($pageNumber <= 4) {
                return [
                    ...$pages.slice(0, 5),
                    ellipse,
                    lastPage,
                ];
            }
            else if ($pageNumber < $pages.length - 3) {
                return [
                    firstPage,
                    ellipse,
                    ...$pages.slice($pageNumber - 2, $pageNumber + 1),
                    ellipse,
                    lastPage
                ];
            }
            else {
                return [
                    firstPage,
                    ellipse,
                    ...$pages.slice($pages.length - 5, $pages.length)
                ];
            }
        });
    }
    createPageCount() {
        return derived(this.pages, ($pages) => {
            return $pages.length;
        });
    }
    validJSDates(date) {
        try{
            const dateFormats = [
                /^\d{1,2}\/\d{1,2}\/\d{4}$/,         // DD/MM/YYYY
                /^\d{1,2}\.\d{1,2}\.\d{4}$/,         // DD.MM.YYYY
                /^\d{1,2}-\d{1,2}-\d{4}$/,           // DD-MM-YYYY

                /^\d{4}\/\d{1,2}\/\d{1,2}$/,         // YYYY/MM/DD
                /^\d{4}\.\d{1,2}\.\d{1,2}$/,         // YYYY.MM.DD
                /^\d{4}-\d{1,2}-\d{1,2}$/,           // YYYY-MM-DD

                /^[A-Za-z]{3} \d{1,2}(\,)? \d{4}$/,     // Jan 06, 2019 |  Jan 06 2019
                /^\d{4} [A-Za-z]{3} \d{1,2}$/,     // 2019 Jan 06
                /^\d{1,2} [A-Za-z]{3} \d{4}$/      // 06 Jan 2019

            ];

            for (const format of dateFormats) {
                const regex = new RegExp(format);
                if (regex.test(date)) {
                  return true; // Match found
                }
            }

            return false;
        }catch{
            return false;
        }
    }
    stringMatch(entry, value, filterType = "like") {
        if(value.length == 0) return true;

        let date = false;

        if(this.validJSDates(entry) && this.validJSDates(value)) {
            value = new Date(value);
            entry = new Date(entry);
            date = true;
        }

        if (typeof entry === 'string' || !entry) {

            if(filterType == "equals"){
                return String(entry)
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                ==
                value
                    .toString()
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                ;
            }else if(filterType == "not equals"){
                return String(entry)
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                !=
                value
                    .toString()
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                ;
            }else if(filterType == "less than"){
                return String(entry)
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                <
                value
                    .toString()
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                ;
            }else if(filterType == "greater than"){
                return String(entry)
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                >
                value
                    .toString()
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                ;
            }else if(filterType == "not like"){
                return String(entry)
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .indexOf(
                    value
                    .toString()
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                ) <= -1;
            }else{ // filterType == "like"
                return String(entry)
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .indexOf(
                    value
                    .toString()
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                ) > -1;
            }
        }else if(typeof entry == 'number'){
            if(filterType == "equals"){
                return entry == value;
            }else if(filterType == "not equals"){
                return entry != value;
            }else if(filterType == "less than"){
                return entry < value;
            }else if(filterType == "greater than"){
                return entry > value;
            }else if(filterType == "not like"){
                return String(entry)
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .indexOf(
                    value
                    .toString()
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                ) <= -1;
            }else{ // filterType == "like"
                return String(entry)
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .indexOf(
                    value
                    .toString()
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                ) > -1;
            }
        }else if(date){
            if(filterType == "equals"){
                return +entry == +value;
            }else if(filterType == "not equals"){
                return +entry != +value;
            }else if(filterType == "less than"){
                return +entry < +value;
            }else if(filterType == "greater than"){
                return +entry > +value;
            }else if(filterType == "not like"){
                return +entry != +value;
            }else{
                return +entry == +value;
            }
        }
        else if (typeof entry === 'object') {
            return Object.keys(entry).some(k => {
                return this.stringMatch(entry[k], value);
            });
        }
        return this.stringMatch(String(entry), String(value), filterType);
    }
    createIsAllSelected() {
        return derived([this.selected, this.rows, this.filteredRows, this.selectScope], ([$selected, $rows, $filteredRows, $selectScope]) => {
            const rowCount = ($selectScope === 'page') ? $rows.length : $filteredRows.length;
            if (rowCount === $selected.length && rowCount !== 0) {
                return true;
            }
            return false;
        });
    }
}
