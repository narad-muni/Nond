import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Lead from 'App/Models/Lead'

export default class LeadsController {
    public async index({response}: HttpContextContract){
        const data = await Lead
            .query()
            .preload('assigned_user',(query) => {
                query.select('username')
            })

        response.send({
            status: 'success',
            data: data
        })
    }

    public async get({request,response}: HttpContextContract){
        const payload = request.param('id');

        const data = await Lead
            .query()
            .where('id',payload)
            .first()

        if(data){
            response.send({
                status: 'success',
                data: data
            })
        }else{
            response.send({
                status: 'error',
                data: null,
                message: 'Lead not found'
            })
        }
    }

    public async create({request,response}: HttpContextContract){
        const payload = request.all();

        //set "null" to null
        Object.keys(payload).forEach(e => {
            if(payload[e] == "null" || String(payload[e]) == ""){
                payload[e] = null;
            }
        });

        const data = await Lead.create(payload);

        payload.id = data.id;

        response.send({
            status: 'success',
            data: payload
        })
    }

    public async update({request,response}: HttpContextContract){
        const payload = request.all();

        //set "null" to null
        Object.keys(payload).forEach(e => {
            if(payload[e] == "null" || String(payload[e]) == ""){
                payload[e] = null;
            }
        });

        await Lead
            .query()
            .where('id',payload.id)
            .update(payload)

        response.send({
            status: 'success',
            data: payload
        })
    }

    public async destroy({request,response}: HttpContextContract){
        const payload = Object.values(request.all())[0];

        await Lead
            .query()
            .whereIn('id',payload)
            .delete()

        response.send({
            status: 'success'
        })
    }
}
