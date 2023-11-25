import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class RegisterTemplate extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public table_id: number

    @column()
    public column_name: string

    @column()
    public display_name: string

    @column()
    public column_type: 'Text' | 'File' | 'Date' | 'Checkbox' | 'Dropdown'

    @column()
    public column_info: object

    @column()
    public order: number

    @column()
    public master: boolean

    @column()
    public rollover: boolean

    @column()
    public client_column_id: number
}
