import { BaseModel, BelongsTo, HasMany, beforeDelete, belongsTo, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Scheduler from './Scheduler'
import Task from './Task';
import Invoice from './Invoice';

export default class Client extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public name: string

    @column()
    public email: string

    @column()
    public gst: string

    @column()
    public pan: string

    @column()
    public address: string

    @column()
    public group_id: number

    @column()
    public deleted: boolean

    @hasMany(() => Scheduler,{
        foreignKey: 'client_id'
    })
    public services: HasMany<typeof Scheduler>

    @belongsTo(() => Client,{
        foreignKey: 'group_id'
    })
    public group: BelongsTo<typeof Client>

    @hasMany(() => Client,{
        localKey: 'id',
        foreignKey: 'group_id'
    })
    public subsidiary: HasMany<typeof Client>

    @beforeDelete()
    public static async cascadeDelete(client: Client) {

        //delete schedulers
        await Scheduler
            .query()
            .where('client_id', client.id)
            .delete();

        //delete tasks
        await Task
            .query()
            .where('client_id', client.id)
            .delete();

        //delete invoices
        await Invoice
            .query()
            .where('client_id', client.id)
            .delete();

    }
}
