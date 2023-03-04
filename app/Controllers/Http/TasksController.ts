import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Task from 'App/Models/Task'

export default class TasksController {
    public async index({response}: HttpContextContract){
        const data = await Task
            .query()
            .preload('service', (query) => {
                query.select('name')
            })
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

    public async indexCompleted({response}: HttpContextContract){
        const data = await Task
            .query()
            .preload('client', (query) => {
                query.select('name')
            })
            .preload('service', (query) => {
                query.select('name')
            })
            .preload('assigned_user', (query) => {
                query.select('username')
            })
            .where('status',4);

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

        if(payload.started == ""){
            payload.started = null;
        }

        if(payload.ended == ""){
            payload.ended = null;
        }

        const data = await Task.create(payload);

        response.send({
            status: 'success',
            data: data
        });
    }

    public async update({request,response}: HttpContextContract){
        const payload = request.all();

        const old = await Task
            .query()
            .where('id',payload.id)
            .first();

        if(old?.status != payload.status){
            if(payload.status == 1 && old?.status == 0){
                payload.started = new Date().toJSON().slice(0, 10);
            }else if(payload.status == 4){
                payload.ended = new Date().toJSON().slice(0, 10);
            }
        }

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
