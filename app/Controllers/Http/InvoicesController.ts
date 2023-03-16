import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Invoice from 'App/Models/Invoice'

export default class InvoicesController {
    public async index({response}: HttpContextContract){
        const invoices = await Invoice
            .query()
            .preload('client',(query) => {
                query
                    .select('id','name','group_id')
                    .preload('group', (query) => {
                        query.select('id','name')
                    })
            })
            .preload('company',(query) => {
                query.select('id','name')
            })
            .where('deleted',false);

        response.send({
            status: 'success',
            data: invoices
        })
    }

    public async get({request,response}: HttpContextContract){
        const payload = request.params();

        const invoice = await Invoice
            .query()
            .preload('client',(query) => {
                query.select('id','name')
            })
            .preload('company',(query) => {
                query.select('id','name')
            })
            .where('id',payload.id)
            .first()

        response.send({
            status: 'success',
            data: invoice
        })
    }

    public async options({}: HttpContextContract){}

    public async create({}: HttpContextContract){}

    public async update({}: HttpContextContract){}

    public async remove({}: HttpContextContract){}

    public async destroy({}: HttpContextContract){}
}
