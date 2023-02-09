import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Role extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public name: string

    @column()
    public read: object

    @column()
    public create: object

    @column()
    public update: object

    @column()
    public remove: object

    @column()
    public destroy: object
}
