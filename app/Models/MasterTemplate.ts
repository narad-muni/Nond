import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class MasterTemplate extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public table_name: 'client' | 'company'

    @column()
    public column_name: string

    @column()
    public column_type: 'Text' | 'File' | 'Date' | 'Checkbox'

    @column()
    public is_master: boolean
}
