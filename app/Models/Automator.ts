import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'
import Employee from './Employee'

export default class Automator extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public name: string

    @column()
    public triggered_by: number

    @column()
    public status: "Pending" | "Successfull" | "Failed" | "Partially Successfull"

    @column()
    public message: string

    @column()
    public data: object

    @column.dateTime({
        autoCreate: true,
        serialize: (value: DateTime) => value?.toFormat('d LLL yyyy')
    })
    public created_on: DateTime

    @belongsTo(() => Employee, {
        foreignKey: 'triggered_by'
    })
    public user: BelongsTo<typeof Employee>
}
