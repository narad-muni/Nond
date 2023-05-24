import Application from '@ioc:Adonis/Core/Application'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Invoice from 'App/Models/Invoice';
import { FileUtils } from 'App/Utils/FileUtils';
import { PDFUtils } from 'App/Utils/PDFUtils';
import fs from 'fs/promises';

export default class InvoicesFilesController {

    public async download({request, response, session}: HttpContextContract){
        try{
            const payload = request.all();
            const ids = payload?.ids?.split(",");
            const tempInvoicePath = Application.tmpPath("invoices"+session.get("user").id+Math.floor(Math.random() * 999) + 100);
            const tempZipPath = tempInvoicePath+"/Invoices.zip";
            
            const invoices = await Invoice
                .query()
                .preload('company')
                .preload('client')
                .whereIn('id', ids);

            const generatedFiles = await PDFUtils.generateInvoices(tempInvoicePath ,invoices);

            if(ids.length > 1){//multiple invoices, zip files
                FileUtils.zipFolder(tempInvoicePath, tempZipPath);

                response.attachment(tempZipPath, 'Invoices.zip');
            }else{//single pdf invoice
                response.attachment(tempInvoicePath+"/"+generatedFiles[0],generatedFiles[0],'inline');
            }

            response.response.on("finish", async () => {
                try{
                    await fs.rm(tempInvoicePath, {recursive: true});
                }catch(err){
                    console.log(err)
                }
            });

        }catch(err){
            console.log(err);

            response.send({
                "Error": err
            });
        }
    }

}
