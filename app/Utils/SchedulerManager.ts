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
import ArchivedRegisterTemplate from 'App/Models/ArchivedRegisterTemplate';
import { DateTime } from 'luxon';

export default class SchedulerManager {

    static async RunSchedulers() {

        /**
         * Priorities
         * 1. update scheduler dates
         * 2. Rotate Registers
         * 3. Delete Tasks
         * 4. Arhive Tasks/Invoices
         * 5. Every Financial Year
         * 6. Create Tasks & Add Entryies
         */

        try {
            const { default: Scheduler } = await import('App/Models/Scheduler');

            const currentDate = new Date().toISOString().slice(0, 10);

            const scheduled_jobs = await Scheduler
                .query()
                .where('next', '<=', currentDate)
                .orderBy('type', 'asc');

            const rotate_registers: Scheduler[] = [];
            const add_entries: Scheduler[] = [];
            const create_tasks: Scheduler[] = [];
            let delete_data = false;
            let archive_data = false;
            let every_financial_year = false;

            scheduled_jobs.forEach(job => {
                switch (job.type) {
                    case 1:// Rotate Registers
                        rotate_registers.push(job);
                        break;
                    case 2:// Delete old Data
                        delete_data = true;
                        break;
                    case 3:// Archive old Data
                        archive_data = true;
                        break;
                    case 4:// every_financial_year
                        every_financial_year = true;
                        break;
                    case 5:// Create Tasks & Add Entries in Register
                        add_entries.push(job);
                        create_tasks.push(job);
                        break;
                }
            });

            // 1
            //update the next date
            await Database.rawQuery('update schedulers set "next" = "next" + cast(schedulers.frequency as interval) where "next" <= current_date');

            //if for multiple days task is not created, then set next date = tommorow
            await Database.rawQuery('update schedulers set "next" = current_date + interval \'1 day\' where "next" <= current_date');

            //updating schedulers before this gives us next date calculated by sql
            // 2
            SchedulerManager.RotateRegisters(rotate_registers);

            // 3
            if (delete_data) {
                SchedulerManager.DeleteData();
            }

            // 4
            if (archive_data) {
                SchedulerManager.ArchiveData();
            }

            // 5
            if (every_financial_year) {
                SchedulerManager.DeleteData();
                SchedulerManager.ArchiveData();
                SchedulerManager.everyFinancialYear();
            }

            // 6
            SchedulerManager.AddEntries(add_entries);
            SchedulerManager.CreateTasks(create_tasks);

        } catch { };
    }

