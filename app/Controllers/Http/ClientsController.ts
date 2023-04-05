import Application from '@ioc:Adonis/Core/Application'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Client from 'App/Models/Client';
import MasterTemplate from 'App/Models/MasterTemplate';
import Scheduler from 'App/Models/Scheduler';
import fs from 'fs';
import { DateTime } from 'luxon';

export default class ClientsController {

    public static dateOptions = {
        serialize: (value) => {
            if(value){
                return DateTime.fromObject(value).toLocaleString(DateTime.DATE_MED);
            }else{
                return value
            }
        }
    }

    public async index({request,response}: HttpContextContract){
        const deleted = request.param('deleted');
        const headers = await MasterTemplate
            .query()
            .where('table_name','clients')

        headers.forEach(header => {
            if(header.column_type == 'Date'){
                Client.$addColumn(header.column_name,ClientsController.dateOptions);
            }else{
                Client.$addColumn(header.column_name,{});
            }
        });

        const data = await Client
            .query()
            .preload('group', (query) => {
                query.select('id','name')
            })
            .where('deleted',deleted)

        response.send({
            status: 'success',
            data: data
        });
    }

    public async indexMaster({request,response}: HttpContextContract){
        const deleted = request.param('deleted');
        const headers = await MasterTemplate
            .query()
            .where('table_name','clients');

        headers.forEach(header => {
            if(header.is_master){
                if(header.column_type == 'Date'){
                    Client.$addColumn(header.column_name,ClientsController.dateOptions);
                }else{
                    Client.$addColumn(header.column_name,{});
                }
            }            
        });

        const data = await Client
            .query()
            .preload('group', (query) => {
                query.select('id','name')
            })
            .where('deleted',deleted)

        response.send({
            status: 'success',
            data: data
        });
    }

    public async get({request,response}: HttpContextContract){
        const payload = request.params()

        const headers = await MasterTemplate
            .query()
            .where('table_name','clients');

        headers.forEach(header => {
            if(header.column_type == 'Date'){
                Client.$addColumn(header.column_name,ClientsController.dateOptions);
            }else{
                Client.$addColumn(header.column_name,{});
            }
        });

        const data = await Client
            .query()
            .preload('group', (query) => {
                query.select('id','name')
            })
            .preload('subsidiary', (query) => {
                query.select('id','name')
            })
            .preload('services', (query) => {
                query.select('id','next','frequency','service_id','client_id')
            })
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
    }

    public async options({response}: HttpContextContract) {
        const data = await Client
            .query()
            .select('id','name')

        const serilizedData = data.map(e => e.serialize())

        serilizedData.map(e => {
            e.value = e.id;

            delete e.id;
        });

        response.send(serilizedData);

    }
    
    public async create({request,response}: HttpContextContract){
        const payload = request.all();
        const files = request.allFiles();
        const newSchedulersList = [];

        payload.services = JSON.parse(payload._services);

        if(payload.group_id == "Self"){
            payload.group_id = null;
        }

        //create new scheduler objects
        Object.keys(payload.services).forEach(service_id => {
            payload.services[service_id].type = 5;

            if(payload.services[service_id].client_id == null && payload.services[service_id].subscribed){
                delete payload.services[service_id].subscribed;
                
                //push in array
                newSchedulersList.push(payload.services[service_id]);
            }
        });

        const headers = await MasterTemplate
            .query()
            .where('table_name','clients')

        headers.forEach(header => {
            if(header.column_type == 'Date'){
                Client.$addColumn(header.column_name,ClientsController.dateOptions);
            }else{
                Client.$addColumn(header.column_name,{});
            }
        });

        delete payload.services;
        delete payload._services;

        const inserted = await Client.create(payload);

        payload.id = inserted.id;
        payload.group_id = payload.group_id || payload.id;
        

        //set scheduler client id after inserting
        newSchedulersList.forEach(e => {
            e.client_id = inserted.id;
        });

        await Scheduler.createMany(newSchedulersList);
        
        Object.values(files).forEach(file => {
            const path = `/file/client/${inserted.id}/`;
            const file_name = `${file.fieldName}.${file.extname}`
            file.move(Application.makePath(path),{name:file_name});
            payload[file.fieldName] = path+file_name;
        });

        Object.keys(payload).forEach(key => {
            if(payload[key] == 'null'){
                payload[key] = null;
            }
        });

        await Client
            .query()
            .where('id',inserted.id)
            .update(payload)

        response.send({
            status: 'success',
            data: payload
        })
    }

