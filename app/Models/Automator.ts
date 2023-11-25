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
    public created_on: DateTime

    @belongsTo(() => Employee, {
        foreignKey: 'triggered_by'
    })
    public user: BelongsTo<typeof Employee>
}
