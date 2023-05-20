import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, beforeCreate, beforeUpdate, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Client from './Client'
import Company from './Company'
import StringUtils from 'App/Utils/StringUtils'

export default class Invoice extends BaseModel {
    @column({ isPrimary: true })
    public id: string

    @column()
    public client_id: number

    @column()
    public company_id: number

    @column()
    public particulars: object | any

    @column()
    public remarks: string

    @column()
    public note: string

    @column()
    public paid: boolean

    @column()
    public gst: boolean

    @column()
    public total: number

    @column()
    public tax: number

    @column.date({
        serialize: (value: DateTime) => value?.toLocaleString(DateTime.DATE_MED),
    })
    public date: DateTime

    @belongsTo(() => Client,{
        foreignKey: 'client_id'
    })
    public client: BelongsTo<typeof Client>

    @belongsTo(() => Company,{
        foreignKey: 'company_id'
    })
    public company: BelongsTo<typeof Company>

    @beforeCreate()
    public static async generateNextInvoiceNumber(payload: Invoice){

        const company_details = await Company
            .query()
            .where('id',payload.company_id)
            .increment('invoice_counter',1)
            .update({},['prefix','invoice_counter']);

        payload.id = company_details[0].prefix + "-" + StringUtils.getFinancialYear() + "-" + company_details[0]['invoice_counter'];

    }
}
