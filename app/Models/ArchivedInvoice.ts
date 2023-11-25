import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class ArchivedInvoice extends BaseModel {
    @column({ isPrimary: true })
    public id: string

    @column()
    public client: string

    @column()
    public company: string

    @column()
    public group: string

    @column()
    public particulars: object

    @column()
    public remarks: string

    @column()
    public gst: boolean

    @column()
    public total: number

    @column()
    public tax: number

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
    public date: DateTime

}
