import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import MasterTemplate from 'App/Models/MasterTemplate'

export default class MasterTemplatesController {
    public async index({response}: HttpContextContract){
        const data = await MasterTemplate
            .all()

        response.send({
            status: 'success',
            data: data
        })
    }

    public async get({request,response}: HttpContextContract){
        const payload = request.params()
        const data = await MasterTemplate
            .query()
            .where('id',payload.id)
            .first()

        if(data){
            response.send({
                status: 'success',
                data: data
            })
        }else{
            response.send({
                status: 'error',
                message: 'no data found'
            })
        }
    }

    public async create({request,response}: HttpContextContract){
        const payload = request.all()

        const duplicate = await MasterTemplate
            .query()
            .where('column_name', payload.column_name)
            .where('table_name', payload.table_name)
            .first()

        if(duplicate){
            response.send({
                status: 'error',
                message: 'cannot have duplicate columns for single table'
            })
        }else{
            const data = await MasterTemplate
                .create(payload)

            payload.id = data.id;

            response.send({
                status: 'success',
                data: payload
            })
        }
    }

    public async update({request,response}: HttpContextContract){
        const payload = request.all();

        delete payload.table_name;

        const duplicate = await MasterTemplate
            .query()
            .where('column_name', payload.column_name)
            .where('table_name', payload.table_name)
            .first()

        if(duplicate){
            response.send({
                status: 'error',
                message: 'cannot have duplicate columns for single table'
            })
        }else{

            await MasterTemplate
                .query()
                .where('id', payload.id)
                .update(payload)

            response.send({
                status: 'success',
                data: payload
            })
        }
    }
    
    public async destroy({request,response}: HttpContextContract){
        const payload = request.all()

        await MasterTemplate
            .query()
            .whereIn('id',payload.id)
            .delete()

        response.send({
            status: 'success'
        })
            
    }
}
