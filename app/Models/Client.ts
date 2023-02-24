import { BaseModel, BelongsTo, HasMany, belongsTo, column, hasMany } from '@ioc:Adonis/Lucid/Orm'

export default class Client extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public name: string

    @column()
    public email: string

    @column()
    public gstin: string

    @column()
    public services: object

    @column()
    public group_id: number

    @column()
    public deleted: boolean

    @belongsTo(() => Client,{
        foreignKey: 'group_id'
    })
    public group: BelongsTo<typeof Client>

    @hasMany(() => Client,{
        localKey: 'id',
        foreignKey: 'group_id'
    })
    public subsidiary: HasMany<typeof Client>
}
