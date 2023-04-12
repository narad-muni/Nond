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
    public frequency: '1 day' | '1 week' | '2 weeks' | '1 month' | '3 months' | '6 months' | '1 year'
    
    @column.date({
        serialize: (value: DateTime) => value?.toLocaleString(DateTime.DATE_MED),
    })
    public next: DateTime
}
