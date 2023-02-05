import { DateTime } from 'luxon'
import { BaseModel, beforeSave, BelongsTo, belongsTo, column} from '@ioc:Adonis/Lucid/Orm'
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

    @belongsTo(() => Role,{
        foreignKey: 'role_id'
    })
    public role: BelongsTo<typeof Role>

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime

    @beforeSave()
    public static async hashPassword(user: Employee) {
        if (user.$dirty.password) {
        user.password = Crypto.createHash('sha256').update(user.password).digest('hex');
        }
    }

}
