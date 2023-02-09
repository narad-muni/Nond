import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Client extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public name: string

    @column()
    public email: string

    @column()
    public gstin: string

    @column()
    public deleted: boolean
}
