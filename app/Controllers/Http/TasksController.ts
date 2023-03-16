import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
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

        const data = await Task.create(payload);

        response.send({
            status: 'success',
            data: data
        });
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

            await ArchivedTask.create(old);
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
                query.select('id','name')
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
        const archiveable = await Task
            .query()
            .whereIn('id',archiveable_ids)

        //add archiveable tasks in archive table
        await ArchivedTask.createMany(archiveable);

        //remove archived tasks from active table
        await Task
            .query()
            .whereIn('id',archiveable_ids)
            .delete()

        //mark remaining tasks billed
        await Task
            .query()
            .whereIn('id',payload.ids)
            .update({billed:true})

        // generate bill
        const tempInvoiceObject = {
            client_id: 0,
            company_id: payload.company_id,
            description: {},
            paid: 0,
            total: 0,
            date: new Date().toJSON().slice(0, 10)
        }

        const invoice_list_obj = {};

        tasks.forEach(task => {
            if(invoice_list_obj[task.client_id]){
                if(task.service_id < 0){//other task
                    invoice_list_obj[task.client_id].description[task.title] = 0
                }else{
                    invoice_list_obj[task.client_id].description[task.service.name] = 0
                }
            }else{
                const temp = tempInvoiceObject;

                temp.client_id = task.client_id;
                
                if(task.service_id < 0){//other task
                    temp.description[task.title] = 0
                }else{
                    temp.description[task.service.name] = 0
                }

                invoice_list_obj[task.client_id] = temp;
            }
        });

        await Invoice.createMany(Object.values(invoice_list_obj));

        response.send({
            status:"success",
            archived: archiveable_ids
        })
    }

    public async destroy({request,response}: HttpContextContract){
        const payload = request.all();

        await Task
            .query()
            .whereIn('id',payload.id)
            .delete()

        response.send({
            status: 'success'
        })
    }
}
