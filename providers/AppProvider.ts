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

        const {default: SchedulerManager} = await import('App/Utils/SchedulerManager');
        const dayInMilliseconds = 1000 * 60 * 60 * 24;

        // Trigger scheduler manager on start
        SchedulerManager.RunSchedulers();

        //trigger scheduler after 24h if server is running continuously
        setInterval(SchedulerManager.RunSchedulers,dayInMilliseconds);
    }

    public async shutdown () {
        // Cleanup, since app is going down
    }
}
