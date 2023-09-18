import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Client from './Client'

export default class DynamicRegister extends BaseModel {

    public static table = "";

    @column({ isPrimary: true })
    public id: number

    @column()
    public client_id: number

    @belongsTo(() => Client, {
        foreignKey: 'client_id'
    })
    public __client: BelongsTo<typeof Client>
}
