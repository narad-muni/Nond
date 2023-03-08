import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import TaskTemplate from './TaskTemplate'

export default class Service extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public name: string

    @column()
    public template_id: number

    @belongsTo(() => TaskTemplate,{
        foreignKey: 'template_id'
    })
    public template: BelongsTo<typeof TaskTemplate>

}
