import Company from 'App/Models/Company';
import DynamicRegister from 'App/Models/DynamicRegister';
import RegisterMaster from 'App/Models/RegisterMaster';
import Scheduler from 'App/Models/Scheduler';
import Service from 'App/Models/Service';
import Task from 'App/Models/Task';
import TaskTemplate from 'App/Models/TaskTemplate';
import { string } from '@ioc:Adonis/Core/Helpers';

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
            const delete_data: Scheduler[] = [];
            const archive_data: Scheduler[] = [];
            const add_entries_create_tasks: Scheduler[] = [];
            const every_financial_year: Scheduler[] = [];

            scheduled_jobs.forEach(job => {
                switch(job.type){
                    case 1:// Rotate Registers
                        rotate_registers.push(job);
                        break;
                    case 2:// Delete old Data
                        delete_data.push(job);
                        break;
                    case 3:// Archive old Data
                        archive_data.push(job);
                        break;
                    case 4:// every_financial_year
                        every_financial_year.push(job);
                        // SchedulerManager.AddEntries();
                        break;
                    case 5:// Create Tasks & Add Entries in Register
                        add_entries_create_tasks.push(job);
                        break;
                }
            });

            // 6
            // //update the next date
            // await Database.rawQuery('update schedulers set "next" = "next" + cast(schedulers.frequency as interval) where "next" <= current_date');

            // //if for multiple days task is not created, then set next date = tommorow
            // await Database.rawQuery('update schedulers set "next" = current_date + interval \'1 day\' where "next" <= current_date');

            //updating before this gives us next date calculated by sql
            SchedulerManager.everyFinancialYear(every_financial_year);
            SchedulerManager.RotateRegisters(rotate_registers);
            SchedulerManager.ArchiveData(archive_data);
            SchedulerManager.DeleteData(delete_data);
            SchedulerManager.AddEntriesCreateTasks(add_entries_create_tasks);
            
        }catch{};
    }

    static async RotateRegisters(jobs: Scheduler[]) {
        //copy new register
        //archive old register
    }

    static async DeleteData(jobs: Scheduler[]) {
        //delete 2 year old invoices
        //delete 2 year old tasks
    }

    static async everyFinancialYear(jobs: Scheduler[]){
        //reset invoice numbers
        await Company
            .query()
            .update({'invoice_counter': 0});
    }

    static async ArchiveData(jobs: Scheduler[]) {
        //archive 1 year old invoices
        //archive 1 year old tasks
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