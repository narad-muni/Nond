export default class SchedulerManager{
    
    static async RunSchedulers(){

        /**
         * Priorities
         * 1. Rotate Registers
         * 2. Delete Tasks
         * 3. Arhive Tasks/Invoices
         * 4. ??
         * 5. Create Tasks & Add Entryies
         * 6. update scheduler dates
         */
        
        try{
            const {default: Scheduler} = await import('App/Models/Scheduler');
            const {default: Database} = await import('@ioc:Adonis/Lucid/Database');

            const currentDate = new Date().toISOString().slice(0, 10);

            const scheduled_jobs = await Scheduler
                .query()
                .where('next','<=',currentDate);

            const rotate_registers = [];
            const delete_data = [];
            const archive_data = [];
            const add_entries_create_tasks = [];

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
                    case 4:// ??
                        // SchedulerManager.AddEntries();
                        break;
                    case 5:// Create Tasks & Add Entries in Register
                        add_entries_create_tasks.push(job);
                        break;
                }
            });

            // 6
            //update the next date
            await Database.rawQuery('update schedulers set "next" = "next" + cast(schedulers.frequency as interval) where "next" <= current_date');

            //if for multiple days task is not created, then set next date = tommorow
            await Database.rawQuery('update schedulers set "next" = current_date + interval \'1 day\' where "next" <= current_date');

            //updating before this gives us next date calculated by sql
            SchedulerManager.RotateRegisters(rotate_registers);
            SchedulerManager.ArchiveData(archive_data);
            SchedulerManager.DeleteData(delete_data);
            SchedulerManager.AddEntriesCreateTasks(add_entries_create_tasks);
            
        }catch{};
    }

    static async RotateRegisters(jobs) {
        
    }

    static async DeleteData(jobs) {
        
    }

    static async ArchiveData(jobs) {
        
    }

    static async AddEntriesCreateTasks(jobs) {
        
    }

}