import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Role from 'App/Models/Role';

export default class RolesController {

    public async index({}: HttpContextContract) {}

    public async get({}: HttpContextContract) {}

    public async options({response}: HttpContextContract) {
        const data = await Role
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

    public async columns({}: HttpContextContract) {}

    public async create({}: HttpContextContract) {}

    public async update({}: HttpContextContract) {}

    public async destroy({}: HttpContextContract) {}
}
