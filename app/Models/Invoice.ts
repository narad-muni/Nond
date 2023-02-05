import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Invoice extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public client_id: number

    @column()
    public description: object

    @column()
    public paid: number

    @column()
    public pending: number

    @column()
    public deleted: boolean
    
    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
}
