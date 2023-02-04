import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Role extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public read: Array<string>

  @column()
  public create: Array<string>

  @column()
  public update: Array<string>

  @column()
  public update_self: Array<string>

  @column()
  public remove: Array<string>

  @column()
  public remove_self: Array<string>

  @column()
  public destroy: Array<string>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
