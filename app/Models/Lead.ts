import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Lead extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public client: string

    @column()
    public status: string

    @column()
    public description: string

    @column()
    public assigned_to: number
}
