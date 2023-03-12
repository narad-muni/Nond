import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Task from 'App/Models/Task'

export default class TasksController {
    public async index({request,response}: HttpContextContract){

        const billed = request.param("billed",1);
        const status = request.param("status",1);

        let data:any = Task
            .query()
            .preload('service', (query) => {
                query.select('name')
            })
            .preload('client', (query) => {
                query
                    .select('name','group_id')
                    .preload('group', (query) => {
                        query.select('id','name')
                    })
            })
            .preload('assigned_user', (query) => {
                query.select('username')
            })

        //task billed status
        if(billed == 0){
            data = data
                .whereNot('billed',true)
        }else if(billed == 2){
            data = data
                .where('billed',true)
        }

        //task status
        if(status == 0){
            data = data
                .whereNot('status',4)
        }else if(status == 2){
            data = data
                .where('status',4)
        }

        response.send({
            status: 'success',
            data: await data
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
            .preload('service', (query) => {
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

        const data = await Task.create(payload);

        response.send({
            status: 'success',
            data: data
        });
    }

    public async update({request,response}: HttpContextContract){
        const payload = request.all();

        delete payload.client;
        delete payload.assigned_user;
        delete payload.service;


        await Task
            .query()
            .where('id',payload.id)
            .update(payload)

        response.send({
            status: 'success',
            data: payload
        })
    }

    //TODO decided, once billed, archive completed task, keep task for last 2 years
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
