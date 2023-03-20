import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class ArchivedRegisterTemplate extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public table_id: number

    @column()
    public columns: object

}
