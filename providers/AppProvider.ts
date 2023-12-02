import type { ApplicationContract } from '@ioc:Adonis/Core/Application';

export default class AppProvider {
    constructor (protected app: ApplicationContract) {
    }

    public register () {
        // Register your own bindings
    }

    public async boot () {
        // IoC container is ready
        const { MemoryDriver } = await import('./SessionDriver');
        const Session = this.app.container.use('Adonis/Addons/Session');

        Session.extend('in-memory', () => {
            return new MemoryDriver()
        });
    }

    public async ready () {
        const {default: SchedulerManager} = await import('App/Utils/SchedulerManager');
        const {default: TableManager} = await import('App/Utils/TableManager');
        const {default: AutomatorDAO} = await import('App/Dao/AutomatorDAO');
        const {default: PG} = await import('App/Utils/EmbededPG');

        const dayInMilliseconds = 1000 * 60 * 60 * 24;

        // Start Postgres
        await PG.startPG();
        
        // Set table classes with columns on start
        await TableManager.init();

        // Trigger scheduler manager on start
        await SchedulerManager.RunSchedulers();

        // Fail and delte automator files
        await AutomatorDAO.failPendingAutomators();

        //trigger scheduler after 24h if server is running continuously
        setInterval(SchedulerManager.RunSchedulers,dayInMilliseconds);
    }

    public async shutdown () {
        // Cleanup, since app is going down
        const {default: PG} = await import('App/Utils/EmbededPG');

        await PG.stopPG();
    }
}
