import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class RegisterTemplate extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public name: string

    @column()
    public columns: object

    @column()
    public client_columns: object
}
