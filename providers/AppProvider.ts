import type { ApplicationContract } from '@ioc:Adonis/Core/Application';

export default class AppProvider {
    constructor (protected app: ApplicationContract) {
    }

    public register () {
        // Register your own bindings
    }

    public async boot () {
        // IoC container is ready
    }

    public async ready () {
        // App is ready
        const {default: Scheduler} = await import('App/Models/Scheduler');
        const {default: Database} = await import('@ioc:Adonis/Lucid/Database');

        const currentDate = new Date().toISOString().slice(0, 10);
        const schedulers = await Scheduler
            .query()
            .where('next',currentDate);

        schedulers.forEach(scheduler => {
            switch(scheduler.type){
                case 1:
                    break;
                case 2:
                    break;
            }
        });

        //update the next date
        await Database.rawQuery('update schedulers set "next" = "next" + cast(schedulers.frequency as interval) where "next" = current_date');
        
    }

    public async shutdown () {
        // Cleanup, since app is going down
    }
}
