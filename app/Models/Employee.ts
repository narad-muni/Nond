import { BaseModel, beforeSave, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Role from './Role'
import Crypto from 'crypto';

export default class Employee extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public username: string

    @column({ serializeAs: null })
    public password: string

    @column()
    public role_id: number

    @column()
    public is_admin: boolean

    @column({
        serializeAs: null
    })
    public deleted: boolean

    @belongsTo(() => Role, {
        foreignKey: 'role_id',
    })
    public role: BelongsTo<typeof Role>

    @beforeSave()
    public static async hashPassword(user: Employee) {
        if (user.$dirty.password) {
            user.password = Crypto.createHash('sha256').update(user.password).digest('hex');
        }
    }

}
