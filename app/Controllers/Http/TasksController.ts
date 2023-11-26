import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import InvoiceDAO from 'App/Dao/InvoiceDAO';
import Invoice from 'App/Models/Invoice';
import Task from 'App/Models/Task'

export default class TasksController {
    public async index({ request, response, session }: HttpContextContract) {
        try {

            const billed = request.param("billed", 1);
            const status = request.param("status", 1);
            const self = request.param("self", "true");

            let data: any = Task
                .query()
                .preload('service', (query) => {
                    query.select('name')
                })
                .preload('client', (query) => {
                    query
                        .select('name', 'group_id')
                        .preload('group', (query) => {
                            query.select('id', 'name')
                        })
                })
                .preload('assigned_user', (query) => {
                    query.select('username')
                })

            //task billed status
            if (billed == 0) {
                data = data
                    .whereNot('billed', true)
            } else if (billed == 2) {
                data = data
                    .where('billed', true)
            }

            //task status
            if (status == 0) {
                data = data
                    .whereNot('status', 4)
            } else if (status == 2) {
                data = data
                    .where('status', 4)
            }

            if (self == "true") {
                const user_id = session.get('user').id;

                data = data
                    .where('assigned_to', user_id);
            }

            data = await data;

            data.forEach((_, i) => {
                data[i].money = data[i].money || [];
                data[i].time = data[i].time || [];
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
            const payload = request.params()
            const data = await Task
                .query()
                .where('id', payload.id)
                .preload('client', (query) => {
                    query.select('name')
                })
                .preload('service', (query) => {
                    query.select('name')
                })
                .preload('assigned_user', (query) => {
                    query.select('username')
                })
                .first();

            if (data) {
                data.money = data.money || [];
                data.time = data.time || [];

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

    public async create({ request, response }: HttpContextContract) {
        try {
            const payload = request.all();

            //set "null" to null
            Object.keys(payload).forEach(e => {
                if (payload[e] == "null" || String(payload[e]) == "") {
                    payload[e] = null;
                }
            });

            if (Array.isArray(payload.client_id)) {//if array of client id is passed
                const tasksArray: any[] = [];
                const tempObject = payload;

                payload.client_id.forEach(client => {
                    tempObject.client_id = client;
                    tasksArray.push(tempObject);
                });

                await Task.createMany(tasksArray);

                response.send({
                    status: 'success'
                })

            } else {//if single client id is passed
                const data = await Task.create(payload);

                response.send({
                    status: 'success',
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

    public async update({ request, response }: HttpContextContract) {
        try {
            const payload = request.all();

            //set "null" to null
            Object.keys(payload).forEach(e => {
                if (payload[e] == "null" || String(payload[e]) == "") {
                    payload[e] = null;
                }
            });

            delete payload.client;
            delete payload.assigned_user;
            delete payload.service;
            delete payload.service;
            delete payload.your_total_time;
            delete payload.your_total_money;

            await Task
                .query()
                .where('id', payload.id)
                .update(payload);

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

    public async bulk_update({ request, response }: HttpContextContract) {
        try {
            const payload = request.all();

            //set "null" to null
            Object.keys(payload).forEach(e => {
                if (payload[e] == "null" || String(payload[e]) == "") {
                    delete payload[e];
                }
            });

            const ids = payload.ids;

            delete payload.client;
            delete payload.ids;
            delete payload.assigned_user;
            delete payload.service;

            if(Object.keys(payload).length == 0){
                response.send({
                    status: 'success',
                    data: payload
                });
                
                return;
            }

            await Task
                .query()
                .whereIn('id', ids)
                .update(payload);

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

    //once billed, archive completed task, keep task for last 2 years
    public async bill({ request, response }: HttpContextContract) {
        try {
            const payload = request.all();
            const tasks = await Task
                .query()
                .preload('service', (query) => {
                    query.select('id', 'name', 'hsn', 'gst')
                })
                .whereIn('id', payload.ids);

            // generate bill
            const tempInvoiceObject = {
                client_id: 0,
                company_id: payload.company_id,
                particulars: [],
                paid: null,
                total: null,
                remarks: '',
                gst: payload.gst,
                tasks: [],
                date: new Date().toJSON().slice(0, 10)
            }

            const invoice_list_obj = {};
            const start_end = {};

            //get high low date range for client tasks based on services
            tasks.forEach(task => {
                if (task.service_id >= 0) {
                    if (start_end[task.client_id]) {//exisiting entry

                        if (start_end[task.client_id][task.service_id]) {//existing entry

                            //update previous dates
                            if (start_end[task.client_id][task.service_id]['high'] < task.created.toISODate()) {
                                start_end[task.client_id][task.service_id]['high'] = task.created.toISODate();
                            } else if (start_end[task.client_id][task.service_id]['low'] > task.created.toISODate()) {
                                start_end[task.client_id][task.service_id]['low'] = task.created.toISODate();
                            }

                        } else {
                            start_end[task.client_id][task.service_id] = {//new entry
                                high: task.created.toISODate(),
                                low: task.created.toISODate(),
                            }
                        }

                    } else {//new entry
                        start_end[task.client_id] = {}
                        start_end[task.client_id][task.service_id] = { high: task.created.toISODate(), low: task.created.toISODate(), }
                    }
                }
            });

            //add task in particulars with price
            tasks.forEach(task => {
                let date_range = "";

                if (task.service_id >= 0) {
                    date_range = start_end[task.client_id][task.service_id]["low"] + " to " + start_end[task.client_id][task.service_id]["high"];
                }

                if (invoice_list_obj[task.client_id]) {//client already in invoice list

                    invoice_list_obj[task.client_id].tasks.push(task.id);

                    if (task.service_id < 0) {//other task
                        invoice_list_obj[task.client_id].particulars.push({
                            master: task.title + "  on  " + task.created.toISODate(),
                            amount: 0,
                            hsn: "",
                            gst: 0,
                            description: task.created.toISODate()
                        });
                    } else {
                        invoice_list_obj[task.client_id].particulars.push({
                            master: task.service.name + "      " + date_range,
                            amount: 0,
                            hsn: "",
                            gst: 0,
                            description: date_range
                        });
                    }
                } else {
                    const temp = tempInvoiceObject;

                    temp.client_id = task.client_id;
                    temp.tasks.push(task.id);

                    if (task.service_id < 0) {//other task
                        temp.particulars.push({
                            master: task.title + "  on  " + task.created.toISODate(),
                            amount: 0,
                            hsn: task.service.hsn,
                            gst: task.service.gst,
                            description: task.created.toISODate()
                        });
                    } else {
                        temp.particulars.push({
                            master: task.service.name + "      " + date_range,
                            amount: 0,
                            hsn: task.service.hsn,
                            gst: task.service.gst,
                            description: date_range
                        });
                    }

                    invoice_list_obj[task.client_id] = temp;
                }

                task.money = task.money || [];
                task.time = task.time || [];

                task.money.forEach(spent => {
                    invoice_list_obj[task.client_id].particulars.push({
                        master: "Expense",
                        amount: parseFloat(spent.amount) || 0,
                        hsn: task.service.hsn,
                        gst: task.service.gst,
                        description: spent.description
                    });
                });

                task.time.forEach(time => {
                    const [hours, minutes] = time.time.split(":");

                    invoice_list_obj[task.client_id].particulars.push({
                        master: "Time spent",
                        amount: 0,
                        hsn: task.service.hsn,
                        gst: task.service.gst,
                        description: `${time.description} - ${hours} Hours and ${minutes} Minutes Spent`
                    });
                });

            });

            Object.keys(invoice_list_obj).forEach(client_id => {
                invoice_list_obj[client_id].particulars = { "particulars": invoice_list_obj[client_id].particulars };
            });

            await InvoiceDAO.createInvoicesLinkTasks(Object.values(invoice_list_obj));

            //mark tasks billed
            await Task
                .query()
                .whereIn('id', payload.ids)
                .update({ billed: true });

            response.send({
                status: "success"
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
            const payload = request.all();

            await Task
                .query()
                .whereIn('id', payload.id)
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
