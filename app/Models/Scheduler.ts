import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

export default class Scheduler extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public client_id: number

    @column()
    public service_id: number

    @column()
    public register_id: number

    @column()
    public data: object

    @column()
    public type: number

    @column()
    public count: number

    @column()
    public frequency: '1 day' | '1 week' | '2 weeks' | '1 month' | '3 months' | '6 months' | '1 year' | null

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
    public next: DateTime
}
