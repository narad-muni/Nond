import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RegisterMaster from 'App/Models/RegisterMaster'
import Scheduler from 'App/Models/Scheduler'

export default class RegistersController {
    public async index({response}: HttpContextContract) {
        const data = await RegisterMaster
            .query()
            .preload('service',(query) => {
                query
                    .select('id','name')
            })

        response.send({
            status: 'success',
            data: data
        })
    }

    public async get({request,response}: HttpContextContract) {
        const id = request.param('id')
        const data = await RegisterMaster
            .query()
            .preload('scheduler',(query) => {
                query.select('id','next','frequency','data')
            })
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

    public async options({request,response}: HttpContextContract) {
        const payload = request.param('filter','active');

        let data: any = RegisterMaster
            .query()

        if(payload == 'archived'){
            data = data.where('active',false);
        }else if(payload == 'active'){
            data = data.where('active',true);
        }

        data = await data;

        const serilizedData = data.map(e => e.serialize())

        serilizedData.map(e => {
            e.value = e.id;

            delete e.id;
        });

        response.send(serilizedData);

    }

    public async create({request,response}: HttpContextContract) {
        const payload = request.all();

        const scheduler = {
            frequency: payload.frequency,
            next: payload.next,
            data: {rotation_strategy: payload.rotation_strategy},
            register_id: 0,
            type: 1
        }

        const exist = await RegisterMaster
            .query()
            .where('name',payload.name)
            .first()

        if(exist){
            response.send({
                status: 'error',
                message: 'register already exists, rotate existsing.'
            });
        }else{
            delete payload.frequency;
            delete payload.next;
            delete payload.rotation_strategy;

            payload.active = true;

            const data = await RegisterMaster
                .create(payload)

            payload.id = data.id;

            scheduler.register_id = data.id;

            await Scheduler.create(scheduler);
            
            response.send({
                status: 'success',
                data: payload
            });
        }
        
    }

    public async archive({request,response}: HttpContextContract){
        const id = request.input('id');

        await Scheduler
            .query()
            .whereIn('register_id',id)
            .delete();

        await RegisterMaster
            .query()
            .whereIn('id',id)
            .update({active: false}); 

        response.send({
            status: 'success'
        })
    }

    public async update({request,response}: HttpContextContract) {
        const data = request.all();

        const scheduler = data.scheduler;

        delete data.scheduler;

        await Scheduler
            .query()
            .where('id',scheduler.id)
            .update(scheduler);

        await RegisterMaster
            .query()
            .where('id',data.id)
            .update(data);

        response.send({
            status: 'success',
            message: null,
            data: data
        });
    }
    
    public async destroy({request,response}: HttpContextContract) {
        const id = request.input('id');
        
        await RegisterMaster
            .query()
            .whereIn('id',id)
            .delete();

        await Scheduler
            .query()
            .whereIn('register_id',id)
            .delete()
        
        response.send({
            status: 'success'
        })
    }
}