    static async RotateRegisters(jobs: Scheduler[]) {

        const register_ids = jobs.map(e => e.register_id);

        const old_registers = await RegisterMaster
            .query()
            .whereIn('id', register_ids);

        const schedulers = await Scheduler
            .query()
            .whereIn('register_id', register_ids);

        const register_templates = await RegisterTemplate
            .query()
            .whereIn('table_id', register_ids);

        for await (const job of jobs) {

            const old_register = old_registers.find(e => e.id == job.register_id) || new RegisterMaster();
            const scheduler = schedulers.find(e => e.register_id == old_register.id) || new Scheduler();
            const register_template = register_templates.filter(e => e.table_id == old_register.id);
            const rollover_register_template = register_templates.filter(e => e.table_id == old_register.id && e.rollover);
            const rollover_register_columns = rollover_register_template.map(e => e.column_name);

            let client_columns = "";
            let update_query_columns = "";
            const serialized_columns: any = { table_id: old_register.id, columns: [] };

            const random = Math.random().toString(36).substr(2, 8);
            const today = DateTime.now().toLocaleString(DateTime.DATE_MED);
            const next = scheduler.next.toLocaleString(DateTime.DATE_MED);
            //added random to avoid collision
            const new_version = `${random} ${today} - ${next}`

            //truncate old rollover table
            await Database.rawQuery(
                "truncate table ?? restart identity",
                [string.escapeHTML("rollover__register__" + old_register.name + old_register.version)]
            );

            //rename old rollover table
            await Database.rawQuery(
                "alter table ?? rename to ??",
                [
                    string.escapeHTML("rollover__register__" + old_register.name + old_register.version),
                    string.escapeHTML("rollover__register__" + old_register.name + new_version)
                ]
            );

            const select_rollover_column = rollover_register_columns.length ? ", " + rollover_register_columns.toString() : "";

            //add data in new rollover table
            await Database.rawQuery(
                `insert into ??(id, client_id ${string.escapeHTML(select_rollover_column)})
                select id, client_id ${string.escapeHTML(select_rollover_column)} from ??`,
                [
                    string.escapeHTML("rollover__register__" + old_register.name + new_version),
                    string.escapeHTML("register__" + old_register.name + old_register.version)
                ]
            )

            if (job.data?.["rotation_strategy"] == "archive") { // archive old register

                //create new table
                const new_reigster = await RegisterMaster
                    .create({
                        name: old_register.name,
                        version: new_version,
                        service_id: old_register.service_id,
                        active: true
                    });

                //create new table with same structure
                await Database
                    .rawQuery(
                        `create table ?? (like ?? including all);`,
                        [
                            string.escapeHTML("register__" + old_register.name + new_version),
                            string.escapeHTML("register__" + old_register.name + old_register.version)
                        ]
                    );

                // remap scheduler to new register
                await Scheduler
                    .query()
                    .update({ "register_id": new_reigster.id })
                    .where("id", scheduler.id);

                // create archived register tempalte
                register_template.forEach(column => {

                    if (column.client_column_id != null) {
                        client_columns += "add column client__" + column.column_name + " varchar,";
                        update_query_columns += "client__" + column.column_name + " = s." + column.column_name + ",";
                    }

                    serialized_columns
                        .columns
                        .push(column);
                });

                //convert array to object for storing in db
                serialized_columns.columns = { data: serialized_columns.columns };

                //add to db
                await ArchivedRegisterTemplate.create(serialized_columns);

                // remap existing register tempalte
                await RegisterTemplate
                    .query()
                    .update({ 'table_id': new_reigster.id })
                    .where('table_id', old_register.id);

                // mark old register as inactive
                await RegisterMaster
                    .query()
                    .update({ "active": false })
                    .where("id", old_register.id);

                //check if there are any client linked columns
                if (update_query_columns?.length && client_columns?.length) {

                    update_query_columns = update_query_columns.slice(0, -1);
                    client_columns = client_columns.slice(0, -1);

                    //add client link columns to register
                    await Database.rawQuery(`alter table  "register__${string.escapeHTML(old_register.name + old_register.version)}" ${client_columns}`);

                    //add data to old register
                    await Database.rawQuery(`
                        update "register__${string.escapeHTML(old_register.name + old_register.version)}"
                        set ${update_query_columns}
                        from clients s
                        where s.id = client_id
                    `);
                }

            } else { // delete old register

                //truncate old table
                await Database.rawQuery(
                    "truncate table ?? restart identity",
                    [string.escapeHTML("register__" + old_register.name + old_register.version)]
                );

                //rename old table
                await Database.rawQuery(
                    "alter table ?? rename to ??",
                    [string.escapeHTML("register__" + old_register.name + old_register.version)
                        , string.escapeHTML("register__" + old_register.name + new_version)]
                );

                //update entry in register master
                await RegisterMaster
                    .query()
                    .update({ "version": new_version })
                    .where('id', old_register.id);

            }

        }
    }

    static async DeleteData() {
        //delete 2 year old invoices

        await ArchivedInvoice
            .query()
            .where('date', '<', StringUtils.getPreviousFinancialYearStart())
            .delete();

        //delete 2 year old tasks
        await ArchivedTask
            .query()
            .where('created', '<', StringUtils.getPreviousFinancialYearStart())
            .delete();
    }

    static async everyFinancialYear() {
        //reset invoice numbers
        await Company
            .query()
            .update({ 'invoice_counter': 0 });
    }

