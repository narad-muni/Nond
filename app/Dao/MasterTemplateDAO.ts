import { DateTime } from 'luxon';
import { BaseModel } from '@ioc:Adonis/Lucid/Orm';
import MasterTemplate from 'App/Models/MasterTemplate';

export default class MasterTemplateDAO {

    public static dateOptions = {
        serialize: (value) => {
            if (value instanceof Date) {
                return DateTime.fromJSDate(value).toLocaleString(DateTime.DATE_MED);
            } else {
                return value
            }
        }
    }

    public static async getAllColumns(table_name: string) {
        const columns = await MasterTemplate
            .query()
            .where('table_name', table_name);

        return columns;
    }

    public static async getMasterColumns(table_name: string) {
        const columns = await MasterTemplate
            .query()
            .where('is_master', true)
            .where('table_name', table_name);

        return columns;
    }

    public static async setColumns(table: typeof BaseModel, columns: MasterTemplate[]){
        for(const column of columns) {

            if (column.column_type == 'Date') {
                table.$addColumn(column.column_name, this.dateOptions);
            } else {
                table.$addColumn(column.column_name, {});
            }

        }
    }

}