    public async update({request,response}: HttpContextContract){
        const payload = request.all();
        const files = request.allFiles();
        const deletedSchedulerIds = [];
        const newSchedulersList = [];
        const updateSchedulersList = [];

        payload.services = JSON.parse(payload._services);

        //delete unchecked
        Object.keys(payload.services).forEach(service_id => {
            if(payload.services[service_id].id != null && !payload.services[service_id].subscribed){
                deletedSchedulerIds.push(payload.services[service_id].id);
            }
        });

        await Scheduler
            .query()
            .whereIn('id',deletedSchedulerIds)
            .delete()
        

        //create new objects
        Object.keys(payload.services).forEach(service_id => {
            payload.services[service_id].type = 5;

            if(payload.services[service_id].client_id == null && payload.services[service_id].subscribed){
                delete payload.services[service_id].subscribed;

                //set client id on new schedulers
                payload.services[service_id].client_id = payload.id;
                
                //push in array
                newSchedulersList.push(payload.services[service_id]);
            }else if(payload.services[service_id].subscribed){
                delete payload.services[service_id].subscribed;
                
                //add in update data
                updateSchedulersList.push(payload.services[service_id]);
            }
        });

        await Scheduler.createMany(newSchedulersList);
        await Scheduler.updateOrCreateMany('id',updateSchedulersList);

        delete payload.subsidiary;
        delete payload._services;
        delete payload.services;
        delete payload.group;

        const headers = await MasterTemplate
            .query()
            .where('table_name','clients');

        headers.forEach(header => {
            if(header.column_type == 'Date'){
                Client.$addColumn(header.column_name,ClientsController.dateOptions);
            }else{
                Client.$addColumn(header.column_name,{});
            }
        });

        const old = await Client
            .query()
            .where('id',payload.id)
            .first()

        Object.values(files).forEach(async file => {
            const path = `/file/client/${payload.id}/`;
            const file_name = `${file.fieldName}.${file.extname}`

            try{
                fs.unlinkSync(Application.makePath(old[file.fieldName]));
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

        await Client
            .query()
            .where('id',payload.id)
            .update(payload)

        response.send({
            status: 'success',
            data: payload
        })

    }

    public async bulkServiceUpdate({request,response}: HttpContextContract){
        const payload = request.all();
        const newSchedulers: any[] = [];
        const tempServiceObject = {
            client_id: '',
            service_id: payload.service_id,
            type: 5,
            frequency: payload.frequency,
            next: payload.next
        }

        await Scheduler
            .query()
            .whereIn('client_id',payload.ids)
            .where('service_id',payload.service_id)
            .delete()

        payload.ids.forEach(id => {
            tempServiceObject.client_id = id;
            newSchedulers.push(tempServiceObject);
        });

        await Scheduler
            .createMany(newSchedulers);

        response.send({
            status: 'success'
        })
    }

    public async remove({request,response}: HttpContextContract){
        const payload = request.all();

        await Client
            .query()
            .whereIn('id',payload.id)
            .update({deleted: true})

        response.send({
            status: 'success'
        })
    }

    public async restore({request,response}: HttpContextContract){
        const payload = request.all();

        await Client
            .query()
            .whereIn('id',payload.id)
            .update({deleted: false})

        response.send({
            status: 'success'
        })
    }

    public async destroy({request,response}: HttpContextContract){
        const payload = request.all();

        //delete folders for above clients
        payload.id.forEach(id => {
            try{
                fs.rmSync(Application.makePath(`/file/client/${id}`),{recursive: true, force: true});
            }catch{}
        });

        await Client
            .query()
            .whereIn('id',payload.id)
            .delete();

        await Client
            .query()
            .whereIn('group_id',payload.id)
            .update({'group_id':null})
        
        response.send({
            status: 'success'
        })
    }
}
