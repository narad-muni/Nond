import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Company from 'App/Models/Company';
import Employee from 'App/Models/Employee';
import Role from 'App/Models/Role';
import Task from 'App/Models/Task';
import { DateTime } from 'luxon';

export default class InitializersController {
    public async initialize({response}: HttpContextContract){

        await Employee.create({
            id: 0,
            username: 'admin',
            password: 'admin123',
            role_id: 0,
        })

        await Role.create({
            id: 0,
            name: 'admin',
            read: JSON.stringify(["client","employee","template","master_template","register","role","task","scheduler","lead","invoice"]),
            read_self: JSON.stringify(["client","employee","template","master_template","register","role","task","scheduler","lead","invoice"]),
            create: JSON.stringify(["client","employee","template","master_template","register","role","task","scheduler","lead","invoice"]),
            update: JSON.stringify(["client","employee","template","master_template","register","role","task","scheduler","lead","invoice"]),
            update_self: JSON.stringify(["client","employee","template","master_template","register","role","task","scheduler","lead","invoice"]),
            remove: JSON.stringify(["client","employee","template","master_template","register","role","task","scheduler","lead","invoice"]),
            remove_self: JSON.stringify(["client","employee","template","master_template","register","role","task","scheduler","lead","invoice"]),
            destroy: JSON.stringify(["client","employee","template","master_template","register","role","task","scheduler","lead","invoice"]),
        })

        await Company.create({
            id: 0,
            name: 'JJ Industries',
            GSTIN: '27GAHJAKS',
            email: 'jjind2011@gmail.com',
            signature: true
        })

        await Task.create({
            id: 0,
            assigned_to: 0,
            title: 'Please complete this asap',
            description: 'Very bad\nVery Late',
            started: DateTime.fromISO('2022-12-01'),
            ended: DateTime.fromISO('2023-01-01')
        })
    
        response.send("Success");

    }

    public async de_initialize({response}: HttpContextContract){
        
        const user = await Employee.findBy('id',0)
        const role = await Role.findBy('id',0);
        const company = await Company.findBy('id',0);
        const task = await Task.findBy('id',0);

        await user?.delete()
        await role?.delete()
        await company?.delete()
        await task?.delete()

        response.send("Success");
    
    }
}
