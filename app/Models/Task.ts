import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Client from './Client'
import Employee from './Employee'
import Service from './Service'

export default class Task extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public assigned_to: number
    
    @column()
    public title: string

    @column()
    public client_id: number
    
    @column()
    public description: string
    
    @column()
    public status: number

    @column()
    public priority: number

    @column()
    public service_id: number

    @column()
    public billed: boolean
    
    @column.date({ autoCreate:true })
    public created: DateTime
    
    @belongsTo(() => Service,{
        foreignKey: 'service_id'
    })
    public service: BelongsTo<typeof Service>

    @belongsTo(() => Client,{
        foreignKey: 'client_id'
    })
    public client: BelongsTo<typeof Client>

    @belongsTo(() => Employee,{
        foreignKey: 'assigned_to'
    })
    public assigned_user: BelongsTo<typeof Employee>
}
