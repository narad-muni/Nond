import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Client from './Client'
import { DateTime } from 'luxon'

export default class Automator extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public name: string

    @column()
    public triggered_by: number

    @column()
    public status: "Pending" | "Completed" | "Failed"

    @column()
    public message: string

    @column()
    public data: object

    @column()
    public created_on: DateTime

    @belongsTo(() => Client, {
        foreignKey: 'triggered_by'
    })
    public group: BelongsTo<typeof Client>
}
