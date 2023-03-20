import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RegisterTemplate from 'App/Models/RegisterTemplate';
import { string } from '@ioc:Adonis/Core/Helpers'

export default class RegisterTemplatesController {
    public async index({request,response}: HttpContextContract) {
        const payload = request.params();

        const data = await RegisterTemplate
            .query()
            .where('table_id',payload.table_id);

        response.send({
            status: 'success',
            data: data
        });
    }

    public async get({request,response}: HttpContextContract) {
        const payload = request.params();

        const data = await RegisterTemplate
            .query()
            .where('id',payload.id)
            .first();

        response.send({
            status: 'success',
            data: data
        })
    }

    public async create({request,response}: HttpContextContract) {
        
    }

    public async update({request,response}: HttpContextContract) {
        const payload = request.all();
        payload.column_name = string.snakeCase(payload.display_name);

        const exist = await RegisterTemplate
            .query()
            .whereNot('id',payload.id)
            .where('column_name',payload.column_name)
            .where('table_id',payload.table_id)
            .first();

        if(exist){
            response.send({
                status: 'error',
                message: 'column with same name already exixts'
            });
        }else{
            await RegisterTemplate
                .query()
                .where('id',payload.id)
                .update(payload)

            response.send({
                status: 'success',
                data: payload
            });
        }
    }

    public async delete({request,response}: HttpContextContract) {
        
    }
}
