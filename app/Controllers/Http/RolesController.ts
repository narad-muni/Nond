import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Employee from 'App/Models/Employee';
import Role from 'App/Models/Role';

export default class RolesController {

    public async index({response}: HttpContextContract) {
        const data = await Role
            .query()
            .select('id','name')

        response.send({
            status: 'success',
            data: data,
            message: null
        })
    }

    public async get({request,response}: HttpContextContract) {
        const id = request.param('id')
        const data = await Role
            .query()
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
                message: 'Role not found'
            })
        }
    }

    public async options({response}: HttpContextContract) {
        const data = await Role
            .all()

        const serilizedData = data.map(e => e.serialize())

        serilizedData.map(e => {
            e.value = e.id;

            delete e.id;
        });

        response.send(serilizedData);

    }

    public async create({request,response}: HttpContextContract) {
        const payload = request.all();
        payload.read.task = true;

        // remove unchecked roles
        Object.keys(payload).forEach(action => {
            Object.keys(payload[action]).forEach(role => {
                if(!payload[action][role]){
                    delete payload[action][role];
                }
            });
        });

        const data = await Role
            .create(payload)

        payload.id = data.id;
        
        response.send({
            status: 'success',
            data: payload
        })
        
    }

    public async update({request,response}: HttpContextContract) {
        const payload = request.all();
        if(payload.id <= 0){
            response.send({
                status: 'error',
                message: 'Cannot modify default roles',
                data: null
            })
        }else{

            // remove unchecked roles
            Object.keys(payload).forEach(action => {
                Object.keys(payload[action]).forEach(role => {
                    if(!payload[action][role]){
                        delete payload[action][role];
                    }
                });
            });

            await Role
                .query()
                .where('id',payload.id)
                .update(payload);

            response.send({
                status: 'success',
                message: null,
                data: payload
            });
        }
    }

    public async destroy({request,response}: HttpContextContract) {
        const id = request.input('id')

        if(id.filter(e => e <= 0).length){
            response.send({
                status: 'error',
                message: 'Cannot remove default roles'
            });

            return;
        }

        await Employee
            .query()
            .whereIn('role_id',id)
            .update({role_id:1});

        await Role
            .query()
            .whereIn('id',id)
            .delete();
        
        response.send({
            status: 'success'
        });
    }
}
