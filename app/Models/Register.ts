import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import RegisterMaster from './RegisterMaster'

export default class Register extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public master_id: number

    @column()
    public suffix: string

    @column()
    public active: boolean

    @belongsTo(() => RegisterMaster,{
        foreignKey: 'master_id'
    })
    public master: BelongsTo <typeof RegisterMaster>
}
