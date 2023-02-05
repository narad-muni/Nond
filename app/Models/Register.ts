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

    @belongsTo(() => Template,{
        foreignKey: 'template_id'
    })
    public template: BelongsTo<typeof Template>

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
}
