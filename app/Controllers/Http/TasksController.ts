import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database';
import ArchivedTask from 'App/Models/ArchivedTask';
import Invoice from 'App/Models/Invoice';
import Task from 'App/Models/Task'

export default class TasksController {
    public async index({request,response,session}: HttpContextContract){

        const billed = request.param("billed",1);
        const status = request.param("status",1);
        const self = request.param("self","true");

        let data:any = Task
            .query()
            .preload('service', (query) => {
                query.select('name')
            })
            .preload('client', (query) => {
                query
                    .select('name','group_id')
                    .preload('group', (query) => {
                        query.select('id','name')
                    })
            })
            .preload('assigned_user', (query) => {
                query.select('username')
            })

        //task billed status
        if(billed == 0){
            data = data
                .whereNot('billed',true)
        }else if(billed == 2){
            data = data
                .where('billed',true)
        }

        //task status
        if(status == 0){
            data = data
                .whereNot('status',4)
        }else if(status == 2){
            data = data
                .where('status',4)
        }

        if(self == "true"){
            const user_id = session.get('user').id;

            data = data
                .where('assigned_to',user_id);
        }

        response.send({
            status: 'success',
            data: await data
        });
    }

    public async get({request,response}: HttpContextContract){
        const payload = request.params()
        const data = await Task
            .query()
            .where('id',payload.id)
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

    public async create({request,response}: HttpContextContract){
        const payload = request.all();

        if(Array.isArray(payload.client_id)){//if array of client id is passed
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

        }else{//if single client id is passed
            const data = await Task.create(payload);

            response.send({
                status: 'success',
                data: data
            });
        }
    }

    public async update({request,response}: HttpContextContract){
        const payload = request.all();

        delete payload.client;
        delete payload.assigned_user;
        delete payload.service;
        let archived = false;

        const old = await Task
        .query()
        .where('id',payload.id)
        .first();

        if(payload.status == 4 && old?.billed){
            await Task
                .query()
                .where('id',payload.id)
                .delete()

            archived = true;

            await ArchivedTask.create(old.serialize());
        }else{
            await Task
            .query()
            .where('id',payload.id)
            .update(payload)
        }

        response.send({
            status: 'success',
            data: payload,
            archived: archived
        });
    }

    //once billed, archive completed task, keep task for last 2 years
    public async bill({request,response}: HttpContextContract){
        const payload = request.all();
        const to_arhive: Task[] = [];
        const tasks = await Task
            .query()
            .preload('service',(query) => {
                query.select('id','name','hsn','gst')
            })
            .whereIn('id',payload.ids)

        //filter out arhciveable
        tasks.forEach(task => {
            if(task.status == 4){
                to_arhive.push(task);
            }
        });

        const archiveable_ids = to_arhive.map(e => e.id);

        //fetch archivaeble tasks
        const archiveable : Task[] | object[] = await Task
            .query()
            .whereIn('id',archiveable_ids);

        archiveable.forEach((task,index) => {
            archiveable[index] = task.serialize();
        });

        //add archiveable tasks in archive table 
        await ArchivedTask.createMany(archiveable);

        //remove archived tasks from active table
        await Task
            .query()
            .whereIn('id',archiveable_ids)
            .delete();

        //mark remaining tasks billed
        await Task
            .query()
            .whereIn('id',payload.ids)
            .update({billed:true});

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
            if(task.service_id >= 0){
                if(high_low[task.client_id]){//exisiting entry

                    if(high_low[task.client_id][task.service_id]){//existing entry

                        //update previous dates
                        if(high_low[task.client_id][task.service_id]['high'] < task.created.toISODate()){
                            high_low[task.client_id][task.service_id]['high'] = task.created.toISODate();
                        }else if(high_low[task.client_id][task.service_id]['low'] > task.created.toISODate()){
                            high_low[task.client_id][task.service_id]['low'] = task.created.toISODate();
                        }

                    }else{
                        high_low[task.client_id][task.service_id] = {//new entry
                            high: task.created.toISODate(),
                            low: task.created.toISODate(),
                        }
                    }

                }else{//new entry
                    high_low[task.client_id] = {}
                    high_low[task.client_id][task.service_id] = {high: task.created.toISODate(),low: task.created.toISODate(),}
                }
            }
        });

        //add task in particulars with price
        tasks.forEach(task => {
            const date_range = high_low[task.client_id][task.service_id]["low"] + " to " + high_low[task.client_id][task.service_id]["high"];

            if(invoice_list_obj[task.client_id]){//client already in invoice list

                if(task.service_id < 0){//other task
                    invoice_list_obj[task.client_id].particulars[task.title + "  on  " + task.created.toISODate()] = {price:0,hsn:"",gst:0,description:task.created.toISODate()};
                }else{
                    invoice_list_obj[task.client_id].particulars[task.service.name + "      " + date_range] = {price:0,hsn:task.service.hsn,gst:task.service.gst,description:date_range};
                }
            }else{
                const temp = tempInvoiceObject;

                temp.client_id = task.client_id;
                
                if(task.service_id < 0){//other task
                    temp.particulars[task.title + "  on  " + task.created.toISODate()] = {price:0,hsn:"",gst:0,description:task.created.toISODate()};
                }else{
                    temp.particulars[task.service.name + "      " + date_range] = {price:0,hsn:task.service.hsn,gst:task.service.gst,description:date_range};
                }

                invoice_list_obj[task.client_id] = temp;
            }
        });

        await Invoice.createMany(Object.values(invoice_list_obj));

        response.send({
            status:"success",
            archived: archiveable_ids
        });
    }

    public async destroy({request,response}: HttpContextContract){
        const payload = request.all();

        await Task
            .query()
            .whereIn('id',payload.id)
            .delete();

        response.send({
            status: 'success'
        });
    }
}
