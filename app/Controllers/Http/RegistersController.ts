import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import DynamicRegister from 'App/Models/DynamicRegister';
import RegisterMaster from 'App/Models/RegisterMaster';
import RegisterTemplate from 'App/Models/RegisterTemplate';
import { string } from '@ioc:Adonis/Core/Helpers';
import { DateTime } from 'luxon';

export default class RegistersController {

    public static dateOptions = {
        serialize: (value) => {
            return DateTime.fromObject(value).toISODate()
        }
    }

    public async index({request,response}: HttpContextContract){
        const payload = request.params();

        //setup dynamic register
        const register = await RegisterMaster
            .query()
            .where('id',payload.table_id)
            .first();

        const headers = await RegisterTemplate
            .query()
            .where('table_id',payload.table_id);

        headers.forEach(header => {
            DynamicRegister.$addColumn(header.column_name,RegistersController.dateOptions);
        });

        DynamicRegister.table = string.escapeHTML("register__" + register?.name + register?.version);
        //setup complete

        const data = await DynamicRegister.all();

        response.send({
            status: 'success',
            data: data
        });
    }

    public async get({request,response}: HttpContextContract){
        const payload = request.params();

        //setup dynamic register
        const register = await RegisterMaster
            .query()
            .where('id',payload.table_id)
            .first();

        const headers = await RegisterTemplate
            .query()
            .where('table_id',payload.table_id);

        headers.forEach(header => {
            DynamicRegister.$addColumn(header.column_name,RegistersController.dateOptions);
        });

        DynamicRegister.table = string.escapeHTML("register__" + register?.name + register?.version);
        //setup complete

        const data = await DynamicRegister
            .query()
            .where('id',payload.id)
            .first();

        response.send({
           status: 'success',
           data: data 
        });
    }

    public async update({request,response}: HttpContextContract){
        const payload = request.params();
        const data = request.all();

        //setup dynamic register
        const register = await RegisterMaster
            .query()
            .where('id',payload.table_id)
            .first();

        const headers = await RegisterTemplate
            .query()
            .where('table_id',payload.table_id);

        headers.forEach(header => {
            DynamicRegister.$addColumn(header.column_name,RegistersController.dateOptions);
        });

        DynamicRegister.table = string.escapeHTML("register__" + register?.name + register?.version);
        //setup complete

        //null data
        Object.keys(data).forEach(k => {
            if(data[k] == "null"){
                data[k] = null;
            }
        });

        await DynamicRegister
            .query()
            .where('id',data.id)
            .update(data);

        response.send({
            status: 'success',
            data: data
        });
        
    }
}
