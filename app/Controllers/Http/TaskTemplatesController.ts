import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import TaskTemplate from 'App/Models/TaskTemplate';

export default class TaskTemplatesController {
    public async index({response}: HttpContextContract){
        const data = await TaskTemplate
            .query()
            .preload('service',(query) => {
                query.select('name')
            });

        response.send({
            status: 'success',
            data: data
        });
    }

    public async get({request,response}: HttpContextContract){
        const payload = request.params()
        const data = await TaskTemplate
            .query()
            .where('id',payload.id)
            .first();

        if(data){
            response.send({
                status: 'success',
                data: data
            })
        }else{
            response.send({
                status: 'error',
                message: 'TaskTemplate not found'
            })
        }

    }

    public async options({response}: HttpContextContract){
        const data = await TaskTemplate.all()
        
        const serilizedData = data.map(e => e.serialize())

        serilizedData.map(e => {
            e.value = e.id;

            delete e.id;
        });

        response.send(serilizedData);
    }

    public async create({request,response}: HttpContextContract){
        const payload = request.all();

        //set "null" to null
        Object.keys(payload).forEach(e => {
            if(payload[e] == "null" || String(payload[e]) == ""){
                payload[e] = null;
            }
        });

        const data = await TaskTemplate.create(payload);

        response.send({
            status: 'success',
            data: data
        });
    }

    public async update({request,response}: HttpContextContract){
        const payload = request.all();

        //set "null" to null
        Object.keys(payload).forEach(e => {
            if(payload[e] == "null" || String(payload[e]) == ""){
                payload[e] = null;
            }
        });

        if(payload.id == 0){
            response.send({
                status: 'error',
                message: 'Cannot modify default template'
            });
            return
        }

        delete payload.client;
        delete payload.assigned_user;

        await TaskTemplate
            .query()
            .where('id',payload.id)
            .update(payload)

        response.send({
            status: 'success',
            data: payload
        })
    }

    public async destroy({request,response}: HttpContextContract){
        const payload = request.all();

        if(payload.id.includes(0)){
            response.send({
                status: 'error',
                message: 'Cannot modify default template'
            });
            return
        }

        await TaskTemplate
            .query()
            .whereIn('id',payload.id)
            .delete()

        response.send({
            status: 'success'
        })
    }
}
