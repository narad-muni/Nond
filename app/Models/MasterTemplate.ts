import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class MasterTemplate extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public table_name: 'clients' | 'companies'

    @column()
    public column_name: string

    @column()
    public display_name: string

    @column()
    public order: number

    @column()
    public column_type: 'Text' | 'File' | 'Date' | 'Checkbox' | 'Dropdown'

    @column()
    public column_info: object

    @column()
    public is_master: boolean
}
