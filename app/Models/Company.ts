import { BaseModel, beforeDelete, beforeSave, column } from '@ioc:Adonis/Lucid/Orm'
import fs from 'fs-extra';
import Application from '@ioc:Adonis/Core/Application';
import Invoice from './Invoice';

export default class Company extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public name: string

    @column()
    public invoice_prefix: string

    @column()
    public gst: object

    @column()
    public upi: string

    @column()
    public email: string

    @column()
    public address: string

    @column()
    public account_holder_name: string

    @column()
    public bank_name: string

    @column()
    public account_number: string

    @column()
    public ifsc_branch: string

    @column()
    public pan: object

    @column()
    public smtp_host: string

    @column()
    public smtp_port: string

    @column()
    public smtp_email: string

    @column()
    public smtp_password: string

    @column()
    public signature: object

    @column()
    public logo: object

    @column()
    public integer: string

    @column()
    public deleted: boolean

    @beforeDelete()
    public static async cascadeDelete(company: Company) {
        //delete files
        try {
            fs.removeSync(Application.makePath(`/file/company/${company.id}`));
        } catch (err) { }

        //delete Invoices
        await Invoice
            .query()
            .where('company_id', company.id)
            .delete();
    }

}
