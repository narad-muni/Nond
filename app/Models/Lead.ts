import { BaseModel, belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'
import Employee from './Employee'

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

    @belongsTo(() => Employee,{
        foreignKey: 'assigned_to',
    })
    public assigned_user: BelongsTo<typeof Employee>

    @column.date({
        serialize: (value: DateTime) => value.toLocaleString(DateTime.DATE_MED),
    })
    public started: DateTime
}
