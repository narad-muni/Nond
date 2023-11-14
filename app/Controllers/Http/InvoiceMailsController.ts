import Application from '@ioc:Adonis/Core/Application'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Invoice from 'App/Models/Invoice';
import { PDFUtils } from 'App/Utils/PDFUtils';
import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import ClientDAO from 'App/Dao/ClientDAO';
import CompanyDAO from 'App/Dao/CompanyDAO';

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

            const unique_client: Set<number> = new Set();

            // Set invoices for clients
            invoices.forEach(invoice => {
                unique_client.add(invoice.client_id);
            });

            const client_details = await ClientDAO.getClientsByIds(Array.from(unique_client));
            const company_details = await CompanyDAO.getAllCompanies();

            const client_list = new Map();
            const company_list = new Map();

            client_details.forEach(client => {
                client_list.set(
                    client.id,
                    client
                );
            });

            company_details.forEach(company => {
                company_list.set(
                    company.id,
                    company
                );
            });

            const bulk_mail: Promise<any>[] = [];

            const mail_status: any[] = [];

            // Set mail to
            for(const invoice of invoices) {
                const self_ = client_list.get(invoice.client_id);
                const self_email = self_?.email;
                const parent_email = self_?.group?.email;
                const to: string[] = [];
                const company = company_list.get(invoice.company_id);

                if([company.smtp_host,company.smtp_port,company.smtp_email,company.smtp_password].filter(e => e == null).length > 0){
                    mail_status.push({
                        invoice: invoice.id,
                        success: false,
                        message: "SMTP Parameters not set correctly."
                    });

                    continue;
                }

                if (send_to == "Both") { // send to individual as well as parent
                    to.push(self_email);

                    if(parent_email){
                        to.push(parent_email);
                    }
                } else if (send_to == "Parent Company") { // send to parent
                    to.push(parent_email || self_email);
                } else { // send only to individual
                    to.push(self_email);
                }

                if(to.filter(e => e == null).length > 0){
                    mail_status.push({
                        invoice: invoice.id,
                        success: false,
                        message: `Failed to send invoice ${invoice.id}, email not set correctly for this client.`
                    });

                    continue;
                }

                bulk_mail.push(this.mail(
                    invoice.id,
                    company.smtp_host,
                    company.smtp_port,
                    company.smtp_email,
                    company.smtp_password,
                    to,
                    "Invoice",
                    [invoice.id + "_" + self_?.name],
                    "Please find attached invoice.",
                    tempInvoicePath
                ));
            };

            const resp: any[] = await Promise.all(bulk_mail);

            resp.forEach(e => {
                const invoice = e[0];
                const error = e[1];
                let success = false;
                let message = "";

                if(error?.accepted?.length > 0 && (error?.rejected?.length || 0) == 0){
                    success = true;
                    message = `Invoice ${invoice} sent successfully.`;
                }else if((error?.rejected?.length || 0) > 0){
                    message = `Failed to send invoice ${invoice} to ${error?.rejected}.`;
                }else{
                    message = `Failed to send invoice ${invoice}. ${error}.`;
                }

                mail_status.push({
                    invoice: invoice,
                    success: success,
                    message: message
                });
            });

            response.send({
                status: "success",
                data: mail_status
            })

            response.response.on("finish", async () => {
                try {
                    await fs.rm(tempInvoicePath, { recursive: true });
                } catch (err) {
                    console.log(err);
                }
            });
        } catch (err) {
            console.log(err);

            response.send({
                message: err
            });
        }
    }

    public async mailStatusHandler(bulk_mail){
        
    }

    public async mail(identifier, smtp_host, smtp_port, smtp_email, smtp_password, to, subject, attachments, message, attachment_path){
        try{
            const transporter = nodemailer.createTransport({
                host: smtp_host,
                port: smtp_port,
                secure: false,
                tls: {
                    ciphers:'SSLv3'
                },
                auth: {
                  user: smtp_email,
                  pass: smtp_password,
                },
            });

            const file_list: any[] = [];

            attachments.forEach(attachment => {
                file_list.push({
                    filename: attachment + ".pdf",
                    path: attachment_path + "/" + attachment + ".pdf"
                });
            });

            const info = await transporter.sendMail({
                from: smtp_email, // sender address
                to: to.join(", "),
                subject: subject, // Subject line
                html: message, // html body,
                attachments: file_list
            });

            return [identifier, info];
        }catch(e){
            return [identifier, e];
        }
    }
}
