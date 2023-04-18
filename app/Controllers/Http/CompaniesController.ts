import Application from '@ioc:Adonis/Core/Application'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Company from 'App/Models/Company';
import MasterTemplate from 'App/Models/MasterTemplate';
import fs from 'fs';

export default class CompaniesController {
    public async index({request, response}: HttpContextContract){
        try{
            const deleted = request.param('deleted',false);

            const headers = await MasterTemplate
                .query()
                .where('table_name','companies');

            headers.forEach(header => {
                Company.$addColumn(header.column_name,{});      
            });

            const data = await Company
                .query()
                .where('deleted',deleted)

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
            const deleted = request.param('deleted',false);

            const headers = await MasterTemplate
                .query()
                .where('table_name','companies')

            headers.forEach(header => {
                if(header.is_master){
                    Company.$addColumn(header.column_name,{});
                }            
            });

            const data = await Company
                .query()
                .where('deleted',deleted);

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
            const payload = request.params()

            const headers = await MasterTemplate
                .query()
                .where('table_name','companies')

            headers.forEach(header => {
                Company.$addColumn(header.column_name,{});
            });

            const data = await Company
                .query()
                .where('id',payload.id)
                .first()

            if(data){
                response.send({
                    status: 'success',
                    data: data
                });
            }else{
                response.send({
                    status: 'error',
                    message: 'No data found'
                })
            }
        }catch(e){
            console.log(e);

            response.send({
                status: "error",
                message: "some error occured"
            });
        }
    }

    public async options({response}: HttpContextContract) {
        try{
            const data = await Company
                .query()
                .select('id','name')
                .where('deleted',false)

            const serilizedData = data.map(e => e.serialize())

            serilizedData.map(e => {
                e.value = e.id;
                e.name = e.name;

                delete e.id;
            });

            response.send(serilizedData);

        }catch(e){
            console.log(e);

            response.send({
                status: "error",
                message: "some error occured"
            });
        }
    }

    public async restore({request,response}: HttpContextContract){
        try{
            const payload = request.all();

            await Company
                .query()
                .whereIn('id',payload.id)
                .update({deleted: false});

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

    public async create({request,response}: HttpContextContract){
        try{
            const payload = request.all();
            const files = request.allFiles();

            //set "null" to null
            Object.keys(payload).forEach(e => {
                if(payload[e] == "null" || String(payload[e]) == ""){
                    payload[e] = null;
                }
            });

            const exists = await Company
                .query()
                .where('name',payload.name)
                .first();

            if(exists){

                response.send({
                    status: 'error',
                    message: "Company with same name already exists"
                });

                return;
            }

            const headers = await MasterTemplate
                .query()
                .where('table_name','companies');

            headers.forEach(header => {
                Company.$addColumn(header.column_name,{});
            });

            const inserted = await Company.create(payload);

            payload.id = inserted.id;
            
            Object.values(files).forEach(file => {
                const path = `/file/company/${inserted.id}/`;
                const file_name = `${file.fieldName}.${file.extname}`
                file.move(Application.makePath(path),{name:file_name});
                payload[file.fieldName] = path+file_name;
            });

            Object.keys(payload).forEach(key => {
                if(payload[key] == 'null'){
                    payload[key] = null;
                }
            });

            await Company
                .query()
                .where('id',inserted.id)
                .update(payload);

            response.send({
                status: 'success',
                data: payload
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
            const payload = request.all();
            const files = request.allFiles();

            //set "null" to null
            Object.keys(payload).forEach(e => {
                if(payload[e] == "null" || String(payload[e]) == ""){
                    payload[e] = null;
                }
            });

            const exists = await Company
                .query()
                .where('name',payload.name)
                .first();

            if(exists && exists?.id != payload.id){

                response.send({
                    status: 'error',
                    message: "Company with same name already exists"
                });

                return;
            }

            const headers = await MasterTemplate
                .query()
                .where('table_name','companies');

            headers.forEach(header => {
                Company.$addColumn(header.column_name,{});
            });

            const old = await Company
                .query()
                .where('id',payload.id)
                .first()

            Object.values(files).forEach(file => {
                const path = `/file/company/${payload.id}/`;
                const file_name = `${file.fieldName}.${file.extname}`

                try{
                    fs.unlinkSync(Application.makePath(old?.[file.fieldName]));
                }catch(err){}

                file.move(Application.makePath(path),{name:file_name});
                payload[file.fieldName] = path+file_name;
            });

            Object.keys(payload).forEach(key => {
                if(payload[key] == 'null'){
                    payload[key] = null;
                }
            });

            headers.forEach(header=>{
                //Delete null files
                if(header.column_type == 'File'){
                    if(old?.[header.column_name]){
                        if(!payload[header.column_name]){
                            try{
                                fs.unlinkSync(Application.makePath(old[header.column_name]));
                            }catch(err){}
                        }
                    }
                }
            });

            await Company
                .query()
                .where('id',payload.id)
                .update(payload);

            response.send({
                status: 'success',
                data: payload
            });

        }catch(e){
            console.log(e);

            response.send({
                status: "error",
                message: "some error occured"
            });
        }
    }

    public async remove({request,response}: HttpContextContract){
        try{
            const payload = request.all();

            await Company
                .query()
                .whereIn('id',payload.id)
                .update({deleted: true});

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

    public async destroy({request,response}: HttpContextContract){
        try{
            const payload = request.all();

            //delete folders for above companies
            payload.id.forEach(id => {
                try{
                    fs.rmSync(Application.makePath(`/file/company/${id}`),{recursive: true, force: true});
                }catch{}
            });

            await Company
                .query()
                .whereIn('id',payload.id)
                .delete();
            
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
