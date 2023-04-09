import { BaseModel, beforeSave, column } from '@ioc:Adonis/Lucid/Orm'

export default class Company extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public name: string

    @column()
    public gst: string

    @column()
    public email: string

    @column()
    public address: string

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
    public signature: string

    @column()
    public integer: string

    @column()
    public deleted: boolean
  

    @beforeSave()
    public static async process(company: Company){
        if(company.$dirty.signature != null){
            company.signature = '/file/company/'+company.id+'/signature'+company.signature;
        }
    }

}
