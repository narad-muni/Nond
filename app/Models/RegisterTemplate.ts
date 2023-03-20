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
    public column_type: 'Text' | 'File' | 'Date' | 'Checkbox'

    @column()
    public client_column: boolean

    @column()
    public master: boolean
}
