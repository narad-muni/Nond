import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Employee from 'App/Models/Employee';
import Role from 'App/Models/Role';

export default class RolesController {

    public async index({response}: HttpContextContract) {
        try{
            const data = await Role
                .query()
                .select('id','name');

            response.send({
                status: 'success',
                data: data,
                message: null
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
            const id = request.param('id')
            const data = await Role
                .query()
                .where('id',id)
                .first();

            if(data){
                response.send({
                    status: 'success',
                    data: data,
                    message: null
                });
            }else{
                response.send({
                    status: 'error',
                    data:null,
                    message: 'Role not found'
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

    public async options({response}: HttpContextContract) {
        try{
            const data = await Role
                .all();

            const serilizedData = data.map(e => e.serialize())

            serilizedData.map(e => {
                e.value = e.id;

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

    public async create({request,response}: HttpContextContract) {
        try{
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
                .create(payload);

            payload.id = data.id;
            
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

    public async update({request,response}: HttpContextContract) {
        try{
            const payload = request.all();
            if(payload.id <= 0){
                response.send({
                    status: 'error',
                    message: 'Cannot modify default roles',
                    data: null
                });
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
        }catch(e){
            console.log(e);

            response.send({
                status: "error",
                message: "some error occured"
            });
        }
    }
}
