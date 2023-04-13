import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ArchivedInvoice from 'App/Models/ArchivedInvoice';

export default class ArchivedInvoicesController {
    public async index({response}: HttpContextContract){

        let invoices = await ArchivedInvoice
            .query();

        response.send({
            status: 'success',
            data: await invoices
        })
    }

    public async get({request,response}: HttpContextContract){
        const payload = request.params();

        const invoice = await ArchivedInvoice
            .query()
            .where('id',payload.id)
            .first()

        response.send({
            status: 'success',
            data: invoice
        })
    }
}
