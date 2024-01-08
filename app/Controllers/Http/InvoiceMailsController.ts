import Application from '@ioc:Adonis/Core/Application'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Invoice from 'App/Models/Invoice';
import { PDFUtils } from 'App/Utils/PDFUtils';
import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import ClientDAO from 'App/Dao/ClientDAO';
import CompanyDAO from 'App/Dao/CompanyDAO';
import AutomatorDAO from 'App/Dao/AutomatorDAO';
import Automator from 'App/Models/Automator';
import { DateTime } from 'luxon';

export default class InvoiceMailsController {

    public static serialize (value) {
        if (value instanceof Date) {
            return DateTime.fromJSDate(value).toFormat('d LLL yyyy');
        } else if(value instanceof DateTime){
            return value.toFormat('d LLL yyyy');
        } else {
            return value
        }
    }

    public static setTemplateData(message, client, company, invoice) {
        
        let generateData = message
            .replace("{client}", client?.name)
            .replace("{group}", client?.$preloaded.group.$attributes.name || client?.name)
            .replace("{company}", company?.name)
            .replace("{total}", invoice?.total)
            .replace("{tax}", invoice?.tax)
            .replace("{paid}", invoice?.paid ? "Paid" : "Not Paid")
            .replace("{remarks}", invoice?.remarks || "")
            .replace("{date}", InvoiceMailsController.serialize(invoice?.date))
            .replace('\n', '<br/>');

        return generateData;
    }

    public async sendMail({ request, response, session }: HttpContextContract) {
        try {
            const payload = request.all();
            const ids = payload?.ids;
            const send_to = payload?.send_to || "Individual";
            const subject = payload?.subject;
            const body = payload?.body;
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

            const bulk_mail_data: any[] = [];

            const mail_status: object = {
                "temp_path": tempInvoicePath
            };

            // Set mail to
            for(const invoice of invoices) {
                const self_ = client_list.get(invoice.client_id);
                const self_email = self_?.email;
                const parent_email = self_?.group?.email;
                const to: string[] = [];
                const company = company_list.get(invoice.company_id);

                if([company.smtp_host,company.smtp_port,company.smtp_email,company.smtp_password].filter(e => e == null).length > 0){
                    mail_status[invoice.id] = {
                        success: false,
                        message: "SMTP Parameters not set correctly."
                    };

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
                    mail_status[invoice.id] = {
                        success: false,
                        message: `Failed to send invoice ${invoice.id}, email not set correctly for this client.`
                    };

                    continue;
                }

                bulk_mail_data.push({
                    identifier: invoice.id,
                    smtp_host: company.smtp_host,
                    smtp_port: company.smtp_port,
                    smtp_email: company.smtp_email,
                    smtp_password: company.smtp_password,
                    to: to,
                    subject: InvoiceMailsController.setTemplateData(subject, self_, company, invoice),
                    attachments: [invoice.id + "_" + self_?.name],
                    message: InvoiceMailsController.setTemplateData(body, self_, company, invoice),
                    attachment_path: tempInvoicePath
                })
            };

            const automator = new Automator();

            automator.name = "Mailer";
            automator.triggered_by = session.get("user").id;
            automator.status = "Pending";
            automator.message = "Your mails are getting sent!";
            automator.data = mail_status;

            await AutomatorDAO.createAutomators([automator]);

            InvoiceMailsController.bulkMailAutomator(bulk_mail_data, automator);

            response.send({
                status: "success",
                message: "Sending Mails from automator"
            })
        } catch (err) {
            console.log(err);

            response.send({
                status: "error",
                message: err
            });
        }
    }

    public static async bulkMailAutomator(bulk_mail, automator){
        const tempInvoicePath = automator?.data?.temp_path;
        try{
            const line: Promise<any>[] = [];

            async function mailAutomator(mail_data){
                try{
                    
                    automator.data[mail_data.identifier] = {
                        message: 'In Progress'
                    };
                    await AutomatorDAO.updateAutomatorById(automator);

                    const resp = await InvoiceMailsController.mail(
                        mail_data.smtp_host,
                        mail_data.smtp_port,
                        mail_data.smtp_email,
                        mail_data.smtp_password,
                        mail_data.to,
                        mail_data.subject,
                        mail_data.attachments,
                        mail_data.message,
                        mail_data.attachment_path
                    );

                    if(resp?.accepted?.length > 0 && (resp?.rejected?.length || 0) == 0){
                        automator.data[mail_data.identifier] = {
                            success: true,
                            message: `Invoice ${mail_data.identifier} sent successfully.`
                        };
                    }else if((resp?.rejected?.length || 0) > 0){
                        automator.data[mail_data.identifier] = {
                            success: false,
                            message: `Failed to send invoice ${mail_data.identifier} to ${resp.rejected}.`
                        };
                    }else{
                        automator.data[mail_data.identifier] = {
                            success: false,
                            message: `Failed to send invoice ${mail_data.identifier}. ${resp}.`
                        };
                    }

                    await AutomatorDAO.updateAutomatorById(automator);

                }catch(e){
                    automator.data[mail_data.identifier] = {
                        success: false,
                        message: `Failed to send invoice ${mail_data.identifier}. ${e}.`
                    };
                    await AutomatorDAO.updateAutomatorById(automator);
                }
            }

            for(const i of bulk_mail){
                line.push(mailAutomator(i));
            }

            await Promise.all(line);

            if(Object.values(automator.data).filter(e => e.success == false).length == 0){
                automator.status = 'Successfull';
                automator.message = 'All mails executed successfully, Please check logs';
            }else if(Object.values(automator.data).filter(e => e.success == true).length > 0){
                automator.status = 'Partially Successfull';
                automator.message = 'Some mails failed, Please check logs';
            }else{
                automator.status = 'Failed';
                automator.message = 'All mails failed, Please check logs';
            }

            await AutomatorDAO.updateAutomatorById(automator);
        }catch(e){
            console.log(e);

            automator.status = 'Failed';
            automator.message = e;
            
            await AutomatorDAO.updateAutomatorById(automator);
        }finally{
            try {
                await fs.rm(tempInvoicePath, { recursive: true });
            } catch (err) {
                console.log(err);
            }
        }
    }

    public static async mail(smtp_host, smtp_port, smtp_email, smtp_password, to, subject, attachments, message, attachment_path){
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

            return info;
        }catch(e){
            return e;
        }
    }
}
