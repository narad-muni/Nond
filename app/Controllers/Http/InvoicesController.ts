import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Company from 'App/Models/Company';
import Invoice from 'App/Models/Invoice'
import StringUtils from 'App/Utils/StringUtils';

import TableManager from 'App/Utils/TableManager';

export default class InvoicesController {
    public async index({ request, response }: HttpContextContract) {
        try {

            const filter = request.param('filter');

            let invoices = Invoice
                .query()
                .preload('client', (query) => {
                    query
                        .select('id', 'name', 'group_id')
                        .preload('group', (query) => {
                            query.select('id', 'name')
                        })
                })
                .preload('company', (query) => {
                    query.select('id', 'name')
                });

            if (filter == 0) { // waiting
                invoices = invoices.whereNull('total');
            } else if (filter == 1) { // unpaid
                invoices = invoices.where('paid', false);
            } else if (filter == 2) { // paid
                invoices = invoices.where('paid', true);
            }

            response.send({
                status: 'success',
                data: await invoices
            });
        } catch (e) {
            console.log(e);

            response.send({
                status: "error",
                message: "some error occured"
            });
        }
    }

    public async get({ request, response }: HttpContextContract) {
        try {
            const payload = request.params();

            const invoice = await Invoice
                .query()
                .preload('client', (query) => {
                    query.select('id', 'name')
                })
                .preload('company', (query) => {
                    query.select('id', 'name')
                })
                .where('id', payload.id)
                .first()

            response.send({
                status: 'success',
                data: invoice
            });
        } catch (e) {
            console.log(e);

            response.send({
                status: "error",
                message: "some error occured"
            });
        }
    }

    public async create({ request, response }: HttpContextContract) {
        try {
            const Client = TableManager.getTable('clients', TableManager.MODES.FULL);
            
            const payload = request.all();

            //set "null" to null
            Object.keys(payload).forEach(e => {
                if (payload[e] == "null" || String(payload[e]) == "") {
                    payload[e] = null;
                }
            });

            const data = await Invoice.create(payload);

            payload.id = data.id;

            payload.client = await Client
                .query()
                .select('id', 'name', 'group_id')
                .where('id', payload.client_id)
                .first();

            response.send({
                status: 'success',
                data: payload
            });
        } catch (e) {
            console.log(e);

            response.send({
                status: "error",
                message: "some error occured"
            });
        }
    }

    public async update({ request, response }: HttpContextContract) {
        try {
            const Client = TableManager.getTable('clients', TableManager.MODES.FULL);
            
            const payload = request.all();
            const hsn_gst = {};

            //set "null" to null
            Object.keys(payload).forEach(e => {
                if (payload[e] == "null" || String(payload[e]) == "") {
                    payload[e] = null;
                }
            });

            let status;

            // check if hsn and gst are valid
            payload.particulars.particulars.forEach(particular => {

                if (hsn_gst[particular.hsn] == null) {

                    hsn_gst[particular.hsn] = particular.gst;

                } else if (hsn_gst[particular.hsn] != particular.gst) {

                    response.send({
                        status: 'error',
                        message: 'different GST cannot exist for same HSN code'
                    });

                    status = -1;

                    return;
                }
            });

            if (status == -1) {
                return;
            }

            const old_company_prefix = payload.id.split(" ")[0];
            const old_id = payload.id;

            if (old_company_prefix != StringUtils.shortName(payload.company.name)) {

                const company_details = await Company
                    .query()
                    .where('id', payload.company_id)
                    .increment('invoice_counter', 1)
                    .update({}, ['prefix', 'invoice_counter']);

                payload.id = company_details[0].prefix + "-" + StringUtils.getFinancialYear() + "-" + company_details[0]['invoice_counter'];
            }

            delete payload.client;
            delete payload.company;

            await Invoice
                .query()
                .where('id', old_id)
                .update(payload);

            payload.client = await Client
                .query()
                .select('id', 'name', 'group_id')
                .where('id', payload.client_id)
                .first();

            response.send({
                status: 'success',
                data: payload
            });
        } catch (e) {
            console.log(e);

            response.send({
                status: "error",
                message: "some error occured"
            });
        }
    }

    public async destroy({ request, response }: HttpContextContract) {
        try {
            const payload = request.all();

            await Invoice
                .query()
                .whereIn('id', payload.id)
                .delete();

            response.send({
                status: 'success'
            });
        } catch (e) {
            console.log(e);

            response.send({
                status: "error",
                message: "some error occured"
            });
        }
    }
}
