import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Template extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public name: string

    @column()
    public columns: object

    @column()
    public client_columns: object

    @column()
    public cost: number

    @column()
    public per: string
}
