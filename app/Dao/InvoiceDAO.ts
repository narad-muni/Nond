import Invoice from "App/Models/Invoice";
import Task from "App/Models/Task";

export default class InvoiceDAO {
    public static async createInvoicesLinkTasks(invoices: Invoice[]){

        for(let invoice of invoices){
            const tasks = invoice.tasks;
            
            delete invoice.tasks;

            invoice = await Invoice.create(invoice);

            await Task
                .query()
                .whereIn('id', tasks)
                .update({'invoice_id': invoice.id});
            }
        }
    }
}