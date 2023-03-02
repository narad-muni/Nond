import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

export default class Scheduler extends BaseModel {
    @column({ isPrimary: true })
    public id: number
    public client_id: number
    public service_id: number
    public type: number
    public next: DateTime
  
}
