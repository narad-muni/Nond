import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

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
    public service: number
}
