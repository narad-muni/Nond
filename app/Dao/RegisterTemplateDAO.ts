import { DateTime } from 'luxon';
import { BaseModel } from '@ioc:Adonis/Lucid/Orm';
import RegisterTemplate from "App/Models/RegisterTemplate";

export default class RegisterTemplateDAO{

    public static dateOptions = {
        serialize: (value) => {
            if (value instanceof Date) {
                return DateTime.fromJSDate(value).toFormat('d LLL yyyy');
            } else if(value instanceof DateTime){
                return value.toFormat('d LLL yyyy');
            } else {
                return value
            }
        }
    }

    public static async getAllColumns(table_id: number) {
        const columns = await RegisterTemplate
            .query()
            .where('table_id', table_id);

        return columns;
    }

    public static async getTemplateColumns(table_id: number) {
        const columns = await RegisterTemplate
            .query()
            .where('rollover', true)
            .where('table_id', table_id);

        return columns;
    }

    public static async getMasterColumns(table_id: number) {
        const columns = await RegisterTemplate
            .query()
            .where('master', true)
            .where('table_id', table_id);

        return columns;
    }

    public static async setColumns(table: typeof BaseModel, columns: RegisterTemplate[]){
        for(const column of columns) {

            if (column.column_type == 'Date') {
                table.$addColumn(column.column_name, this.dateOptions);
            } else {
                table.$addColumn(column.column_name, {});
            }

        }
    }
}