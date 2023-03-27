import { BaseCommand } from '@adonisjs/core/build/standalone'
import { DateTime } from 'luxon'

export default class Reseed extends BaseCommand {
    /**
     * Command name is used to run the command
     */
    public static commandName = 'reseed'

    /**
     * Command description is displayed in the "help" output
     */
    public static description = ''

    public static settings = {
        /**
         * Set the following value to true, if you want to load the application
         * before running the command. Don't forget to call `node ace generate:manifest` 
         * afterwards.
         */
        loadApp: true,

        /**
         * Set the following value to true, if you want this command to keep running until
         * you manually decide to exit the process. Don't forget to call 
         * `node ace generate:manifest` afterwards.
         */
        stayAlive: false,
    }

    public async initialize(){

        const { default: Employee } = await import('App/Models/Employee');
        const { default: Role } = await import('App/Models/Role');
        const { default: Company } = await import('App/Models/Company');
        const { default: Task } = await import('App/Models/Task');
        const {default: Lead} = await import('App/Models/Lead');
        const {default: Client} = await import('App/Models/Client');
        const {default: Service} = await import('App/Models/Service');
        const {default: TaskTemplate} = await import('App/Models/TaskTemplate');
        const {default: Scheduler} = await import('App/Models/Scheduler');

        await Employee.create({
            id: 0,
            username: 'admin',
            password: 'admin123',
            is_admin: true,
            role_id: 1,
        });

        await Scheduler.create({
            id: 0,
            client_id: 0,
            service_id: 0,
            next: DateTime.fromISO('2022-12-01'),
            frequency: '1 month',
            type: 5
        });

        await Scheduler.create({
            id: 1,
            register_id: 0,
            data: {rotation_strategy: 'delete'},
            next: DateTime.fromISO('2022-12-01'),
            frequency: '1 month',
            type: 1
        });

        await TaskTemplate.create({
            id: 0,
            name: 'Default',
            title: '',
            description: '',
            service_id: -1,
            status: 0,
            priority: 1
        });

        await Service.create({
            id: 0,
            hsn:123456,
            name: 'GST',
            template_id:0
        });

        await Service.create({
            id: -1,
            hsn:0,
            name: 'Others',
            template_id:0
        });

        await Role.create({
            id: 0,
            name: 'viewer',
            read: {"task":true},
            create: {},
            update: {},
            remove: {},
            destroy: {},
        });

        await Role.create({
            id: 1,
            name: 'admin',
            read: {"client":true,"archived_register":true,"register_master":true,"service":true,"company":true,"employee":true,"register_template":true,"master_template":true,"task_template":true,"register":true,"role":true,"task":true,"lead":true,"invoice":true},
            create: {"client":true,"archived_register":true,"register_master":true,"service":true,"company":true,"employee":true,"register_template":true,"master_template":true,"task_template":true,"register":true,"role":true,"task":true,"lead":true,"invoice":true},
            update: {"client":true,"archived_register":true,"register_master":true,"service":true,"company":true,"employee":true,"register_template":true,"master_template":true,"task_template":true,"register":true,"role":true,"task":true,"lead":true,"invoice":true},
            remove: {"client":true,"archived_register":true,"register_master":true,"service":true,"company":true,"employee":true,"register_template":true,"master_template":true,"task_template":true,"register":true,"role":true,"task":true,"lead":true,"invoice":true},
            destroy: {"client":true,"archived_register":true,"register_master":true,"service":true,"company":true,"employee":true,"register_template":true,"master_template":true,"task_template":true,"register":true,"role":true,"task":true,"lead":true,"invoice":true},
        });

        await Company.create({
            id: 0,
            name: 'JJ Industries',
            gstin: '27GAHJAKS',
            email: 'jjind2011@gmail.com',
            signature: '.jpg'
        });

        await Client.create({
            id: 0,
            name: 'JJ Industries',
            email: 'jjind2011@gmail.com',
            gstin: '27aafh',
            deleted: false,
            group_id: 0
        });

        await Task.create({
            id: 0,
            assigned_to: 0,
            client_id: 0,
            title: 'Please complete this asap',
            description: 'Very bad\nVery Late',
            status: 1,
            priority: 0,
            service_id: 0,
            billed: false
        });

        await Lead.create({
            id: 0,
            client: 'SS Industries',
            assigned_to: 0,
            description: 'Wan\'t to arrange meeting',
            status: 'On boarding',
            started: DateTime.fromISO('2022-12-12')
        });

    }

    public async de_initialize(){

        const { default: Employee } = await import('App/Models/Employee');
        const { default: Role } = await import('App/Models/Role');
        const { default: Company } = await import('App/Models/Company');
        const { default: Task } = await import('App/Models/Task');
        const {default: Lead} = await import('App/Models/Lead');
        const {default: Client} = await import('App/Models/Client');
        const {default: Service} = await import('App/Models/Service');
        const {default: TaskTemplate} = await import('App/Models/TaskTemplate');
        const {default: Scheduler} = await import('App/Models/Scheduler');
            
        const user = await Employee.findBy('id',0);
        const scheduler = await Scheduler.findBy('id',0);
        const role1 = await Role.findBy('id',0);
        const role2 = await Role.findBy('id',1);
        const company = await Company.findBy('id',0);
        const task = await Task.findBy('id',0);
        const lead = await Lead.findBy('id',0);
        const client = await Client.findBy('id',0);
        const service = await Service.findBy('id',0);
        const service_others = await Service.findBy('id',-1);
        const task_template = await TaskTemplate.findBy('id',0);

        await user?.delete();
        await scheduler?.delete();
        await role1?.delete();
        await role2?.delete();
        await company?.delete();
        await task?.delete();
        await lead?.delete();
        await client?.delete();
        await service?.delete();
        await service_others?.delete();
        await task_template?.delete();

    }

    public async run() {
        await this.de_initialize();
        await this.initialize();
    }
}
