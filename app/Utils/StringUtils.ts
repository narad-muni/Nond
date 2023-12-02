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

    static getCurrentFinancialYearStart() {
        const today = new Date();
        const month = today.getMonth() + 1;
        const year = today.getFullYear();

        if (month >= 4) {
            return year.toString() + "-04-01";
        } else {
            return (year - 1).toString() + "-04-01";
        }
    }

    static getPreviousFinancialYearStart() {
        const today = new Date();
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
        const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
        const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

        function convertLessThanHundred(num) {
            let word = '';
            if (num < 20) {
                word = ones[num];
            } else {
                word = tens[Math.floor(num / 10)] + ' ' + ones[num % 10];
            }
            return word.trim();
        }

        function convertToWordsRecursive(num) {
            let word = '';
            if (num < 100) {
                word = convertLessThanHundred(num);
            } else if (num < 1000) {
                word = ones[Math.floor(num / 100)] + ' hundred ' + convertToWordsRecursive(num % 100);
            }
            return word.trim();
        }

        const rupees = Math.floor(amount);
        const paise = Math.round((amount - rupees) * 100);

        const rupeesWords = convertToWordsRecursive(rupees);
        const paiseWords = convertToWordsRecursive(paise);

        const rupeesText = rupeesWords ? rupeesWords + ' rupees ' : 'zero rupees ';
        const paiseText = paiseWords ? 'and ' + paiseWords + ' paise' : '';

        return string.capitalCase(rupeesText + paiseText);
    }

}
