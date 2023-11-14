import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RegisterMaster from 'App/Models/RegisterMaster'
import Scheduler from 'App/Models/Scheduler'
import Service from 'App/Models/Service'
import Task from 'App/Models/Task'

export default class RolesController {

    public async index({ response }: HttpContextContract) {
        try {
            const data = await Service
                .query()
                .preload('template', (query) => {
                    query.select('name')
                });

            response.send({
                status: 'success',
                data: data,
                message: null
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
            const id = request.param('id');
            const data = await Service
                .query()
                .where('id', id)
                .first();

            if (data) {
                response.send({
                    status: 'success',
                    data: data,
                    message: null
                });
            } else {
                response.send({
                    status: 'error',
                    data: null,
                    message: 'Role not found'
                });
            }
        } catch (e) {
            console.log(e);

            response.send({
                status: "error",
                message: "some error occured"
            });
        }
    }

    public async options({ request, response }: HttpContextContract) {
        try {

            const filter = request.param('all', 'true') == 'true' ? -5 : 0;

            const data = await Service
                .query()
                .select('name', 'id')
                .where('id', '>=', filter);

            const serilizedData = data.map(e => e.serialize())

            serilizedData.map(e => {
                e.value = e.id;

                delete e.id;
            });

            response.send(serilizedData);

        } catch (e) {
            console.log(e);

            response.send({
                status: "error",
                message: "some error occured"
            });
        }
    }

    public async options_gst({ request, response }: HttpContextContract) {
        try {
            const data = await Service
                .query()
                .select('gst')
                .where('hsn', request.param('hsn', null))
                .first();

            response.send(data?.gst || "");

        } catch (e) {
            console.log(e);

            response.send({
                status: "error",
                message: "some error occured"
            });
        }
    }

    public async options_all({ response }: HttpContextContract) {
        try {
            const data = await Service
                .query()

            const serilizedData = data.map(e => e.serialize())

            serilizedData.map(e => {
                e.value = e.id;

                delete e.id;
            });

            response.send(serilizedData);

        } catch (e) {
            console.log(e);

            response.send({
                status: "error",
                message: "some error occured"
            });
        }
    }

    public async create({ request, response }: HttpContextContract) {
        try {
            const payload = request.all();

            //set "null" to null
            Object.keys(payload).forEach(e => {
                if (payload[e] == "null" || String(payload[e]) == "") {
                    payload[e] = null;
                }
            });

            const data = await Service
                .create(payload);

            await Service
                .query()
                .where('hsn', data.hsn)
                .update({ 'gst': data.gst });

            payload.id = data.id;

            response.send({
                status: 'success',
                data: payload
            });

        } catch (e) {
            console.log(e);

            response.send({
                status: "error",
                message: "some error occured"
            });
        }
    }

    public async update({ request, response }: HttpContextContract) {
        try {
            const data = request.all();

            if (data.id < 0) {
                response.send({
                    status: "error",
                    message: "Cannot modify default services"
                });

                return;
            }

            //set "null" to null
            Object.keys(data).forEach(e => {
                if (data[e] == "null" || String(data[e]) == "") {
                    data[e] = null;
                }
            });

            await Service
                .query()
                .where('hsn', data.hsn)
                .update({ 'gst': data.gst });

            await Service
                .query()
                .where('id', data.id)
                .update(data);

            response.send({
                status: 'success',
                message: null,
                data: data
            });

        } catch (e) {
            console.log(e);

            response.send({
                status: "error",
                message: "some error occured"
            });
        }
    }

    public async destroy({ request, response }: HttpContextContract) {
        try {
            const id = request.input('id');

            if (id.filter(e => e <= 0).length) {
                response.send({
                    status: 'error',
                    message: 'Cannot remove default services'
                });

                return;
            }

            //update delete tasks, schedulers, registers

            //delete tasks
            await Task
                .query()
                .whereIn('service_id', id)
                .delete();

            //delete user entries scheduler
            await Scheduler
                .query()
                .whereIn('service_id', id)
                .delete();

            //delete registers
            await RegisterMaster
                .query()
                .whereIn('service_id', id)
                .delete();

            await Service
                .query()
                .whereIn('id', id)
                .delete();

            response.send({
                status: 'success'
            });
        } catch (e) {
            console.log(e);

            response.send({
                status: "error",
                message: "some error occured"
            });
        }
    }
}
