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
        serialize: (value: DateTime) => value?.toFormat('d LLL yyyy'),
    })
    public entry_on: DateTime

    @belongsTo(() => Client, {
        foreignKey: 'client_id'
    })
    public __client: BelongsTo<typeof Client>
}
