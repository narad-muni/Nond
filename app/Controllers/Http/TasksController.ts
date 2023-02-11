import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Task from 'App/Models/Task'

export default class TasksController {
    public async index({response}: HttpContextContract){
        const data = await Task
            .query()
            .preload('client', (query) => {
                query.select('name')
            })
            .preload('assigned_user', (query) => {
                query.select('username')
            })
            .whereNot('status','Done')

        response.send({
            status: 'success',
            data: data
        });
    }

    public async indexALl({response}: HttpContextContract){
        const data = await Task
            .query()
            .preload('client', (query) => {
                query.select('name')
            })
            .preload('assigned_user', (query) => {
                query.select('username')
            });

        response.send({
            status: 'success',
            data: data
        });
    }

    public async get({}: HttpContextContract){}

    public async create({}: HttpContextContract){}

    public async update({}: HttpContextContract){}

    //TODO decide, confirm from CA
    public async archive({}: HttpContextContract){}

    public async remove({}: HttpContextContract){}

    public async destroy({}: HttpContextContract){}
}
