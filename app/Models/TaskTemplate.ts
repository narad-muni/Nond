import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Service from './Service'

export default class TaskTemplate extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public name: string
    
    @column()
    public title: string
    
    @column()
    public description: string
    
    @column()
    public status: number

    @column()
    public priority: number

    @column()
    public service_id: number

    @belongsTo(() => Service,{
        foreignKey: 'service_id'
    })
    public service: BelongsTo<typeof Service>
}
