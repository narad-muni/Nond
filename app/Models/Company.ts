import { DateTime } from 'luxon'
import { BaseModel, beforeSave, column } from '@ioc:Adonis/Lucid/Orm'

export default class Company extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public name: string

    @column()
    public gstin: string

    @column()
    public email: string

    @column()
    public signature: string

    @column()
    public deleted: boolean

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
  

    @beforeSave()
    public static async process(company: Company){
        if(company.$dirty.signature != null){
            company.signature = '/file/company/'+company.id+'/signature'+company.signature;
        }
    }

}
