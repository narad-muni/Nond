import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import DynamicRegister from 'App/Models/DynamicRegister';
import RegisterMaster from 'App/Models/RegisterMaster';
import RegisterTemplate from 'App/Models/RegisterTemplate';
import { string } from '@ioc:Adonis/Core/Helpers';
import { DateTime } from 'luxon';
import Application from '@ioc:Adonis/Core/Application';
import fs from 'fs';

export default class RegistersController {

    public static dateOptions = {
        serialize: (value) => {
            if(value){
                return DateTime.fromObject(value).toISODate()
            }else{
                return value
            }
        }
    }

    public async index({request,response}: HttpContextContract){
        const payload = request.params();

        //setup dynamic register
        const register = await RegisterMaster
            .query()
            .where('id',payload.table_id)
            .first();

        const headers = await RegisterTemplate
            .query()
            .where('table_id',payload.table_id);

        headers.forEach(header => {
            if(header.column_type == 'Date'){
                DynamicRegister.$addColumn(header.column_name,RegistersController.dateOptions);
            }else{
                DynamicRegister.$addColumn(header.column_name,{});
            }
        });

        DynamicRegister.table = string.escapeHTML("register__" + register?.name + register?.version);
        //setup complete

        const data = await DynamicRegister.all();

        response.send({
            status: 'success',
            data: data
        });
    }

    public async get({request,response}: HttpContextContract){
        const payload = request.params();

        //setup dynamic register
        const register = await RegisterMaster
            .query()
            .where('id',payload.table_id)
            .first();

        const headers = await RegisterTemplate
            .query()
            .where('table_id',payload.table_id);

        headers.forEach(header => {
            if(header.column_type == 'Date'){
                DynamicRegister.$addColumn(header.column_name,RegistersController.dateOptions);
            }else{
                DynamicRegister.$addColumn(header.column_name,{});
            }
        });

        DynamicRegister.table = string.escapeHTML("register__" + register?.name + register?.version);
        //setup complete

        const data = await DynamicRegister
            .query()
            .where('id',payload.id)
            .first();

        response.send({
           status: 'success',
           data: data 
        });
    }

    public async create({request,response}: HttpContextContract){
        const payload = request.params();
        const data = request.all();
        const files = request.allFiles();

        //setup dynamic register
        const register = await RegisterMaster
            .query()
            .where('id',payload.table_id)
            .first();

        const headers = await RegisterTemplate
            .query()
            .where('table_id',payload.table_id);

        headers.forEach(header => {
            if(header.column_type == 'Date'){
                DynamicRegister.$addColumn(header.column_name,RegistersController.dateOptions);
            }else{
                DynamicRegister.$addColumn(header.column_name,{});
            }
        });

        DynamicRegister.table = string.escapeHTML("register__" + register?.name + register?.version);
        //setup complete

        const resp = await DynamicRegister
            .create(data);

        //save files
        Object.values(files).forEach(file => {
            const path = `/file/register/${payload.table_id}/${resp.id}/`;
            const file_name = `${file.fieldName}.${file.extname}`
            file.move(Application.makePath(path),{name:file_name});
            data[file.fieldName] = path+file_name;
        });

        data.id = resp.id;

        await DynamicRegister
            .query()
            .where('id',data.id)
            .update(data);

        response.send({
            status: 'success',
            data: data
        });
    }

    public async update({request,response}: HttpContextContract){
        const payload = request.params();
        const data = request.all();
        const files = request.allFiles();

        //setup dynamic register
        const register = await RegisterMaster
            .query()
            .where('id',payload.table_id)
            .first();

        const headers = await RegisterTemplate
            .query()
            .where('table_id',payload.table_id);

        headers.forEach(header => {
            if(header.column_type == 'Date'){
                DynamicRegister.$addColumn(header.column_name,RegistersController.dateOptions);
            }else{
                DynamicRegister.$addColumn(header.column_name,{});
            }
        });

        DynamicRegister.table = string.escapeHTML("register__" + register?.name + register?.version);
        //setup complete

        //null data
        Object.keys(data).forEach(k => {
            if(data[k] == "null"){
                data[k] = null;
            }
        });

        //old entry
        const old = await DynamicRegister
            .query()
            .where('id',data.id)
            .first();

        //replace existing files or create new
        Object.values(files).forEach(async file => {
            const path = `/file/register/${payload.table_id}/${data.id}/`;
            const file_name = `${file.fieldName}.${file.extname}`

            try{
                fs.unlinkSync(Application.makePath(old?.[file.fieldName]));
            }catch(err){}

            file.move(Application.makePath(path),{name:file_name});
            data[file.fieldName] = path+file_name;
        });

        //delete nulled files
        headers.forEach(header=>{
            //Delete null files
            if(header.column_type == 'File'){
                if(old?.[header.column_name]){
                    if(!data[header.column_name]){
                        try{
                            fs.unlinkSync(Application.makePath(old[header.column_name]));
                        }catch(err){}
                    }
                }
            }
        });

        await DynamicRegister
            .query()
            .where('id',data.id)
            .update(data);

        response.send({
            status: 'success',
            data: data
        });
        
    }

    public async destroy({request,response}: HttpContextContract){
        const payload = request.params();
        const data = request.all();

        //TODO Remove files

        //setup dynamic register
        const register = await RegisterMaster
            .query()
            .where('id',payload.table_id)
            .first();

        DynamicRegister.table = string.escapeHTML("register__" + register?.name + register?.version);
        //setup complete

        //delete files
        data.id.forEach(id => {
            try{
                fs.rmSync(Application.makePath(`/file/register/${payload.table_id}/${id}`),{recursive: true, force: true});
            }catch{}
        });

        await DynamicRegister
            .query()
            .whereIn('id',data.id)
            .delete()

        response.send({
            status: 'success'
        });
    }
}
