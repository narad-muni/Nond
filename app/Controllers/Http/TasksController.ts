import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
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

    //once billed, archive completed task, keep task for last 2 years
    public async bill({ request, response }: HttpContextContract) {
        try {
            const payload = request.all();
            const to_arhive: Task[] = [];
            const tasks = await Task
                .query()
                .preload('service', (query) => {
                    query.select('id', 'name', 'hsn', 'gst')
                })
                .whereIn('id', payload.ids);

            //filter out arhciveable
            tasks.forEach(task => {
                if (task.status == 4) {
                    to_arhive.push(task);
                }
            });

            //mark remaining tasks billed
            await Task
                .query()
                .whereIn('id', payload.ids)
                .update({ billed: true });

            // generate bill
            const tempInvoiceObject = {
                client_id: 0,
                company_id: payload.company_id,
                particulars: {},
                paid: null,
                total: null,
                remarks: '',
                gst: payload.gst,
                date: new Date().toJSON().slice(0, 10)
            }

            const invoice_list_obj = {};
            const high_low = {};

            //get high low date range for client tasks based on services
            tasks.forEach(task => {
                if (task.service_id >= 0) {
                    if (high_low[task.client_id]) {//exisiting entry

                        if (high_low[task.client_id][task.service_id]) {//existing entry

                            //update previous dates
                            if (high_low[task.client_id][task.service_id]['high'] < task.created.toISODate()) {
                                high_low[task.client_id][task.service_id]['high'] = task.created.toISODate();
                            } else if (high_low[task.client_id][task.service_id]['low'] > task.created.toISODate()) {
                                high_low[task.client_id][task.service_id]['low'] = task.created.toISODate();
                            }

                        } else {
                            high_low[task.client_id][task.service_id] = {//new entry
                                high: task.created.toISODate(),
                                low: task.created.toISODate(),
                            }
                        }

                    } else {//new entry
                        high_low[task.client_id] = {}
                        high_low[task.client_id][task.service_id] = { high: task.created.toISODate(), low: task.created.toISODate(), }
                    }
                }
            });

            //add task in particulars with price
            tasks.forEach(task => {
                let date_range;

                if (task.service_id >= 0) {
                    date_range = high_low[task.client_id][task.service_id]["low"] + " to " + high_low[task.client_id][task.service_id]["high"];
                }

                if (invoice_list_obj[task.client_id]) {//client already in invoice list

                    if (task.service_id < 0) {//other task
                        invoice_list_obj[task.client_id].particulars[task.title + "  on  " + task.created.toISODate()] = { amount: 0, hsn: "", gst: 0, description: task.created.toISODate() };
                    } else {
                        invoice_list_obj[task.client_id].particulars[task.service.name + "      " + date_range] = { amount: 0, hsn: task.service.hsn, gst: task.service.gst, description: date_range };
                    }
                } else {
                    const temp = tempInvoiceObject;

                    temp.client_id = task.client_id;

                    if (task.service_id < 0) {//other task
                        temp.particulars[task.title + "  on  " + task.created.toISODate()] = { amount: 0, hsn: "", gst: 0, description: task.created.toISODate() };
                    } else {
                        temp.particulars[task.service.name + "      " + date_range] = { amount: 0, hsn: task.service.hsn, gst: task.service.gst, description: date_range };
                    }

                    invoice_list_obj[task.client_id] = temp;
                }
            });

            Object.keys(invoice_list_obj).forEach(client_id => {
                const temp_particular_list = [];
                Object.keys(invoice_list_obj[client_id].particulars).forEach(particular => {
                    const temp_particular = {};

                    temp_particular["master"] = particular;
                    temp_particular["amount"] = invoice_list_obj[client_id].particulars[particular].amount;
                    temp_particular["description"] = invoice_list_obj[client_id].particulars[particular].description;

                    if (invoice_list_obj[client_id].gst) {
                        temp_particular["hsn"] = invoice_list_obj[client_id].particulars[particular].hsn;
                        temp_particular["gst"] = invoice_list_obj[client_id].particulars[particular].gst;
                    }

                    temp_particular_list.push(temp_particular);
                });
                invoice_list_obj[client_id].particulars = { "particulars": temp_particular_list };
            });

            await Invoice.createMany(Object.values(invoice_list_obj));

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
