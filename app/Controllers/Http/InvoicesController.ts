import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Client from 'App/Models/Client';
import Company from 'App/Models/Company';
import Invoice from 'App/Models/Invoice'
import StringUtils from 'App/Utils/StringUtils';

export default class InvoicesController {
    public async index({request,response}: HttpContextContract){

        const filter = request.param('filter');

        let invoices = Invoice
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

        if(filter == 0){ // waiting
            invoices = invoices.where('total',null);
        }else if(filter == 1){ // unpaid
            invoices = invoices.where('paid',false);
        }else if(filter == 2){ // paid
            invoices = invoices.where('paid',true);
        }

        response.send({
            status: 'success',
            data: await invoices
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

    public async create({request,response}: HttpContextContract){
        const payload = request.all();

        const data = await Invoice.create(payload);

        payload.id = data.id;

        payload.client = await Client
            .query()
            .select('id','name','group_id')
            .where('id',payload.client_id)
            .first();

        response.send({
            status: 'success',
            data: payload
        });
    }

    public async update({request,response}: HttpContextContract){
        const payload = request.all();
        const hsn_gst = {};

        let status;

        // check if hsn and gst are valid
        payload.particulars.particulars.forEach(particular => {
            
            if(hsn_gst[particular.hsn] == null){

                hsn_gst[particular.hsn] = particular.gst;
            
            }else if(hsn_gst[particular.hsn] != particular.gst){

                response.send({
                    status: 'error',
                    message: 'different GST cannot exist for same hsn!'
                });

                status = -1;

                return;
            }
        });

        if(status == -1){
            return;
        }


        delete payload.client;
        delete payload.company;

        await Invoice
            .query()
            .where('id',payload.id)
            .update(payload);

        payload.client = await Client
            .query()
            .select('id','name','group_id')
            .where('id',payload.client_id)
            .first();

        response.send({
            status: 'success',
            data: payload
        });
    }

    public async destroy({request,response}: HttpContextContract){
        const payload = request.all();

        await Invoice
            .query()
            .whereIn('id',payload.id)
            .delete();

        response.send({
            status: 'success'
        });
    }
}
