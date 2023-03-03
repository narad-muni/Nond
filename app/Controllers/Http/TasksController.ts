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
            .whereNot('status','4')

        response.send({
            status: 'success',
            data: data
        });
    }

    public async indexAll({response}: HttpContextContract){
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

    public async get({request,response}: HttpContextContract){
        const payload = request.params()
        const data = await Task
            .query()
            .where('id',payload.id)
            .preload('client', (query) => {
                query.select('name')
            })
            .preload('assigned_user', (query) => {
                query.select('username')
            })
            .first();

        if(data){
            response.send({
                status: 'success',
                data: data
            })
        }else{
            response.send({
                status: 'error',
                message: 'Task not found'
            })
        }

    }

    public async create({request,response}: HttpContextContract){
        const payload = request.all();

        if(payload.started == ""){
            payload.started = null;
        }

        if(payload.ended == ""){
            payload.ended = null;
        }

        console.log(payload)

        const data = await Task.create(payload);

        response.send({
            status: 'success',
            data: data
        });
    }

    public async update({request,response}: HttpContextContract){
        const payload = request.all();

        if(payload.status == 4){
            
        }

        delete payload.client;
        delete payload.assigned_user;

        await Task
            .query()
            .where('id',payload.id)
            .update(payload)

        response.send({
            status: 'success',
            data: payload
        })
    }

    //TODO decided, once billed, archive task, keep task for last 2 years
    public async archive({}: HttpContextContract){}

    public async destroy({request,response}: HttpContextContract){
        const payload = request.all();

        await Task
            .query()
            .whereIn('id',payload.id)
            .delete()

        response.send({
            status: 'success'
        })
    }
}
