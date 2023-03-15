import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Client from './Client'
import Company from './Company'

export default class Invoice extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public client_id: number

    @column()
    public company_id: number

    @column()
    public description: object

    @column()
    public paid: boolean

    @column()
    public total: number

    @column.date()
    public date: DateTime

    @belongsTo(() => Client,{
        foreignKey: 'client_id'
    })
    public client: BelongsTo<typeof Client>

    @belongsTo(() => Company,{
        foreignKey: 'company_id'
    })
    public company: BelongsTo<typeof Company>
}
