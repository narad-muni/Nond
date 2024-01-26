import { DateTime } from 'luxon';
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm';

export default class ArchivedTask extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public assigned_to: string

    @column()
    public title: string

    @column()
    public client: string

    @column()
    public status: number

    @column()
    public priority: number

    @column()
    public money: object[]

    @column()
    public time: object[]
    
    @column()
    public total_time: string

    @column()
    public total_money: number

    @column()
    public billed: boolean

    @column()
    public invoice_id: string

    @column()
    public group: string

    @column()
    public description: string

    @column()
    public service: string

    @column.date({
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
    public created: DateTime
}
