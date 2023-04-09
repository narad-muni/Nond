export default class StringUtils {

    static shortName(str: String) {
        if(str.length == 0){
            return "";
        }

        let arr = str.split(" ");
        let suffix = "";


        if(arr.length == 1){
            suffix = arr[0].substr(0,3).toUpperCase();
        }else{
            arr.forEach(word => {
                suffix += word[0].toUpperCase();
            })
        }

        return suffix;

    }

    static getFinancialYear(){
        const today = new Date();
        const month = today.getMonth()+1;
        const year = parseInt(today.getFullYear().toString().substring(2));

        let FY = "";

        if ( month >= 4){
            FY = year.toString() + (year+1).toString();
        }else{ 
            FY = (year-1).toString() + year.toString();
        }

        return FY;
    }

    static getCurrentFinancialYearStart(){
        const today = new Date();
        const month = today.getMonth()+1;
        const year = today.getFullYear();

        if ( month >= 4){
            return year.toString() + "-04-01";
        }else{ 
            return (year - 1).toString() + "-04-01";
        }
    }

    static getPreviousFinancialYearStart(){
        const today = new Date();
        const month = today.getMonth()+1;
        const year = today.getFullYear();

        if ( month >= 4){
            return (year - 1).toString() + "-04-01";
        }else{ 
            return (year - 2).toString() + "-04-01";
        }
    }

}