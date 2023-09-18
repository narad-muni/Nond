import Application from '@ioc:Adonis/Core/Application'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Invoice from 'App/Models/Invoice';
import { PDFUtils } from 'App/Utils/PDFUtils';
import nodemailer from 'nodemailer';
import fs from 'fs/promises';

export default class InvoiceMailsController {
    public async sendMail({ request, response, session }: HttpContextContract) {
        try {
            const payload = request.all();
            const ids = payload?.ids;
            const send_to = payload?.send_to || "Individual";
            const tempInvoicePath = Application.tmpPath("invoices" + session.get("user").id + Math.floor(Math.random() * 999) + 100);

            const invoices = await Invoice
                .query()
                .preload('company')
                .preload('client')
                .whereIn('id', ids);

            await PDFUtils.generateInvoices(tempInvoicePath, invoices);

            if (send_to == "Both") { // send to individual as well as parent

            } else if (send_to == "Parent Comapny") { // send to parent

            } else { // send only to individual

            }

            response.send({
                status: "success",
            })

            response.response.on("finish", async () => {
                try {
                    await fs.rm(tempInvoicePath, { recursive: true });
                } catch (err) {
                    console.log(err)
                }
            });
        } catch (err) {
            console.log(err);

            response.send({
                "Error": err
            });
        }
    }
}
