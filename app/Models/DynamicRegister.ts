import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm';
import Client from './Client';
import { DateTime } from 'luxon';

export default class DynamicRegister extends BaseModel {

    public static table = "";

    @column({ isPrimary: true })
    public id: number

    @column()
    public client_id: number

    @column.date({
        serialize: (value: DateTime) => {
            if (value instanceof Date) {
                return DateTime.fromJSDate(value).toFormat('d LLL yyyy');
            } else if(value instanceof DateTime){
                return value.toFormat('d LLL yyyy');
            } else {
                return value
            }
        },
    })
    public entry_on: DateTime

    @belongsTo(() => Client, {
        foreignKey: 'client_id'
    })
    public __client: BelongsTo<typeof Client>
}
