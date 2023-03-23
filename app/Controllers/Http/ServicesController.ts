import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Service from 'App/Models/Service'

export default class RolesController {

    public async index({response}: HttpContextContract) {
        const data = await Service
            .query()
            .preload('template', (query) => {
                query.select('name')
            })

        response.send({
            status: 'success',
            data: data,
            message: null
        })
    }

    public async get({request,response}: HttpContextContract) {
        const id = request.param('id')
        const data = await Service
            .query()
            .where('id',id)
            .first()

        if(data){
            response.send({
                status: 'success',
                data: data,
                message: null
            })
        }else{
            response.send({
                status: 'error',
                data:null,
                message: 'Role not found'
            })
        }
    }

    public async options({response}: HttpContextContract) {
        const data = await Service
            .query()
            .select('name','id')
            .where('id','>=',0);

        const serilizedData = data.map(e => e.serialize())

        serilizedData.map(e => {
            e.value = e.id;

            delete e.id;
        });

        response.send(serilizedData);

    }

    public async options_gst({request,response}: HttpContextContract) {
        const data = await Service
            .query()
            .select('gst')
            .where('hsn',request.param('hsn',null))
            .first();

        response.send(data?.gst || "");

    }

    public async options_all({response}: HttpContextContract) {
        const data = await Service
            .query()

        const serilizedData = data.map(e => e.serialize())

        serilizedData.map(e => {
            e.value = e.id;

            delete e.id;
        });

        response.send(serilizedData);

    }

    public async create({request,response}: HttpContextContract) {
        const payload = request.all();

        const data = await Service
            .create(payload)

        payload.id = data.id;
        
        response.send({
            status: 'success',
            data: payload
        })
        
    }

    public async update({request,response}: HttpContextContract) {
        const data = request.all();
        
        await Service
            .query()
            .where('hsn',data.hsn)
            .update({'gst':data.gst});

        await Service
            .query()
            .where('id',data.id)
            .update(data)

        response.send({
            status: 'success',
            message: null,
            data: data
        })
    }

    public async destroy({request,response}: HttpContextContract) {
        const id = request.input('id')
        
        //TODO : update client services json, delete tasks and schedulers

        await Service
            .query()
            .whereIn('id',id)
            .delete()
            
            response.send({
                status: 'success'
            })
    }
}
