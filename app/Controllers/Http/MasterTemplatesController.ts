import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import MasterTemplate from 'App/Models/MasterTemplate'
import { string } from '@ioc:Adonis/Core/Helpers'
import RegisterTemplate from 'App/Models/RegisterTemplate'

export default class MasterTemplatesController {
    public async index({response}: HttpContextContract){
        const data = await MasterTemplate
            .all()

        response.send({
            status: 'success',
            data: data
        })
    }

    public async client_options({response}: HttpContextContract){
        const data = await MasterTemplate
            .query()
            .select('id','display_name')
            .where('table_name','clients');

        const serilizedData = data.map(e => e.serialize())

        serilizedData.map(e => {
            e.value = e.id;
            e.name = e.display_name;

            delete e.id;
            delete e.display_name;
        });

        response.send({
            status: 'success',
            data: serilizedData
        })
    }

    public async index_options({request,response}: HttpContextContract){
        const payload = request.params()
        const data = await MasterTemplate
            .query()
            .where('table_name',payload.table_name)

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
        try{
            const payload = request.all()
            payload.column_name = string.snakeCase(payload.display_name);

            if(payload.column_name == 'services' || payload.column_name == '_services'){
                response.send({
                    status: 'error',
                    message: `${payload.column_name} is reserved column, please use another name`
                });
                return;
            }

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
                let c_type: string;

                if(payload.column_type == 'File' || payload.column_type == 'Text'){
                    c_type = 'varchar(255)'
                }else if(payload.column_type == 'Checkbox'){
                    c_type = 'boolean'
                }else{
                    c_type = 'date'
                }

                await Database
                    .rawQuery(
                        'alter table ?? add column ?? '+string.escapeHTML(c_type),
                        [
                            payload.table_name,
                            payload.column_name
                        ]
                    );

                const data = await MasterTemplate
                    .create(payload)

                payload.id = data.id;

                response.send({
                    status: 'success',
                    data: payload
                })
            }
        }catch{
            response.send({
                status: 'error',
                message: 'Only Valid characters are accepted'
            })
        }
    }

    public async update({request,response}: HttpContextContract){
        try{
            const payload = request.all();
            payload.column_name = string.snakeCase(payload.display_name);

            if(payload.column_name == 'services' || payload.column_name == '_services'){
                response.send({
                    status: 'error',
                    message: `${payload.column_name} is reserved column, please use another name`
                });
                return;
            }

            const duplicate = await MasterTemplate
                .query()
                .where('column_name', payload.display_name)
                .where('table_name', payload.table_name)
                .first()

            if(duplicate?.id !== payload.id && duplicate){
                response.send({
                    status: 'error',
                    message: 'cannot have duplicate columns for single table'
                })
            }else{

                let c_type: string;

                if(payload.column_type == 'File' || payload.column_type == 'Text'){
                    c_type = 'varchar(255)'
                }else if(payload.column_type == 'Checkbox'){
                    c_type = 'boolean'
                }else{
                    c_type = 'date'
                }

                const old = await MasterTemplate
                    .query()
                    .where('id', payload.id)
                    .first()

                if(old?.column_name !== payload.column_name){
                    await Database
                        .rawQuery('alter table ?? rename column ?? to ??', [payload.table_name, old?.column_name, payload.column_name]);
                }

                if(old?.column_type !== payload.column_type){
                    await Database
                        .rawQuery('alter table ?? alter column ?? type ' + string.escapeHTML(c_type) + ' using null', [payload.table_name, payload.column_name]);
                }

                await MasterTemplate
                    .query()
                    .where('id', payload.id)
                    .update(payload)

                await RegisterTemplate
                    .query()
                    .where('client_column_id',payload.id)
                    .update({
                        column_name: payload.column_name,
                        display_name: payload.display_name,
                        column_type: payload.column_type
                    });

                response.send({
                    status: 'success',
                    data: payload
                })
            }
        }catch{
            response.send({
                status: 'error',
                message: 'Only Valid characters are accepted'
            })
        }
    }
    
    public async destroy({request,response}: HttpContextContract){
        const payload = request.all()

        const columns = await MasterTemplate
            .query()
            .whereIn('id',payload.id)

        columns.forEach(async (column) => {
            await Database
                .rawQuery('alter table ?? drop column ??',[column.table_name, column.column_name]);
        });

        await MasterTemplate
            .query()
            .whereIn('id',payload.id)
            .delete()

        await RegisterTemplate
            .query()
            .whereIn('client_column_id',payload.id)
            .delete()

        response.send({
            status: 'success'
        });
            
    }
}
