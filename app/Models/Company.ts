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
    public prefix: string

    @column()
    public gst: string

    @column()
    public upi: string

    @column()
    public email: string

    @column()
    public address: string

    @column()
    public AHName: string

    @column()
    public BankName: string

    @column()
    public AccountNo: string

    @column()
    public IFSC: string

    @column()
    public pan: string

    @column()
    public smtp_host: string

    @column()
    public smtp_port: string

    @column()
    public smtp_email: string

    @column()
    public smtp_password: string

    @column()
    public smtp_type: string

    @column()
    public signature: string

    @column()
    public logo: string

    @column()
    public integer: string

    @column()
    public deleted: boolean


    @beforeSave()
    public static async process(company: Company) {
        if (company.$dirty.signature != null) {
            company.signature = '/file/company/' + company.id + '/signature' + company.signature;
        }

        if (company.$dirty.logo != null) {
            company.logo = '/file/company/' + company.id + '/logo' + company.logo;
        }
    }

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
