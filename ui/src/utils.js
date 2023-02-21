class utils{
    static compareSets (set1, set2){
        if (set1.size < set2.size) {
            return false;
        } else {
            let isSame = true;
            set2.forEach((value) => {
                if (!set1.has(value)) {
                    isSame = false;
                    return;
                }
            });
            return isSame;
        }
    }


    static convertToCSV(objArray) {
        var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
        var str = '';

        for (var i = 0; i < array.length; i++) {
            var line = '';
            for (var index in array[i]) {
                if (line != '') line += ','

                line += array[i][index];
            }

            str += line + '\r\n';
        }

        return str;
    }

    static downloadCSVFile(headers, items, fileTitle) {
        if (headers) {
            items.unshift(headers);
        }

        // Convert Object to JSON
        var jsonObject = JSON.stringify(items);

        var csv = this.convertToCSV(jsonObject);

        var exportedFilenmae = fileTitle + '.csv' || 'data.csv';

        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, exportedFilenmae);
        } else {
            var link = document.createElement("a");
            if (link.download !== undefined) { // feature detection
                // Browsers that support HTML5 download attribute
                var url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", exportedFilenmae);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }

    static async get(url){
        const requestOptions = {
            method: 'GET'
        };

        const resp = await fetch(url, requestOptions);
        const respJson = await resp.json()

        return respJson;
    }

    static async post_json(url, body){
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        };

        const resp = await fetch(url, requestOptions);
        const respJson = await resp.json()

        return respJson;
    }

    static async post_form(url, body){
        const requestOptions = {
            method: 'POST',
            body: body
        };

        const resp = await fetch(url, requestOptions);
        const respJson = await resp.json()

        return respJson;
    }

    static async put_form(url, body){
        const requestOptions = {
            method: 'PUT',
            body: body
        };

        const resp = await fetch(url, requestOptions);    
        const respJson = await resp.json()

        return respJson;
    }

    static async put_json(url, body){
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        };

        const resp = await fetch(url, requestOptions);    
        const respJson = await resp.json()

        return respJson;
    }

    // prefixed with underscored because delete is a reserved word in javascript
    static async _delete(url,body){
        const requestOptions = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        };

        const resp = await fetch(url, requestOptions);
        const respJson = await resp.json()

        return respJson;
    }

    static getFormData(object) {
        const formData = new FormData();
        Object.keys(object).forEach((key) => {
            formData.append(key, object[key])
        });
        return formData;
    }

    static getArrIntersection(arr1,arr2){
        var setA = new Set(arr1);
        var setB = new Set(arr2);
        var intersection = new Set([...setA].filter(x => setB.has(x)));
        return Array.from(intersection);
    }
}

export default utils;