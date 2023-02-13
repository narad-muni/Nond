import Application from '@ioc:Adonis/Core/Application'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Client from 'App/Models/Client';
import MasterTemplate from 'App/Models/MasterTemplate';

export default class ClientsController {
    public async index({response}: HttpContextContract){

        const headers = await MasterTemplate
            .query()
            .where('table_name','clients')

        headers.forEach(header => {
            Client.$addColumn(header.column_name,{});      
        });

        const data = await Client
            .query()
            .where('deleted',false)

        response.send(data);
    }

    public async indexMaster({response}: HttpContextContract){

        const headers = await MasterTemplate
            .query()
            .where('table_name','clients')

        headers.forEach(header => {
            if(header.is_master){
                Client.$addColumn(header.column_name,{});
            }            
        });

        const data = await Client
            .query()
            .where('deleted',false)

        response.send(data);
    }

    public async get({request,response}: HttpContextContract){
        const payload = request.params()

        const data = await Client
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
    }

    public async options({response}: HttpContextContract) {
        const data = await Client
            .query()
            .select('id','name')
            .where('deleted',false)

        const serilizedData = data.map(e => e.serialize())

        serilizedData.map(e => {
            e.value = e.id;
            e.name = e.name;

            delete e.id;
            delete e.name;
        });

        response.send(serilizedData);

    }

    public async create({request,response}: HttpContextContract){
        const payload = request.all();
        const files = request.allFiles();

        const headers = await MasterTemplate
            .query()
            .where('table_name','clients')

        headers.forEach(header => {
            Client.$addColumn(header.column_name,{});
        });

        const inserted = await Client.create(payload);

        payload.id = inserted.id;
        
        Object.values(files).forEach(file => {
            const path = `/file/client/${inserted.id}/`;
            const file_name = `${file.fieldName}.${file.extname}`
            file.move(Application.makePath(path),{name:file_name});
            payload[file.fieldName] = path+file_name;
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
        const payload = request.all()
    }

    public async remove({request,response}: HttpContextContract){
        const payload = request.all()
    }

    public async destroy({request,response}: HttpContextContract){
        const payload = request.all()
    }
}
