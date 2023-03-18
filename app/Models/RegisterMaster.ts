import { BaseModel, BelongsTo, belongsTo, column, HasOne, hasOne } from '@ioc:Adonis/Lucid/Orm'
import Register from './Register'
import Service from './Service'

export default class RegisterMaster extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public name: string

    @column()
    public service_id: number

    @belongsTo(() => Service,{
        foreignKey: 'service_id'
    })
    public service: BelongsTo<typeof Service>

    @hasOne(() => Register,{
        foreignKey: 'master_id'
    })
    public active_register: HasOne<typeof Register>
}
