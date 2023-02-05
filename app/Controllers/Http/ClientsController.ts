import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Client from 'App/Models/Client';

export default class ClientsController {
    public async index({}: HttpContextContract){}

    public async indexMaster({}: HttpContextContract){}

    public async get({}: HttpContextContract){}

    public async getMaster({}: HttpContextContract){}

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

    public async columns({}: HttpContextContract){}

    public async create({}: HttpContextContract){}

    public async update({}: HttpContextContract){}

    public async remove({}: HttpContextContract){}

    public async destroy({}: HttpContextContract){}
}
