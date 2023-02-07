import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Template from './Template'

export default class Register extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public name: string
    
    @column()
    public template_id: number

    @column()
    public is_active: boolean

    @column()
    public columns: object

    @column()
    public deleted: boolean

    @belongsTo(() => Template,{
        foreignKey: 'template_id'
    })
    public template: BelongsTo<typeof Template>
}
