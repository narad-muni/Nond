import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import RegisterMaster from 'App/Models/RegisterMaster'
import Scheduler from 'App/Models/Scheduler'
import { string } from '@ioc:Adonis/Core/Helpers'
import RegisterTemplate from 'App/Models/RegisterTemplate'
import ArchivedRegisterTemplate from 'App/Models/ArchivedRegisterTemplate'

export default class RegistersController {
    public async index({ response }: HttpContextContract) {
        try {
            const data = await RegisterMaster
                .query()
                .preload('service', (query) => {
                    query
                        .select('id', 'name')
                });

            response.send({
                status: 'success',
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

    public async get({ request, response }: HttpContextContract) {
        try {
            const id = request.param('id')
            const data = await RegisterMaster
                .query()
                .preload('scheduler', (query) => {
                    query.select('id', 'next', 'frequency', 'data')
                })
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
                    message: 'RegisterMaster not found'
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
            const payload = request.param('filter', 'active');

            let data: any = RegisterMaster
                .query()
                .select('id', 'name', 'version');

            if (payload == 'archived') {
                data = data.where('active', false);
            } else if (payload == 'active') {
                data = data.where('active', true);
            }

            response.send(await data);

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

            payload.name = payload.name?.replaceAll(".", "");
            payload.name = payload.name?.replaceAll(",", "");

            payload.version = payload.version?.replaceAll(".", "");
            payload.version = payload.version?.replaceAll(",", "");

            //set "null" to null
            Object.keys(payload).forEach(e => {
                if (payload[e] == "null" || String(payload[e]) == "") {
                    payload[e] = null;
                }
            });

            const scheduler = {
                frequency: payload.frequency,
                next: payload.next,
                data: { rotation_strategy: payload.rotation_strategy },
                register_id: 0,
                type: 1
            }

            const exist = await RegisterMaster
                .query()
                .where('name', payload.name)
                .first();

            if (exist) {
                response.send({
                    status: 'error',
                    message: 'register already exists, rotate existsing register.'
                });
            } else {
                delete payload.frequency;
                delete payload.next;
                delete payload.rotation_strategy;

                await Database.rawQuery(`create table "register__${string.escapeHTML(payload.name + payload.version)}"(
                    id integer generated by default as identity primary key not null,
                    client_id int4,
                    entry_on date default CURRENT_DATE
                )`);

                //create rollover table
                await Database.rawQuery(`create table "rollover__register__${string.escapeHTML(payload.name + payload.version)}"(
                    id integer generated by default as identity primary key not null,
                    client_id int4
                )`);

                payload.active = true;

                const data = await RegisterMaster
                    .create(payload);

                payload.id = data.id;

                scheduler.register_id = data.id;

                //never rotate
                if (scheduler.frequency == null) {
                    scheduler.type = -1;
                }

                const new_scheduler = await Scheduler.create(scheduler);

                const min = await RegisterTemplate
                    .query()
                    .min('id')
                    .first();

                await RegisterTemplate.create({
                    id: min?.$extras.min - 1,
                    table_id: new_scheduler.id,
                    column_name: "entry_on",
                    display_name: "Entry On",
                    column_type: "Date",
                    column_info: {},
                    order: 1,
                    master: true,
                    rollover: false,
                    client_column_id: null,
                });

                response.send({
                    status: 'success',
                    data: payload
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

    public async archive({ request, response }: HttpContextContract) {
        try {
            let id = request.input('id');
            let client_columns = {};
            let update_query_columns = {};

            //filter out only active one's
            const payload = await RegisterMaster
                .query()
                .whereIn('id', id)
                .where('active', true);

            id = payload.map(e => e.id);

            await Scheduler
                .query()
                .whereIn('register_id', id)
                .delete();

            await RegisterMaster
                .query()
                .whereIn('id', id)
                .update({ active: false });

            //archive register template
            const register_templates = await RegisterTemplate
                .query()
                .whereIn('table_id', id);

            let serialized_register_templates: any = {};

            id.forEach(e => {
                update_query_columns[e] = "";
                client_columns[e] = "";
                serialized_register_templates[e] = { table_id: e, columns: [] };
            });

            register_templates.forEach(register_template => {
                const table_id_temp = register_template.table_id;

                if (register_template.client_column_id != null) {
                    client_columns[table_id_temp] += "add column client__" + register_template.column_name + " varchar,";
                    update_query_columns[table_id_temp] += "client__" + register_template.column_name + " = s." + register_template.column_name + ",";
                }

                serialized_register_templates[table_id_temp]
                    .columns
                    .push(register_template);
            });

            //convert array to object for storing in db
            serialized_register_templates = Object.values(serialized_register_templates);

            serialized_register_templates.forEach(e => {
                e.columns = { data: e.columns };
            });

            await ArchivedRegisterTemplate.createMany(serialized_register_templates);

            await RegisterTemplate
                .query()
                .whereIn('table_id', id)
                .delete();

            for await (const register of payload) {
                if (update_query_columns[register.id]?.length && client_columns[register.id]?.length) {

                    update_query_columns[register.id] = update_query_columns[register.id].slice(0, -1);
                    client_columns[register.id] = client_columns[register.id].slice(0, -1);

                    await Database.rawQuery(`alter table  "register__${string.escapeHTML(register.name + register.version)}" ${client_columns[register.id]}`);
                    await Database.rawQuery(`
                        update "register__${string.escapeHTML(register.name + register.version)}"
                        set ${update_query_columns[register.id]}
                        from clients s
                        where s.id = client_id
                    `);
                }

                await Database.rawQuery(`drop table "rollover__register__${string.escapeHTML(register.name + register.version)}"`);
            };

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

    public async update({ request, response }: HttpContextContract) {
        try {
            const data = request.all();

            const exist = await RegisterMaster
                .query()
                .select('id')
                .where('name', data.name)
                .where('version', data.version)
                .first();

            if (!data.active) {//archived regitser
                response.send({
                    status: 'error',
                    message: 'register not active!'
                });
                return;
            }

            if (exist?.id != data.id && exist?.id != null) {
                response.send({
                    status: 'error',
                    message: 'register with same name and version already exists!'
                });
                return;
            } else {

                if (exist?.id == null) {
                    const old = await RegisterMaster
                        .query()
                        .where('id', data.id)
                        .firstOrFail();

                    await Database.rawQuery(`alter table "register__${string.escapeHTML(old.name + old.version)}" rename to "register__${string.escapeHTML(data.name + data.version)}"`);

                    //rename rollover table
                    await Database.rawQuery(`alter table "rollover__register__${string.escapeHTML(old.name + old.version)}" rename to "rollover__register__${string.escapeHTML(data.name + data.version)}"`);
                }

                const scheduler = data.scheduler;
                delete data.scheduler;

                await Scheduler
                    .query()
                    .where('id', scheduler.id)
                    .update(scheduler);

                await RegisterMaster
                    .query()
                    .where('id', data.id)
                    .update(data);

                response.send({
                    status: 'success',
                    message: null,
                    data: data
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

    public async destroy({ request, response }: HttpContextContract) {
        try {
            const id = request.input('id');

            const registers = await RegisterMaster
                .query()
                .whereIn('id', id);

            for (const register of registers) {
                await Database.rawQuery(`drop table "register__${string.escapeHTML(register.name + register.version)}"`);

                //delete rollover table if active register is deleted
                if (register.active) {
                    await Database.rawQuery(`drop table "rollover__register__${string.escapeHTML(register.name + register.version)}"`);
                }
            }

            await RegisterTemplate
                .query()
                .whereIn('table_id', id)
                .delete();

            await ArchivedRegisterTemplate
                .query()
                .whereIn('table_id', id)
                .delete();

            await RegisterMaster
                .query()
                .whereIn('id', id)
                .delete();

            await Scheduler
                .query()
                .whereIn('register_id', id)
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
