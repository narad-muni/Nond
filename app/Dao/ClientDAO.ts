import fs from 'fs';
import { DateTime } from 'luxon';

import MasterTemplate from 'App/Models/MasterTemplate';
import { MultipartFileContract } from '@ioc:Adonis/Core/BodyParser';
import Application from '@ioc:Adonis/Core/Application';
import TableManager from 'App/Utils/TableManager';

// For type checking
const Client = TableManager.getTable('clients', TableManager.MODE.FULL);

export default class ClientDAO {

    public static DateOptions = {
        serialize: (value) => {
            if (value instanceof Date) {
                return DateTime.fromJSDate(value).toFormat('d LLL yyyy');
            } else if(value instanceof DateTime){
                return value.toFormat('d LLL yyyy');
            } else {
                return value
            }
        }
    }

    public static async getClientIdAndNameMap() {
        // Get models
        const Client = TableManager.getTable('clients', TableManager.MODE.FULL);

        const clients = await Client
            .query()
            .select('id', 'name');

        const serilizedClients = clients.map(e => e.serialize());

        serilizedClients.map(e => {
            e.value = e.id;

            delete e.id;
        });

        return serilizedClients;
    }

    public static async getClientById(id: number) {
        // Get models
        const Client = TableManager.getTable('clients', TableManager.MODE.FULL);

        const client = await Client
            .query()
            .preload('group', (query) => {
                query.select('id', 'name')
            })
            .preload('subsidiary', (query) => {
                query.select('id', 'name')
            })
            .preload('services', (query) => {
                query.select('id', 'next', 'frequency', 'service_id', 'client_id', 'count')
            })
            .where('id', id)
            .first();

        return client;
    }

    public static async getClientsByIds(ids: number[]) {
        // Get models
        const Client = TableManager.getTable('clients', TableManager.MODE.FULL);

        const client = await Client
            .query()
            .preload('group', (query) => {
                query.select('id', 'name', 'email')
            })
            .preload('subsidiary', (query) => {
                query.select('id', 'name', 'email')
            })
            .preload('services', (query) => {
                query.select('id', 'next', 'frequency', 'service_id', 'client_id', 'count')
            })
            .whereIn('id', ids);

        return client;
    }

    public static async getDeletedClients() {
        // Get models
        const Client = TableManager.getTable('clients', TableManager.MODE.FULL);

        const clients = await Client
            .query()
            .preload('group', (query) => {
                query.select('id', 'name')
            })
            .where('deleted', true);

        return clients;
    }

    public static async getActiveClients() {
        // Get models
        const Client = TableManager.getTable('clients', TableManager.MODE.FULL);

        const clients = await Client
            .query()
            .preload('group', (query) => {
                query.select('id', 'name')
            })
            .where('deleted', false);

        return clients;
    }

    public static async getAllClients() {
        // Get models
        const Client = TableManager.getTable('clients', TableManager.MODE.FULL);

        const clients = await Client
            .query()
            .preload('group', (query) => {
                query.select('id', 'name')
            });

        return clients;
    }

    public static async createClient(client: typeof Client): Promise<typeof Client> {
        // Get models
        const Client = TableManager.getTable('clients', TableManager.MODE.FULL);

        const insertedClient = await Client.create(client);

        insertedClient.group_id = insertedClient.group_id || insertedClient.id;

        await insertedClient.save();

        return insertedClient;

    }
    public static async createClients(clients: typeof Client[]): Promise<typeof Client[]> {
        // Get models
        const Client = TableManager.getTable('clients', TableManager.MODE.FULL);
        
        return await Client.createMany(clients);
    }

    public static async addClientFiles(client: typeof Client, files: MultipartFileContract[]): Promise<typeof Client> {
        // Get models
        const Client = TableManager.getTable('clients', TableManager.MODE.FULL);
        
        Object.values(files).forEach(file => {
            const path = `/file/client/${client.id}/`;
            const file_name = `${file.fieldName}.${file.extname}`;

            file.move(Application.makePath(path), {
                name: file_name,
                overwrite: true,
            });

            client[file.fieldName] = path + file_name;
        });

        return await client.save();
    }

    public static async removeDeletedClientFiles(columns: MasterTemplate[], updatedClient: typeof Client, oldClient: typeof Client | null) {

        columns.push(
            {
                column_type: 'File',
                column_name: 'logo'
            } as MasterTemplate
        )

        columns.push(
            {
                column_type: 'File',
                column_name: 'signature'
            } as MasterTemplate
        )

        for (const column of columns) {
            // Continue if column is not file
            if (column.column_type != 'File') continue;
            // Continue if file exists
            if (updatedClient[column.column_name]) continue;

            // Get old file path
            const path = oldClient?.[column.column_name];

            // Delete old file
            try {
                fs.unlinkSync(Application.makePath(path));
            } catch (err) { }
        }
    }

    public static async deleteClientFiles(client_ids: number[]) {
        client_ids.forEach(id => {
            try {
                fs.rmSync(Application.makePath(`/file/client/${id}`), { recursive: true, force: true });
            } catch { }
        });
    }

    public static async updateClient(client: typeof Client): Promise<typeof Client> {
        // Get models
        const Client = TableManager.getTable('clients', TableManager.MODE.FULL);
        
        const updatedClient = await Client.findByOrFail('id', client.id);

        return await updatedClient
            .merge(client.serialize())
            .save();
    }

    public static async removeClientByIds(client_ids: number[]) {
        // Get models
        const Client = TableManager.getTable('clients', TableManager.MODE.FULL);

        await Client
            .query()
            .whereIn('id', client_ids)
            .update({ deleted: true });
    }

    public static async restoreClientByIds(client_ids: number[]) {
        // Get models
        const Client = TableManager.getTable('clients', TableManager.MODE.FULL);

        await Client
            .query()
            .whereIn('id', client_ids)
            .update({ deleted: false });
    }

    public static async deleteClients(client_ids: number[]) {
        // Get models
        const Client = TableManager.getTable('clients', TableManager.MODE.FULL);

        await Client
            .query()
            .whereIn('id', client_ids)
            .delete();
    }

    public static async removeGroupsFromClients(group_ids: number[]) {
        // Get models
        const Client = TableManager.getTable('clients', TableManager.MODE.FULL);
        
        await Client
            .query()
            .whereIn('group_id', group_ids)
            .update({ 'group_id': null });
    }

}
