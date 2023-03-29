import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database';
import RegisterMaster from 'App/Models/RegisterMaster';
import { string } from '@ioc:Adonis/Core/Helpers';

export default class ArchivedRegistersController {
    public async index({request,response}: HttpContextContract){
        const payload = request.params();

        const table = await RegisterMaster
                        .query()
                        .select('name','version')
                        .where('id',payload.table_id)
                        .first();

        const data = await Database
            .rawQuery(`select * from "${string.escapeHTML("register__"+table?.name+table?.version)}"`);

        response.send({
            status: 'success',
            data: data.rows
        });
    }

    public async get({request,response}: HttpContextContract){
        const payload = request.params();

        const table = await RegisterMaster
                        .query()
                        .select('name','version')
                        .where('id',payload.table_id)
                        .first();

        const data = await Database
            .rawQuery(`select * from "${string.escapeHTML("register__"+table?.name+table?.version)}" where id = ${payload.id}`);

        response.send({
            status: 'success',
            data: data.rows[0]
        })
    }
}
