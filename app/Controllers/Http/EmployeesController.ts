import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class EmployeesController {
    public async index({response}: HttpContextContract) {
        response.send({
            status: 'success',
            data: [{
                    id: 0,
                    username: 'admin'
                },
                {
                    id: 1,
                    username: 'saumil'
                },
            ]
        });
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
            }
        });
    }

    public async create({}: HttpContextContract) {}

    public async update({}: HttpContextContract) {}

    public async remove({}: HttpContextContract) {}
    
    public async destroy({}: HttpContextContract) {}
}
