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
import RegisterTemplate from 'App/Models/RegisterTemplate';
import { column } from '@ioc:Adonis/Lucid/Orm';
import ArchivedRegisterTemplate from 'App/Models/ArchivedRegisterTemplate';

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

        const register_ids = jobs.map(e => e.register_id);

        const old_registers = await RegisterMaster
                .query()
                .whereIn('id', register_ids);

        const schedulers = await Scheduler
            .query()
            .whereIn('register_id',register_ids);

        const register_templates = await RegisterTemplate
            .query()
            .whereIn('table_id',register_ids);
        
        for await (const job of jobs){

            const old_register = old_registers.find(e => e.id == job.register_id);
            const scheduler = schedulers.find(e => e.register_id == old_register?.id);
            const register_template = register_templates.filter(e => e.table_id == old_register?.id);

            let client_columns = "";
            let update_query_columns = "";
            const serialized_columns: any = {table_id: old_register?.id, columns: []};

            if(job.data?.["rotation_strategy"] == "archive"){ // archive old register

                //create new table
                const new_reigster = await RegisterMaster
                    .create({
                        name: old_register?.name,
                        version: old_register?.version+1,
                        service_id: old_register?.service_id,
                        active: true
                    });
                
                //create new table with same structure
                await Database
                    .rawQuery(
                        "create table ?? as select * from ?? rtt with no data",
                        [
                            string.escapeHTML("register__"+old_register?.name+old_register?.version+1),
                            string.escapeHTML("register__"+old_register?.name+old_register?.version)
                        ]
                    )

                // remap scheduler to new register
                await Scheduler
                    .query()
                    .update({"register_id": new_reigster.id})
                    .where("id", scheduler.id);

                // create archived register tempalte
                register_template.forEach(column => {
        
                    if(column.client_column_id != null){
                        client_columns += "add column client__"+column.column_name+" varchar;\n";
                        update_query_columns += "client__"+column.column_name+" = s."+column.column_name+",";
                    }
        
                    serialized_columns
                        .columns
                        .push(column);
                });

                //convert array to object for storing in db
                serialized_columns.columns = {data:serialized_columns.columns};

                //add to db
                await ArchivedRegisterTemplate.create(serialized_columns);

                // remap existing register tempalte
                await RegisterTemplate
                    .query()
                    .update('table_id', new_reigster.id)
                    .where('id', old_register.id);

                // mark old register as inactive
                await RegisterMaster
                    .query()
                    .update({"active": false})
                    .where("id", old_register.id);

            }else{ // delete old register
                //truncate old table
                await Database.rawQuery(
                    "truncate table ??",
                    [string.escapeHTML("register__"+old_register?.name+old_register?.version)]
                );

                const old_version = old_register?.version;

                //create new table
                old_register.version += 1;

                //rename old table
                await Database.rawQuery(
                    "alter table ?? rename to ??",
                    [string.escapeHTML("register__"+old_register?.name+old_version)
                    ,string.escapeHTML("register__"+old_register?.name+old_register?.version)]
                );

                //update entry in register master
                await RegisterMaster
                    .query()
                    .update({"version": old_register?.version})
                    .where('id', old_register.id);

            }

            //create new register master
            //create table
            //update scheduler to point to new register
            //update register template to point to new register
            
            //copy register template to archive table
            //archive old register

        }
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
            .whereIn('service_id', service_ids)
            .where('active', true);

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