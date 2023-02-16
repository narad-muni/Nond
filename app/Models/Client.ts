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
    public parent_id: number

    @column()
    public deleted: boolean

    @belongsTo(() => Client,{
        foreignKey: 'parent_id'
    })
    public parent: BelongsTo<typeof Client>

    @hasMany(() => Client,{
        localKey: 'id',
        foreignKey: 'parent_id'
    })
    public child: HasMany<typeof Client>
}
