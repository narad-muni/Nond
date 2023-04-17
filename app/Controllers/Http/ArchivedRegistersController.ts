import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database';
import RegisterMaster from 'App/Models/RegisterMaster';
import { string } from '@ioc:Adonis/Core/Helpers';

export default class ArchivedRegistersController {
    public async index({request,response}: HttpContextContract){
        try{
            const payload = request.params();

            const table = await RegisterMaster
                            .query()
                            .select('name','version')
                            .where('id',payload.table_id)
                            .first();

            if(!table){
                response.send({
                    status: "error",
                    message: "Register not found"
                });
                return;
            }

            const data = await Database
                .rawQuery(`select * from "${string.escapeHTML("register__"+table?.name+table?.version)}"`);

            data.rows.forEach((_,i) => {
                Object.keys(data.rows[i]).forEach(element => {
                    if(data.rows[i][element] instanceof Date){
                        data.rows[i][element] = data.rows[i][element].toISOString().slice(0, 10);
                    }
                });
            });

            response.send({
                status: 'success',
                data: data.rows
            });
        }catch(e){
            console.log(e);

            response.send({
                status: "error",
                message: "some error occured"
            });
        }
    }

    public async get({request,response}: HttpContextContract){
        try{
            const payload = request.params();

            const table = await RegisterMaster
                            .query()
                            .select('name','version')
                            .where('id',payload.table_id)
                            .first();

            if(!table){
                response.send({
                    status: "error",
                    message: "Register not found"
                });
                return;
            }

            const data = await Database
                .rawQuery(`select * from "${string.escapeHTML("register__"+table?.name+table?.version)}" where id = ${payload.id}`);

            Object.keys(data.rows[0]).forEach(element => {
                if(data.rows[0][element] instanceof Date){
                    data.rows[0][element] = data.rows[0][element].toISOString().slice(0, 10);
                }
            });

            response.send({
                status: 'success',
                data: data.rows[0]
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
