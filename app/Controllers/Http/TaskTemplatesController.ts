import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import TaskTemplate from 'App/Models/TaskTemplate';

export default class TaskTemplatesController {
    public async index({response}: HttpContextContract){
        try{
            const data = await TaskTemplate
                .query()
                .preload('service',(query) => {
                    query.select('name')
                });

            response.send({
                status: 'success',
                data: data
            });
        }catch(e){
            console.log(e);

            response.send({
                status: "error",
                message: "some error occured"
            });
        }
    }

    public async get({request,response}: HttpContextContract){
        try{
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

        }catch(e){
            console.log(e);

            response.send({
                status: "error",
                message: "some error occured"
            });
        }
    }

    public async options({response}: HttpContextContract){
        try{
            const data = await TaskTemplate.all()

            const serilizedData = data.map(e => e.serialize())

            serilizedData.map(e => {
                e.value = e.id;

                delete e.id;
            });

            response.send(serilizedData);
        }catch(e){
            console.log(e);

            response.send({
                status: "error",
                message: "some error occured"
            });
        }
    }

    public async create({request,response}: HttpContextContract){
        try{
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
        }catch(e){
            console.log(e);

            response.send({
                status: "error",
                message: "some error occured"
            });
        }
    }

    public async update({request,response}: HttpContextContract){
        try{
            const payload = request.all();

            //set "null" to null
            Object.keys(payload).forEach(e => {
                if(payload[e] == "null" || String(payload[e]) == ""){
                    payload[e] = null;
                }
            });

            if(payload.id <= 0){
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
                .update(payload);

            response.send({
                status: 'success',
                data: payload
            });
        }catch(e){
            console.log(e);

            response.send({
                status: "error",
                message: "some error occured"
            });
        }
    }

    public async destroy({request,response}: HttpContextContract){
        try{
            const payload = request.all();

            if(payload.id.filter(e => e <= 0).length){
                response.send({
                    status: 'error',
                    message: 'Cannot remove default services'
                });

                return;
            }

            await TaskTemplate
                .query()
                .whereIn('id',payload.id)
                .delete();

            response.send({
                status: 'success'
            });
        }catch(e){
            console.log(e);

            response.send({
                status: "error",
                message: "some error occured"
            });
        }
    }
}