    static async ArchiveData() {
        //archive 1 year old invoices
        //archive 1 year old tasks

        const archived_tasks: ArchivedTask[] = [];
        const archived_invoices: ArchivedInvoice[] = [];

        //get all completed tasks older than current financial year
        const old_tasks = await Task
            .query()
            .where('created', '<', StringUtils.getCurrentFinancialYearStart())
            .where('status', 4)
            .where('billed', true)
            .preload('assigned_user', query => {
                query.select('username');
            })
            .preload('service', query => {
                query.select('name');
            })
            .preload('client', query => {
                query
                    .select('name', 'group_id')
                    .preload('group', query2 => {
                        query2.select('name');
                    });
            });

        //get all paid invoices older than current financial year
        const old_invoices = await Invoice
            .query()
            .where('date', '<', StringUtils.getCurrentFinancialYearStart())
            .where('paid', true)
            .preload('client', query => {
                query
                    .select('name', 'group_id')
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
            .where('created', '<', StringUtils.getCurrentFinancialYearStart())
            .where('status', 4)
            .delete();

        //remove invoices from active table
        await Invoice
            .query()
            .where('date', '<', StringUtils.getCurrentFinancialYearStart())
            .where('paid', true)
            .delete();
    }

    static async AddEntries(jobs: Scheduler[]) {
        const RegisterEntries: object = {};

        //get services
        const service_ids = jobs.map(job => job.service_id);

        const services = await Service
            .query()
            .select('id', 'template_id')
            .whereIn('id', service_ids);

        //registers
        const registers = await RegisterMaster
            .query()
            .select('id', 'name', 'version', 'service_id')
            .whereIn('service_id', service_ids)
            .where('active', true);

        const register_ids = registers.map(e => e.id);

        let rollover_columns = await RegisterTemplate
            .query()
            .select('id', 'column_name', 'table_id', 'rollover')
            .whereIn('table_id', register_ids);

        const rollover_columns_map = {};

        rollover_columns.forEach(r_column => {
            if(!(r_column.table_id in rollover_columns_map)){
                rollover_columns_map[r_column.table_id] = [];
            }

            rollover_columns_map[r_column.table_id].push(r_column);

        });

        registers.forEach(register => {
            RegisterEntries[string.escapeHTML("register__" + register?.name + register?.version)] = [];
        });

        for(const job of jobs){
            const service = services.find(e => e.id == job.service_id);

            const data_registers = registers.filter(e => e.service_id == service?.id);

            //add entries to register array
            for(const register of data_registers) {

                const register_table_name = string.escapeHTML("register__" + register?.name + register?.version);
                const rollover_register_table_name = "rollover__" + register_table_name;

                DynamicRegister.table = rollover_register_table_name;

                rollover_columns_map[register.id].forEach(col => {

                    if(col.column_name != "client_id"){
                        DynamicRegister.$addColumn(col.column_name, {});
                    }
                });

                let rollover_data = await DynamicRegister
                    .query()
                    .where("client_id", job.client_id)
                    .orderBy("id");

                DynamicRegister.table = register_table_name;

                let prev_data = await DynamicRegister
                    .query()
                    .count('client_id as total')
                    .where("client_id", job.client_id)
                    .groupBy("client_id")
                    .first();

                const curr_count = prev_data?.["$extras"]?.total || 0;

                for(let i = 0; i < job.count; i++){

                    const rollover_add = {};

                    for(let j = 0; j < rollover_columns_map[register.id.toString()]?.length; j++){

                        const column = rollover_columns_map[register.id.toString()][j];

                        let data = null;

                        if(curr_count < rollover_data.length ){
                            data = rollover_data[i + curr_count]?.[column.column_name];

                            if(!data){
                                data = rollover_data[curr_count]?.[column.column_name];
                            }

                        }else{
                            data = rollover_data[i]?.[column.column_name];

                            if(!data){
                                data = rollover_data[0]?.[column.column_name];
                            }
                        }

                        rollover_add[column.column_name] = data;
                    }
                    
                    let data = {
                        client_id: job.client_id,
                    };

                    data = Object.assign({}, data, rollover_add);

                    RegisterEntries[register_table_name].push(data);
                }
            };

        };

        //foreach doesn't work
        //insert data into registers
        for await (const table_name of Object.keys(RegisterEntries)) {
            DynamicRegister.table = table_name;

            if(RegisterEntries[table_name].length == 0){
                continue;
            }

            const column_data = RegisterEntries[table_name][0];


            Object.keys(column_data).forEach(col => {

                if(col != "client_id"){
                    DynamicRegister.$addColumn(col, {});
                }
            });


            await DynamicRegister.createMany(RegisterEntries[table_name]);
        }
    }

    static async CreateTasks(jobs: Scheduler[]) {

        //get services
        const service_ids = jobs.map(job => job.service_id);

        const services = await Service
            .query()
            .select('id', 'template_id')
            .whereIn('id', service_ids);

        //get templates
        const template_ids = services.map(e => e.template_id);

        const templates = await TaskTemplate
            .query()
            .whereIn('id', template_ids);

        const tasks: Task[] = [];

        jobs.forEach(job => {

            const service = services.find(e => e.id == job.service_id);

            const template = templates.find(e => e.id == service?.template_id);

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

        });

        await Task.createMany(tasks);
    }

}

//test for entries in multiple registers, works in single register
