import { string } from '@ioc:Adonis/Core/Helpers'

export default class StringUtils {

    static sanitizeTableName(table_name: String){
        // Remove any characters that are not alphanumeric or underscores
        const sanitizedString = table_name.replace(/[^a-zA-Z0-9_]/g, '_');
        
        // Ensure the string starts with a letter
        let tableName = sanitizedString.replace(/^\d+/, ''); // Remove leading numbers
        
        return tableName;
    }

    static shortName(str: String) {

        str = str.trim();

        if (str.length == 0) {
            return "";
        }

        let arr = str.split(" ");
        let suffix = "";


        if (arr.length == 1) {
            suffix = arr[0].substr(0, 3).toUpperCase();
        } else {
            arr.forEach(word => {
                suffix += word[0].toUpperCase();
            })
        }

        return suffix;

    }

    static formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    }

    static getFinancialYear() {
        const today = new Date();
        const month = today.getMonth() + 1;
        const year = parseInt(today.getFullYear().toString().substring(2));

        let FY = "";

        if (month >= 4) {
            FY = year.toString() + (year + 1).toString();
        } else {
            FY = (year - 1).toString() + year.toString();
        }

        return FY;
    }

    static getCurrentFinancialYearStart(start_date: Date | null = null) {
        const today = start_date || new Date();
        const month = today.getMonth() + 1;
        const year = today.getFullYear();

        if (month >= 4) {
            return year.toString() + "-04-01";
        } else {
            return (year - 1).toString() + "-04-01";
        }
    }

    static getPreviousFinancialYearStart(start_date: Date | null = null) {
        const today = start_date || new Date();
        const month = today.getMonth() + 1;
        const year = today.getFullYear();

        if (month >= 4) {
            return (year - 1).toString() + "-04-01";
        } else {
            return (year - 2).toString() + "-04-01";
        }
    }

    // @ts-ignore
    static inWords(amount) {
        var a = ['','one ','two ','three ','four ', 'five ','six ','seven ','eight ','nine ','ten ','eleven ','twelve ','thirteen ','fourteen ','fifteen ','sixteen ','seventeen ','eighteen ','nineteen '];
        var b = ['', '', 'twenty','thirty','forty','fifty', 'sixty','seventy','eighty','ninety'];

        function inWords (num) {
            if ((num = num.toString()).length > 9) return 'overflow';
            let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
            if (!n) return; var str = '';
            str += (n[1] != '0') ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
            str += (n[2] != '0') ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
            str += (n[3] != '0') ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
            str += (n[4] != '0') ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
            str += (n[5] != '0') ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
            return str;
        }

        const rupees = Math.floor(amount);
        const paise = Math.round((amount - rupees) * 100);

        const rupeesWords = inWords(rupees);
        const paiseWords = inWords(paise);

        const rupeesText = rupeesWords ? rupeesWords + ' rupees ' : 'zero rupees ';
        const paiseText = paiseWords ? 'and ' + paiseWords + ' paise' : '';

        return string.capitalCase(rupeesText + paiseText);
    }

}
