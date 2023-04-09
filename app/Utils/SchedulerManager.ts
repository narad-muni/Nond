import Company from 'App/Models/Company';
import DynamicRegister from 'App/Models/DynamicRegister';
import RegisterMaster from 'App/Models/RegisterMaster';
import Scheduler from 'App/Models/Scheduler';
import Service from 'App/Models/Service';
import Task from 'App/Models/Task';
import TaskTemplate from 'App/Models/TaskTemplate';
import { string } from '@ioc:Adonis/Core/Helpers';
import Database from '@ioc:Adonis/Lucid/Database';
import StringUtils from './StringUtils';
import Invoice from 'App/Models/Invoice';
import ArchivedTask from 'App/Models/ArchivedTask';
import ArchivedInvoice from 'App/Models/ArchivedInvoice';

export default class SchedulerManager{
    
    static async RunSchedulers(){

        /**
         * Priorities
         * 1. Rotate Registers
         * 2. Delete Tasks
         * 3. Arhive Tasks/Invoices
         * 4. Every Financial Year
         * 5. Create Tasks & Add Entryies
         * 6. update scheduler dates
         */
        
        try{
            const {default: Scheduler} = await import('App/Models/Scheduler');

            const currentDate = new Date().toISOString().slice(0, 10);

            const scheduled_jobs = await Scheduler
                .query()
                .where('next','<=',currentDate);

            const rotate_registers: Scheduler[] = [];
            const add_entries_create_tasks: Scheduler[] = [];

            scheduled_jobs.forEach(job => {
                switch(job.type){
                    case 1:// Rotate Registers
                        rotate_registers.push(job);
                        break;
                    case 2:// Delete old Data
                        SchedulerManager.DeleteData();
                        break;
                    case 3:// Archive old Data
                        SchedulerManager.ArchiveData();
                        break;
                    case 4:// every_financial_year
                        SchedulerManager.everyFinancialYear();
                        break;
                    case 5:// Create Tasks & Add Entries in Register
                        add_entries_create_tasks.push(job);
                        break;
                }
            });

            //6
            //update the next date
            await Database.rawQuery('update schedulers set "next" = "next" + cast(schedulers.frequency as interval) where "next" <= current_date');

            //if for multiple days task is not created, then set next date = tommorow
            await Database.rawQuery('update schedulers set "next" = current_date + interval \'1 day\' where "next" <= current_date');

            //updating before this gives us next date calculated by sql
            SchedulerManager.RotateRegisters(rotate_registers);
            SchedulerManager.AddEntriesCreateTasks(add_entries_create_tasks);
            
        }catch{};
    }

    static async RotateRegisters(jobs: Scheduler[]) {
        //copy new register
        //archive old register
    }

    static async DeleteData() {
        //delete 2 year old invoices

        await ArchivedInvoice
            .query()
            .where('date','<',StringUtils.getPreviousFinancialYearStart())
            .delete();

        //delete 2 year old tasks
        await ArchivedTask
            .query()
            .where('created','<',StringUtils.getPreviousFinancialYearStart())
            .delete();
    }

    static async everyFinancialYear(){
        //reset invoice numbers
        await Company
            .query()
            .update({'invoice_counter': 0});
    }

    static async ArchiveData() {
        //archive 1 year old invoices
        //archive 1 year old tasks

        const archived_tasks: ArchivedTask[] = [];
        const archived_invoices: ArchivedInvoice[] = [];

        //get all completed tasks older than current financial year
        const old_tasks = await Task
            .query()
            .where('created','<',StringUtils.getCurrentFinancialYearStart())
            .where('status',4)
            .where('billed', true)
            .preload('assigned_user', query => {
                query.select('username');
            })
            .preload('service', query => {
                query.select('name');
            })
            .preload('client', query => {
                query
                    .select('name','group_id')
                    .preload('group', query2 => {
                        query2.select('name');
                    });
            });

        //get all paid invoices older than current financial year
        const old_invoices = await Invoice
            .query()
            .where('date','<',StringUtils.getCurrentFinancialYearStart())
            .where('paid', true)
            .preload('client', query => {
                query
                    .select('name','group_id')
                    .preload('group', query2 => {
                        query2.select('name');
                    });
            })
            .preload('company', query => {
                query.select('name')
            });

        //add to archive array

        old_tasks.forEach(task => {
            const archived_task = new ArchivedTask();

            archived_task.id = task.id;
            archived_task.assigned_to = task.assigned_user.username;
            archived_task.title = task.title;
            archived_task.description = task.description;
            archived_task.service = task.service.name;
            archived_task.created = task.created;
            archived_task.client = task.client.name;
            archived_task.group = task.client.group.name;

            archived_tasks.push(archived_task);

        });

        old_invoices.forEach(invoice => {
            const archived_invoice = new ArchivedInvoice();

            archived_invoice.id = invoice.id;
            archived_invoice.particulars = invoice.particulars;
            archived_invoice.remarks = invoice.remarks;
            archived_invoice.gst = invoice.gst;
            archived_invoice.total = invoice.total;
            archived_invoice.tax = invoice.tax;
            archived_invoice.date = invoice.date;
            archived_invoice.client = invoice.client.name;
            archived_invoice.group = invoice.client.group.name;
            archived_invoice.company = invoice.company.name;

            archived_invoices.push(archived_invoice);

        });

        //bulk insert array data to archive table
        await ArchivedTask.createMany(archived_tasks);
        await ArchivedInvoice.createMany(archived_invoices);

        //remove tasks from active table
        await Task
            .query()
            .where('created','<',StringUtils.getCurrentFinancialYearStart())
            .where('status',4)
            .delete();

        //remove invoices from active table
        await Invoice
            .query()
            .where('date','<',StringUtils.getCurrentFinancialYearStart())
            .where('paid', true)
            .delete();
    }

    static async AddEntriesCreateTasks(jobs: Scheduler[]) {

        //get services
        const service_ids = jobs.map(job => job.service_id);

        const services = await Service
            .query()
            .select('id','template_id')
            .whereIn('id',service_ids);

        //get templates
        const template_ids = services.map(e => e.template_id);
        
        const templates = await TaskTemplate
            .query()
            .whereIn('id',template_ids);

        //registers
        const registers = await RegisterMaster
            .query()
            .select('id','name','version', 'service_id')
            .whereIn('service_id', service_ids);

        //tasks array
        const tasks: Task[] = [];
        const RegisterEntries: object = {};

        registers.forEach(register => {
            RegisterEntries[string.escapeHTML("register__" + register?.name + register?.version)] = [];
        });

        jobs.forEach(job => {
            const service = services.find(e => e.id == job.service_id);

            const template = templates.find(e => e.id == service?.template_id);

            const data_registers = registers.filter(e => e.service_id == service?.id);

            //add tasks to array
            const task = new Task();

            task.title = template?.title || "";
            task.client_id = job.client_id;
            task.description = template?.description || "";
            task.status = template?.status || 0;
            task.priority = template?.priority || 0;
            task.service_id = service?.id || -1;
            task.billed = false;

            tasks.push(task);

            //add entries to register array
            data_registers.forEach(register => {

                const register_table_name = string.escapeHTML("register__" + register?.name + register?.version);

                const data = {
                    client_id: job.client_id
                };
                
                RegisterEntries[register_table_name].push(data);
            });

        });

        await Task.createMany(tasks);

        //foreach doesn't work
        //insert data into registers
        for await(const table_name of Object.keys(RegisterEntries)){
            DynamicRegister.table = table_name;
            await DynamicRegister.createMany(RegisterEntries[table_name]);
        }
    }

}

//test for entries in multiple registers, works in single register