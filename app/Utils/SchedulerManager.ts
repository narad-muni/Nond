export default class SchedulerManager{
    
    static async RunSchedulers(){

        /**
         * Priorities
         * 1. Rotate Registers
         * 2. Delete Tasks
         * 3. Arhive Tasks/Invoices
         * 4. Add Entries in Register
         * 5. Create Tasks
         * 6. update scheduler dates
         */
        
        try{
            const {default: Scheduler} = await import('App/Models/Scheduler');
            const {default: Database} = await import('@ioc:Adonis/Lucid/Database');

            const currentDate = new Date().toISOString().slice(0, 10);

            const scheduled_jobs = await Scheduler
                .query()
                .where('next','<=',currentDate);

            scheduled_jobs.forEach(job => {
                switch(job.type){
                    case 1:// Rotate Registers
                        SchedulerManager.RotateRegisters();                    
                        break;
                    case 2:// Delete Data
                        SchedulerManager.DeleteData();
                        break;
                    case 3:// Archive Data
                        SchedulerManager.ArchiveData();
                        break;
                    case 4:// Add Entries in Register
                        SchedulerManager.AddEntries();
                        break;
                    case 5:// Create Tasks
                        SchedulerManager.CreateTasks();
                        break;
                }
            });

            // 6
            //update the next date
            await Database.rawQuery('update schedulers set "next" = "next" + cast(schedulers.frequency as interval) where "next" <= current_date');

            //if multiple days task not created, then set next date = tommorow
            await Database.rawQuery('update schedulers set "next" = current_date + interval \'1 day\' where "next" <= current_date');
            
        }catch{};
    }

    static async RotateRegisters() {
        
    }

    static async DeleteData() {
        
    }

    static async ArchiveData() {
        
    }

    static async AddEntries() {
        
    }

    static async CreateTasks() {
        
    }

}