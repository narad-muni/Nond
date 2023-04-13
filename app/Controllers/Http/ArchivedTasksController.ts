import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ArchivedTask from 'App/Models/ArchivedTask';

export default class ArchivedTasksController {

    public async index({request,response,session}: HttpContextContract){

        const self = request.param("self","true");

        let data:any = ArchivedTask
            .query()

        if(self == "true"){
            const user_name = session.get('user').username;

            data = data
                .where('assigned_to',user_name);
        }

        response.send({
            status: 'success',
            data: await data
        });
    }

    public async get({request,response}: HttpContextContract){
        const payload = request.params()
        const data = await ArchivedTask
            .query()
            .where('id',payload.id)
            .first();

        if(data){
            response.send({
                status: 'success',
                data: data
            })
        }else{
            response.send({
                status: 'error',
                message: 'Task not found'
            })
        }

    }
}
