import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RegisterMaster from 'App/Models/RegisterMaster'

export default class RegistersController {
    public async index({response}: HttpContextContract) {
        const data = await RegisterMaster
            .query()
            .preload('service',(query) => {
                query.select('id','name')
            })
            .where('deleted',false);

        response.send({
            status: 'success',
            data: data,
            message: null
        })
    }

    public async get({request,response}: HttpContextContract) {
        const id = request.param('id')
        const data = await RegisterMaster
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
                message: 'RegisterMaster not found'
            })
        }
    }

    public async options({response}: HttpContextContract) {
        const data = await RegisterMaster
            .all()

        const serilizedData = data.map(e => e.serialize())

        serilizedData.map(e => {
            e.value = e.id;

            delete e.id;
        });

        response.send(serilizedData);

    }

    public async create({request,response}: HttpContextContract) {
        const payload = request.all();

        const data = await RegisterMaster
            .create(payload)

        payload.id = data.id;
        
        response.send({
            status: 'success',
            data: payload
        })
        
    }

    public async update({request,response}: HttpContextContract) {
        const data = request.all();
        await RegisterMaster
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
        const id = request.input('id');
        
        await RegisterMaster
            .query()
            .whereIn('id',id)
            .delete();
        
        response.send({
            status: 'success'
        })
    }
}
