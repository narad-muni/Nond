import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Client from './Client'
import Employee from './Employee'

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
    public status: string

    @column()
    public service: string

    @column()
    public register: string
    
    @column.date()
    public started: DateTime
    
    @column.date()
    public ended: DateTime

    @belongsTo(() => Client,{
        foreignKey: 'client_id'
    })
    public client: BelongsTo<typeof Client>

    @belongsTo(() => Employee,{
        foreignKey: 'assigned_to'
    })
    public assigned_user: BelongsTo<typeof Employee>
}
