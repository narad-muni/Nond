import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RegisterTemplate from 'App/Models/RegisterTemplate';
import { string } from '@ioc:Adonis/Core/Helpers'
import Database from '@ioc:Adonis/Lucid/Database';
import RegisterMaster from 'App/Models/RegisterMaster';
import MasterTemplate from 'App/Models/MasterTemplate';
import ArchivedRegisterTemplate from 'App/Models/ArchivedRegisterTemplate';

export default class RegisterTemplatesController {
    public async index({request,response}: HttpContextContract) {
        try{
            const payload = request.params();

            const data = await RegisterTemplate
                .query()
                .where('table_id',payload.table_id);

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

    public async get({request,response}: HttpContextContract) {
        try{
            const payload = request.params();

            const data = await RegisterTemplate
            .query()
            .where('id',payload.id)
            .first();

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

    public async options({request,response}: HttpContextContract){
        try{
            const payload = request.params();

            const data = await RegisterTemplate
                .query()
                .where('table_id',payload.table_id);

            if(data.length){
                response.send({
                    status: 'success',
                    data: data
                });
            }else{
                const data = await ArchivedRegisterTemplate
                    .query()
                    .where('table_id',payload.table_id)
                    .first();

                response.send({
                    status: 'success',
                    data: data
                });
            }

        }catch(e){
            console.log(e);

            response.send({
                status: "error",
                message: "some error occured"
            });
        }
    }

    public async create({request,response}: HttpContextContract) {
        try{
            const payload = request.all();
            if(payload.client_column_id != null){//client column
                
                payload.master = true;

                const exist = await RegisterTemplate
                    .query()
                    .where('client_column_id',payload.client_column_id)
                    .where('table_id',payload.table_id)
                    .first();

                if(exist){
                    response.send({
                        status: 'error',
                        message: 'column with same name already exixts'
                    });
                }else{
                    if(payload.client_column_id < 0){//default client columns
                        const column_name_arr = ["Name","Email","GST",""];

                        payload.display_name = column_name_arr[column_name_arr.length + parseInt(payload.client_column_id)];
                        payload.column_name = string.snakeCase(payload.display_name);
                        payload.column_type = "Text";
                    }else{//dynamic client columns
                        const client_column = await MasterTemplate
                            .query()
                            .where('id',payload.client_column_id)
                            .first();

                        payload.display_name = client_column?.display_name;
                        payload.column_name = client_column?.column_name;
                        payload.column_type = client_column?.column_type;
                    }

                    const resp = await RegisterTemplate.create(payload);

                    payload.id = resp.id;

                    response.send({
                        status: 'success',
                        data: payload
                    });
                }
            }else{//dynamic column
                payload.column_name = string.snakeCase(payload.display_name);

                const exist = await RegisterTemplate
                    .query()
                    .where('column_name',payload.column_name)
                    .where('table_id',payload.table_id)
                    .whereNull('client_column_id')
                    .first();

                if(exist){
                    response.send({
                        status: 'error',
                        message: 'column with same name already exixts'
                    });
                }else{
                    let c_type: string;
                    
                    const table = await RegisterMaster
                        .query()
                        .select('name','version')
                        .where('id',payload.table_id)
                        .first();

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
                                string.escapeHTML("register__"+table?.name+table?.version),
                                payload.column_name
                            ]
                        );

                    const data = await RegisterTemplate.create(payload);

                    payload.id = data.id;

                    response.send({
                        status: 'success',
                        data: payload
                    });
                }
            }
        }catch(e){
            console.log(e);

            response.send({
                status: "error",
                message: "some error occured"
            });
        }
    }

    public async update({request,response}: HttpContextContract) {
        try{
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
                let c_type: string;

                const old = await RegisterTemplate
                    .query()
                    .where('id',payload.id)
                    .first();

                const table = await RegisterMaster
                    .query()
                    .select('name','version')
                    .where('id',payload.table_id)
                    .first();


                //dissallow certain actions on file columns, causes bugs
                //eg
                //create column file_name
                //add file
                //rename column to file_abc
                //create new column file_name
                //new column has old data
                //updating old column deletes new data
                if(old?.column_type == 'File'){
                    if(payload.column_type != 'File'){

                        response.send({
                            status: "error",
                            message: "Cannot change column of type File to "+payload.column_type
                        });

                        return;
                    }else if(old.column_name != payload.column_name){
                        
                        response.send({
                            status: "error",
                            message: "Cannot rename column of type File"
                        });

                        return;
                    }
                }

                if(payload.column_type == 'File' || payload.column_type == 'Text'){
                    c_type = 'varchar(255)'
                }else if(payload.column_type == 'Checkbox'){
                    c_type = 'boolean'
                }else{
                    c_type = 'date'
                }

                if(old?.column_name !== payload.column_name){
                    await Database
                        .rawQuery('alter table ?? rename column ?? to ??', [string.escapeHTML("register__"+table?.name+table?.version), old?.column_name, payload.column_name]);
                }

                if(old?.column_type !== payload.column_type){
                    await Database
                        .rawQuery('alter table ?? alter column ?? type ' + string.escapeHTML(c_type) + ' using null', [string.escapeHTML("register__"+table?.name+table?.version), payload.column_name]);
                }

                await RegisterTemplate
                    .query()
                    .where('id',payload.id)
                    .update(payload)

                response.send({
                    status: 'success',
                    data: payload
                });
            }
        }catch(e){
            console.log(e);

            response.send({
                status: "error",
                message: "some error occured"
            });
        }
    }

    public async destroy({request,response}: HttpContextContract) {
        try{
            const payload = request.all();
            
            const columns = await RegisterTemplate
                .query()
                .whereIn('id',payload.id);

            const table = await RegisterMaster
                .query()
                .select('name','version')
                .where('id',columns[0].table_id)
                .first();

            await RegisterTemplate
                .query()
                .whereIn('id',payload.id)
                .delete();


            for await (const column of columns) {
                if(column.client_column_id == null){
                    await Database
                        .rawQuery('alter table ?? drop column ??',[string.escapeHTML("register__"+table?.name+table?.version), column.column_name]);
                }
            };

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
