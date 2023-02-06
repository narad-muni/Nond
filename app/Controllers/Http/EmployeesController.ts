import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Employee from 'App/Models/Employee';
import Crypto from 'crypto';

export default class EmployeesController {
    public async index({response}: HttpContextContract) {
        const data = await Employee
            .query()
            .preload('role',(query) => {
                query.select('name')
            })
            .where('deleted',false)

        const serilizedData = data.map(e => e.serialize());
        
        serilizedData.forEach(e => {
            e.role = e.role.name;
            delete e.role_id;
        });

        response.send({
            status: 'success',
            message: null,
            data: serilizedData
        });
    }

    public async get({response,request}: HttpContextContract) {

        const data = await Employee
            .query()
            .where('deleted',false)
            .where('id',request.param('id'))
            .first()

        if(data){

            const serilizedData = data.serialize()

            serilizedData.role = serilizedData.role_id;
            delete serilizedData.role_id;

            response.send({
                status: 'success',
                message: null,
                data: serilizedData
            });
        }else{
            response.send({
                status: 'error',
                message: 'User not found',
                data: null
            });
        }

    }

    public async options({response}: HttpContextContract) {
        const data = await Employee
            .query()
            .select('id','username')
            .where('deleted',false)

        const serilizedData = data.map(e => e.serialize())

        serilizedData.map(e => {
            e.value = e.id;
            e.name = e.username;

            delete e.id;
            delete e.username;
        });

        response.send(serilizedData);

    }

    public async columns({response}: HttpContextContract) {
        response.send({
            status: 'success',
            data: {
                id: {
                    type: 'Text'
                },
                username: {
                    type: 'Text'
                },
                role: {
                    type: 'Text'
                },
                is_admin: {
                    type: 'Checkbox'
                }
            }
        });
    }

    public async create({request,response}: HttpContextContract) {
        const data = request.all()
        const emp = await Employee.create(data);

        data.id = emp.id;

        response.send({
            status: 'success',
            message: null,
            data: data
        })
    }

    public async update({request,response}: HttpContextContract) {
        const data = request.all()
        data.role_id = data.role;
        delete data.role;

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

    public async remove({}: HttpContextContract) {}
    
    public async destroy({}: HttpContextContract) {}
}
