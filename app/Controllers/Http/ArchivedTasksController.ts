import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ArchivedTask from 'App/Models/ArchivedTask';

export default class ArchivedTasksController {

    public async index({ request, response, session }: HttpContextContract) {
        try {

            const self = request.param("self", "true");

            let data: any = ArchivedTask
                .query()

            if (self == "true") {
                const user_name = session.get('user').username;

                data = data
                    .where('assigned_to', user_name);
            }

            response.send({
                status: 'success',
                data: await data
            });
        } catch (e) {
            console.log(e);

            response.send({
                status: "error",
                message: "some error occured"
            });
        }
    }

    public async get({ request, response }: HttpContextContract) {
        try {
            const payload = request.params()
            const data = await ArchivedTask
                .query()
                .where('id', payload.id)
                .first();

            if (data) {
                response.send({
                    status: 'success',
                    data: data
                })
            } else {
                response.send({
                    status: 'error',
                    message: 'Task not found'
                })
            }

        } catch (e) {
            console.log(e);

            response.send({
                status: "error",
                message: "some error occured"
            });
        }
    }
}
