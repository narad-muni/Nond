import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class ArchivedTask extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public assigned_to: string
    
    @column()
    public title: string

    @column()
    public client: string

    @column()
    public group: string
    
    @column()
    public description: string

    @column()
    public service: string
    
    @column.date({ autoCreate:true })
    public created: DateTime
}
