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

        const { default: Employee } = await import('App/Models/Employee')
        const { default: Role } = await import('App/Models/Role')
        const { default: Company } = await import('App/Models/Company')
        const { default: Task } = await import('App/Models/Task')

        await Employee.create({
            id: 0,
            username: 'admin',
            password: 'admin123',
            is_admin: true,
            role_id: 0,
        })

        await Role.create({
            id: 0,
            name: 'admin',
            read: JSON.stringify(["client","company","employee","template","master_template","register","role","task","scheduler","lead","invoice"]),
            create: JSON.stringify(["client","company","employee","template","master_template","register","role","task","scheduler","lead","invoice"]),
            update: JSON.stringify(["client","company","employee","template","master_template","register","role","task","scheduler","lead","invoice"]),
            remove: JSON.stringify(["client","company","employee","template","master_template","register","role","task","scheduler","lead","invoice"]),
            destroy: JSON.stringify(["client","company","employee","template","master_template","register","role","task","scheduler","lead","invoice"]),
        })

        await Company.create({
            id: 0,
            name: 'JJ Industries',
            gstin: '27GAHJAKS',
            email: 'jjind2011@gmail.com',
            signature: '.jpg'
        })

        await Task.create({
            id: 0,
            assigned_to: 0,
            title: 'Please complete this asap',
            description: 'Very bad\nVery Late',
            started: DateTime.fromISO('2022-12-01'),
            ended: DateTime.fromISO('2023-01-01')
        })

    }

    public async de_initialize(){

        const { default: Employee } = await import('App/Models/Employee')
        const { default: Role } = await import('App/Models/Role')
        const { default: Company } = await import('App/Models/Company')
        const { default: Task } = await import('App/Models/Task')
            
        const user = await Employee.findBy('id',0)
        const role = await Role.findBy('id',0);
        const company = await Company.findBy('id',0);
        const task = await Task.findBy('id',0);

        await user?.delete()
        await role?.delete()
        await company?.delete()
        await task?.delete()

    }

    public async run() {
        await this.de_initialize();
        await this.initialize();
    }
}
