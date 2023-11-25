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

    @belongsTo(() => Employee, {
        foreignKey: 'assigned_to',
    })
    public assigned_user: BelongsTo<typeof Employee>

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
    public started: DateTime
}
