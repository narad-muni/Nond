import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import DynamicRegister from 'App/Models/DynamicRegister';
import RegisterMaster from 'App/Models/RegisterMaster';
import RegisterTemplate from 'App/Models/RegisterTemplate';
import { string } from '@ioc:Adonis/Core/Helpers';
import { DateTime } from 'luxon';
import Application from '@ioc:Adonis/Core/Application';
import fs from 'fs';
import { MultipartFileContract } from '@ioc:Adonis/Core/BodyParser';
import Client from 'App/Models/Client';

export default class RegistersController {

    public static dateOptions = {
        serialize: (value) => {
            if(value){
                return DateTime.fromJSDate(value).toLocaleString(DateTime.DATE_MED);
            }else{
                return value
            }
        }
    }

    public async index({request,response}: HttpContextContract){
        try{
            const payload = request.params();
            const client_columns: any[] = [];

            //setup dynamic register
            const register = await RegisterMaster
                .query()
                .where('id',payload.table_id)
                .where('active', true)
                .first();

            if(!register){

                response.send({
                    status:"error",
                    message: "Register Not found"
                });

                return;
            }

            const headers = await RegisterTemplate
                .query()
                .where('table_id',payload.table_id);

            //add relation
            DynamicRegister.$addRelation(
                '__client',
                'belongsTo',
                () => Client,
                {
                    'foreignKey': 'client_id'
                }
            );

            headers.forEach(header => {
                if(header.client_column_id == null){
                    if(header.column_type == 'Date'){
                        DynamicRegister.$addColumn(header.column_name,RegistersController.dateOptions);
                    }else{
                        DynamicRegister.$addColumn(header.column_name,{});
                    }
                }else{
                    client_columns.push(header.column_name);
                }
            });

            DynamicRegister.table = string.escapeHTML("register__" + register?.name + register?.version);
            //setup complete

            //add linked columns
            const data = await DynamicRegister
                .query()
                .preload('__client', (query) => {
                    query.select(...client_columns)
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

    public async indexMaster({request,response}: HttpContextContract){
        try{
            const payload = request.params();
            const client_columns: any[] = [];

            //setup dynamic register
            const register = await RegisterMaster
                .query()
                .where('id',payload.table_id)
                .where('active', true)
                .first();

            if(!register){

                response.send({
                    status:"error",
                    message: "Register Not found"
                });

                return;
            }

            const headers = await RegisterTemplate
                .query()
                .where('table_id',payload.table_id)
                .where('master',true);

            //add relation
            DynamicRegister.$addRelation(
                '__client',
                'belongsTo',
                () => Client,
                {
                    'foreignKey': 'client_id'
                }
            );

            headers.forEach(header => {
                if(header.client_column_id == null){
                    if(header.column_type == 'Date'){
                        DynamicRegister.$addColumn(header.column_name,RegistersController.dateOptions);
                    }else{
                        DynamicRegister.$addColumn(header.column_name,{});
                    }
                }else{
                    client_columns.push(header.column_name);
                }
            });

            DynamicRegister.table = string.escapeHTML("register__" + register?.name + register?.version);
            //setup complete

            //add linked columns
            const data = await DynamicRegister
                .query()
                .preload('__client', (query) => {
                    query.select(...client_columns)
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
                if(header.client_column_id == null){
                    if(header.column_type == 'Date'){
                        DynamicRegister.$addColumn(header.column_name,RegistersController.dateOptions);
                    }else{
                        DynamicRegister.$addColumn(header.column_name,{});
                    }
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
            const payload = request.params();
            const data = request.all();
            const files = request.allFiles() as any as MultipartFileContract[];
            const client_columns: any[] = [];

            //setup dynamic register
            const register = await RegisterMaster
                .query()
                .where('id',payload.table_id)
                .first();

            const headers = await RegisterTemplate
                .query()
                .where('table_id',payload.table_id);

            headers.forEach(header => {
                if(header.client_column_id == null){
                    if(header.column_type == 'Date'){
                        DynamicRegister.$addColumn(header.column_name,RegistersController.dateOptions);
                    }else{
                        DynamicRegister.$addColumn(header.column_name,{});
                    }
                }else{
                    client_columns.push(header.column_name);
                }
            });

            DynamicRegister.table = string.escapeHTML("register__" + register?.name + register?.version);
            //setup complete

            //set "null" to null
            Object.keys(data).forEach(e => {
                if(data[e] == "null" || String(data[e]) == ""){
                    data[e] = null;
                }
            });

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

            data.__client = await Client
                .query()
                .select(...client_columns)
                .where('id',data.client_id)
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

    public async update({request,response}: HttpContextContract){
        try{
            const payload = request.params();
            const data = request.all();
            const files = request.allFiles() as any as MultipartFileContract[];
            const client_columns: any[] = [];

            //setup dynamic register
            const register = await RegisterMaster
                .query()
                .where('id',payload.table_id)
                .first();

            const headers = await RegisterTemplate
                .query()
                .where('table_id',payload.table_id);

            headers.forEach(header => {
                if(header.client_column_id == null){
                    if(header.column_type == 'Date'){
                        DynamicRegister.$addColumn(header.column_name,RegistersController.dateOptions);
                    }else{
                        DynamicRegister.$addColumn(header.column_name,{});
                    }
                }else{
                    client_columns.push(header.column_name);
                }
            });

            DynamicRegister.table = string.escapeHTML("register__" + register?.name + register?.version);
            //setup complete

            //set "null" to null
            Object.keys(data).forEach(e => {
                if(data[e] == "null" || String(data[e]) == ""){
                    data[e] = null;
                }
            });

            //old entry
            const old = await DynamicRegister
                .query()
                .where('id',data.id)
                .first();

            //replace existing files or create new
            Object.values(files).forEach(file => {
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

            data.__client = await Client
                .query()
                .select(...client_columns)
                .where('id',data.client_id)
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

    public async destroy({request,response}: HttpContextContract){
        try{
            const payload = request.params();
            const data = request.all();

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
        }catch(e){
            console.log(e);

            response.send({
                status: "error",
                message: "some error occured"
            });
        }
    }
}
