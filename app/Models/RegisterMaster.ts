import { BaseModel, BelongsTo, belongsTo, column, HasOne, hasOne } from '@ioc:Adonis/Lucid/Orm'
import RegisterTemplate from './RegisterTemplate'
import Service from './Service'

export default class RegisterMaster extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public name: string

    @column()
    public version: string

    @column()
    public service_id: number

    @column()
    public active: boolean
    
    @belongsTo(() => Service,{
        foreignKey: 'service_id'
    })
    public service: BelongsTo<typeof Service>

    @hasOne(() => RegisterTemplate,{
        foreignKey: 'master_id'
    })
    public template: HasOne<typeof RegisterTemplate>

}
