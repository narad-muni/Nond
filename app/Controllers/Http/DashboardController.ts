import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database';
import Application from '@ioc:Adonis/Core/Application';
import fastFolderSize from 'fast-folder-size';
import StringUtils from 'App/Utils/StringUtils';
import Env from '@ioc:Adonis/Core/Env'

export default class DashboardController {

    public static async getFolderSize(folderPath) {
        try {
            const size = await new Promise((resolve, reject) => {
                fastFolderSize(folderPath, (err, size) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(size);
                    }
                });
            });
            return size;
        } catch (err) {
            return 0;
        }
    }

    public async getStats({ response }: HttpContextContract) {
        try {

            const data: any = {};

            // unassignedTasks
            data.unassignedTasks = (await Database
                .from('tasks')
                .whereNull('assigned_to')
                .count('*', 'unassignedTasks'))[0].unassignedTasks;

            // pendingInvoices
            data.pendingInvoices = (await Database
                .from('invoices')
                .whereNull('total')
                .count('*', 'pendingInvoices'))[0].pendingInvoices;

            // raisedTickets
            data.raisedTickets = (await Database
                .from('tasks')
                .where('status', 3)
                .count('*', 'raisedTickets'))[0].raisedTickets;

            // incompleteTasks
            data.incompleteTasks = (await Database
                .from('tasks')
                .whereNot('status', '4')
                .count('*', 'incompleteTasks'))[0].incompleteTasks;

            // unpaidInvoices
            data.unpaidInvoices = (await Database
                .from('invoices')
                .where('paid', false)
                .count('*', 'unpaidInvoices'))[0].unpaidInvoices;

            // leads
            data.leads = (await Database
                .from('leads')
                .count('*', 'leads'))[0].leads;

            // activeClients
            data.activeClients = (await Database
                .from('clients')
                .where('deleted', false)
                .count('*', 'activeClients'))[0].activeClients;

            // activeEmployees
            data.activeEmployees = (await Database
                .from('employees')
                .where('deleted', false)
                .count('*', 'activeEmployees'))[0].activeEmployees;

            // activeCompanies
            data.activeCompanies = (await Database
                .from('companies')
                .where('deleted', false)
                .count('*', 'activeCompanies'))[0].activeCompanies;

            //activeRegisters
            data.activeRegisters = (await Database
                .from('register_masters')
                .where('active', true)
                .count('*', 'activeRegisters'))[0].activeRegisters;

            // deletedClients
            data.deletedClients = (await Database
                .from('clients')
                .where('deleted', true)
                .count('*', 'deletedClients'))[0].deletedClients;

            // deletedEmployees
            data.deletedEmployees = (await Database
                .from('employees')
                .where('deleted', true)
                .count('*', 'deletedEmployees'))[0].deletedEmployees;

            // deletedCompanies
            data.deletedCompanies = (await Database
                .from('companies')
                .where('deleted', true)
                .count('*', 'deletedCompanies'))[0].deletedCompanies;

            // completedTasks
            data.completedTasks = (await Database
                .from('tasks')
                .where('status', 4)
                .count('*', 'completedTasks'))[0].completedTasks;

            // paidInvoices
            data.paidInvoices = (await Database
                .from('invoices')
                .where('paid', true)
                .count('*', 'paidInvoices'))[0].paidInvoices;

            //archivedInvoices
            data.archivedInvoices = (await Database
                .from('archived_invoices')
                .count('*', 'archivedInvoices'))[0].archivedInvoices;

            //archivedTasks
            data.archivedTasks = (await Database
                .from('archived_tasks')
                .count('*', 'archivedTasks'))[0].archivedTasks;

            //archivedRegisters
            data.archivedRegisters = (await Database
                .from('register_masters')
                .where('active', false)
                .count('*', 'archivedRegisters'))[0].archivedRegisters;

            //database space used
            data.dbSize = StringUtils.formatBytes((await Database
                .rawQuery("SELECT pg_database_size('" + Env.get('PG_DB_NAME', 'postgres') + "');")
            ).rows[0].pg_database_size)

            //file space used

            data.filesSize = StringUtils.formatBytes(await DashboardController.getFolderSize(Application.makePath('/file')));

            response.send(data);

        } catch (e) {
            console.log(e);

            response.send({
                status: "error",
                message: "some error occured"
            });
        }
    }

}
