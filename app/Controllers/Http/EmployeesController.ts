import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database';
import Employee from 'App/Models/Employee';
import Crypto from 'crypto';

export default class EmployeesController {
    public async index({request, response}: HttpContextContract) {
        const deleted = request.param('deleted',false);

        const data = await Employee
            .query()
            .preload('role',(query) => {
                query.select('name')
            })
            .where('deleted',deleted);

        response.send({
            status: 'success',
            message: null,
            data: data
        });
    }

    public async get({response,request}: HttpContextContract) {

        const data = await Employee
            .query()
            .where('deleted',false)
            .where('id',request.param('id'))
            .first()

        if(data){
            response.send({
                status: 'success',
                message: null,
                data: data
            });
        }else{
            response.send({
                status: 'error',
                message: 'User not found',
                data: null
            });
        }

    }

    public async index_deleted({response}: HttpContextContract) {
        const data = await Employee
            .query()
            .preload('role',(query) => {
                query.select('name')
            })
            .where('deleted',true)

        response.send({
            status: 'success',
            message: null,
            data: data
        });
    }

    public async options({response}: HttpContextContract) {
        const data = await Database
            .from('employees')
            .select({
                name: 'username',
                value: 'id'
            })
            .where('deleted',false);

        response.send(data);

    }

    public async restore({request,response}: HttpContextContract){
        const payload = request.all();

        await Employee
            .query()
            .whereIn('id',payload.id)
            .update({deleted: false});

        response.send({
            status: 'success'
        });
    }

    public async create({request,response}: HttpContextContract) {
        const data = request.all();

        //set "null" to null
        Object.keys(data).forEach(e => {
            if(data[e] == "null" || String(data[e]) == ""){
                data[e] = null;
            }
        });

        if(data.is_admin){
            data.role_id = -1;
        }

        const emp = await Employee.create(data);

        data.id = emp.id;

        response.send({
            status: 'success',
            message: null,
            data: data
        })
    }

    public async update({request,response}: HttpContextContract) {
        const data = request.all();

        //set "null" to null
        Object.keys(data).forEach(e => {
            if(data[e] == "null" || String(data[e]) == ""){
                data[e] = null;
            }
        });

        if(data.is_admin){
            data.role_id = -1;
        }

        if(data.password == null){
            delete data.password
        }else{
            data.password = Crypto.createHash('sha256').update(data.password).digest('hex');
        }

        if(data.hasOwnProperty('id')){
            await Employee
                .query()
                .where('id',data.id)
                .update(data)

            response.send({
                status: 'success',
                data: data,
                message: null
            })
        }else{
            response.send({
                status: 'error',
                message: 'Id field is required'
            })
        }
    }

    public async remove({request,response}: HttpContextContract) {
        const payload = Object.values(request.all())[0]

        if(payload.includes(0)){
            response.send({
                status: 'error',
                message: 'Cannot remove admin user'
            })
        }else{
            await Employee
                .query()
                .whereIn('id',payload)
                .update({"deleted": true})

            response.send({
                status: 'success'
            })
        }
    }
    
    public async destroy({request,response}: HttpContextContract) {
        const payload = Object.values(request.all())[0]

        if(payload.includes(0)){
            response.send({
                status: 'error',
                message: 'Cannot remove admin user'
            })
        }else{
            await Employee
                .query()
                .whereIn('id',payload)
                .delete()

            response.send({
                status: 'success'
            })
        }
    }
}
