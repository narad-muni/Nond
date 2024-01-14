import { BaseModel, BelongsTo, HasMany, belongsTo, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Scheduler from './Scheduler'

export default class Client extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public name: string

    @column()
    public email: string

    @column()
    public gst: object

    @column()
    public pan: object

    @column()
    public address: string

    @column()
    public signature: object

    @column()
    public logo: object

    @column()
    public group_id: number

    @column()
    public deleted: boolean

    @hasMany(() => Scheduler, {
        foreignKey: 'client_id'
    })
    public services: HasMany<typeof Scheduler>

    @belongsTo(() => Client, {
        foreignKey: 'group_id'
    })
    public group: BelongsTo<typeof Client>

    @hasMany(() => Client, {
        localKey: 'id',
        foreignKey: 'group_id'
    })
    public subsidiary: HasMany<typeof Client>
}
