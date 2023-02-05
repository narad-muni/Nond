import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Task extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public assigned_to: number
    
    @column()
    public title: string
    
    @column()
    public description: string
    
    @column()
    public status: string
    
    @column.date()
    public started: DateTime
    
    @column.date()
    public ended: DateTime
}
