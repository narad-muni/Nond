import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Employee from 'App/Models/Employee';

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
        });

        response.send(serilizedData);
    }

    public async get({}: HttpContextContract) {

        // console.log(payload);

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

    public async create({}: HttpContextContract) {}

    public async update({}: HttpContextContract) {}

    public async remove({}: HttpContextContract) {}
    
    public async destroy({}: HttpContextContract) {}
}
