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

    public async initialize() {

        const { default: Employee } = await import('App/Models/Employee');
        const { default: Role } = await import('App/Models/Role');
        const { default: Service } = await import('App/Models/Service');
        const { default: TaskTemplate } = await import('App/Models/TaskTemplate');
        const { default: Scheduler } = await import('App/Models/Scheduler');
        const { default: MasterTemplate } = await import('App/Models/MasterTemplate');

        await Employee.create({
            id: 0,
            username: 'admin',
            password: 'admin123',
            is_admin: true,
            role_id: -1,
        });

        await Scheduler.create({
            id: -3,
            data: { "info": "delete data" },
            type: 2,
            next: DateTime.now(),
            frequency: '1 week'
        });

        await Scheduler.create({
            id: -2,
            data: { "info": "archive data" },
            type: 3,
            next: DateTime.now(),
            frequency: '1 week'
        });

        await Scheduler.create({
            id: -1,
            data: { "info": "every financial year" },
            type: 4,
            next: DateTime.fromISO('2023-04-01'),
            frequency: '1 year'
        });

        await TaskTemplate.create({
            id: -1,
            name: 'Default',
            title: '',
            description: '',
            service_id: -1,
            status: 0,
            priority: 1
        });

        await Service.create({
            id: -1,
            hsn: 0,
            name: 'Others',
            template_id: -1
        });

        await Role.create({
            id: -2,
            name: 'viewer',
            read: { "task": true },
            create: {},
            update: {},
            remove: {},
            destroy: {},
        });

        await Role.create({
            id: -1,
            name: 'admin',
            read: { "client": true, "report": true, "archived_register": true, "register_master": true, "service": true, "company": true, "employee": true, "register_template": true, "master_template": true, "task_template": true, "register": true, "role": true, "task": true, "lead": true, "invoice": true, "automator": true },
            create: { "client": true, "archived_register": true, "register_master": true, "service": true, "company": true, "employee": true, "register_template": true, "master_template": true, "task_template": true, "register": true, "role": true, "task": true, "lead": true, "invoice": true },
            update: { "client": true, "archived_register": true, "register_master": true, "service": true, "company": true, "employee": true, "register_template": true, "master_template": true, "task_template": true, "register": true, "role": true, "task": true, "lead": true, "invoice": true },
            remove: { "client": true, "company": true, "employee": true },
            destroy: { "client": true, "archived_register": true, "register_master": true, "service": true, "company": true, "employee": true, "register_template": true, "master_template": true, "task_template": true, "register": true, "role": true, "task": true, "lead": true, "invoice": true, "automator": true },
        });

        await MasterTemplate.createMany([
            {
                id: -1,
                table_name: "clients",
                column_name: "name",
                display_name: "Name",
                order: 1,
                column_type: "Text",
                column_info: {},
                is_master: true,
            },{
                id: -2,
                table_name: "clients",
                column_name: "email",
                display_name: "Email",
                order: 1,
                column_type: "Text",
                column_info: {},
                is_master: true,
            },{
                id: -3,
                table_name: "clients",
                column_name: "group",
                display_name: "Group",
                order: 1,
                column_type: "Dropdown",
                column_info: {options:[]},
                is_master: true,
            },{
                id: -4,
                table_name: "clients",
                column_name: "gst",
                display_name: "GST",
                order: 1,
                column_type: "Text",
                column_info: {},
                is_master: true,
            },{
                id: -5,
                table_name: "clients",
                column_name: "pan",
                display_name: "Pan",
                order: 1,
                column_type: "Text",
                column_info: {},
                is_master: false,
            },{
                id: -6,
                table_name: "clients",
                column_name: "address",
                display_name: "Address",
                order: 1,
                column_type: "Text",
                column_info: {},
                is_master: false,
            },{
                id: -7,
                table_name: "clients",
                column_name: "signature",
                display_name: "Signature",
                order: 1,
                column_type: "File",
                column_info: {},
                is_master: false,
            },{
                id: -8,
                table_name: "clients",
                column_name: "logo",
                display_name: "Logo",
                order: 1,
                column_type: "File",
                column_info: {},
                is_master: false,
            }
        ]);

        await MasterTemplate.createMany([
            {
                id: -9,
                table_name: "companies",
                column_name: "name",
                display_name: "Name",
                order: 1,
                column_type: "Text",
                column_info: {},
                is_master: true,
            },{
                id: -10,
                table_name: "companies",
                column_name: "invoice_prefix",
                display_name: "Invoice Prefix",
                order: 1,
                column_type: "Text",
                column_info: {},
                is_master: false,
            },{
                id: -11,
                table_name: "companies",
                column_name: "email",
                display_name: "Email",
                order: 1,
                column_type: "Text",
                column_info: {},
                is_master: true,
            },{
                id: -12,
                table_name: "companies",
                column_name: "address",
                display_name: "Address",
                order: 1,
                column_type: "Text",
                column_info: {},
                is_master: false,
            },{
                id: -13,
                table_name: "companies",
                column_name: "pan",
                display_name: "Pan",
                order: 1,
                column_type: "Text",
                column_info: {},
                is_master: true,
            },{
                id: -14,
                table_name: "companies",
                column_name: "gst",
                display_name: "GST",
                order: 1,
                column_type: "Text",
                column_info: {},
                is_master: true,
            },{
                id: -15,
                table_name: "companies",
                column_name: "upi",
                display_name: "UPI",
                order: 1,
                column_type: "Text",
                column_info: {},
                is_master: true,
            },{
                id: -16,
                table_name: "companies",
                column_name: "signature",
                display_name: "Signature",
                order: 1,
                column_type: "File",
                column_info: {},
                is_master: false,
            },{
                id: -17,
                table_name: "companies",
                column_name: "logo",
                display_name: "Logo",
                order: 1,
                column_type: "File",
                column_info: {},
                is_master: false,
            },{
                id: -18,
                table_name: "companies",
                column_name: "account_holder_name",
                display_name: "Account Holder Name",
                order: 1,
                column_type: "Text",
                column_info: {},
                is_master: false,
            },{
                id: -19,
                table_name: "companies",
                column_name: "bank_name",
                display_name: "Bank Name",
                order: 1,
                column_type: "Text",
                column_info: {},
                is_master: false,
            },{
                id: -20,
                table_name: "companies",
                column_name: "account_number",
                display_name: "Account Number",
                order: 1,
                column_type: "Text",
                column_info: {},
                is_master: false,
            },{
                id: -21,
                table_name: "companies",
                column_name: "ifsc_branch",
                display_name: "IFSC & Branch",
                order: 1,
                column_type: "Text",
                column_info: {},
                is_master: false,
            },{
                id: -22,
                table_name: "companies",
                column_name: "smtp_host",
                display_name: "SMTP Host",
                order: 1,
                column_type: "Text",
                column_info: {},
                is_master: false,
            },{
                id: -23,
                table_name: "companies",
                column_name: "smtp_port",
                display_name: "SMTP Port",
                order: 1,
                column_type: "Text",
                column_info: {},
                is_master: false,
            },{
                id: -24,
                table_name: "companies",
                column_name: "smtp_email",
                display_name: "SMTP Email",
                order: 1,
                column_type: "Text",
                column_info: {},
                is_master: false,
            },{
                id: -25,
                table_name: "companies",
                column_name: "smtp_password",
                display_name: "SMTP Password",
                order: 1,
                column_type: "Text",
                column_info: {},
                is_master: false,
            }
        ]);

    }

    public async de_initialize() {

        const { default: Employee } = await import('App/Models/Employee');
        const { default: Role } = await import('App/Models/Role');
        const { default: Service } = await import('App/Models/Service');
        const { default: TaskTemplate } = await import('App/Models/TaskTemplate');
        const { default: Scheduler } = await import('App/Models/Scheduler');
        const { default: MasterTemplate } = await import('App/Models/MasterTemplate');
        const { default: RegisterTemplate } = await import('App/Models/RegisterTemplate');

        await Employee.query().delete();
        await Scheduler.query().delete();
        await Role.query().delete();
        await Service.query().delete();
        await TaskTemplate.query().delete();
        await MasterTemplate.query().delete();
        await RegisterTemplate.query().delete();

    }

    public async run() {
        await this.de_initialize();
        await this.initialize();
    }
}
