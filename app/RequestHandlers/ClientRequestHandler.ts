import { RequestContract } from '@ioc:Adonis/Core/Request';
import ClientValidator from 'App/Validators/ClientValidator';
import { MultipartFileContract } from '@ioc:Adonis/Core/BodyParser';
import Scheduler from 'App/Models/Scheduler';

import TableManager from 'App/Utils/TableManager';

const Client = TableManager.getTable('clients', TableManager.MODE.FULL);

export default class ClientRequestsHandler {

    public static indexClientHandler(request: RequestContract) {

        // Schema
        interface indexClientSchema {
            deleted: boolean,
        }
        const body = {} as indexClientSchema;

        // Set data
        body.deleted = request.param('deleted') == 'true';

        // Validation
        const validation = ClientValidator.indexValidator(body);

        return { validation, body };
    }

    public static indexMasterClientHandler(request: RequestContract) {

        // Schema
        interface indexMasterSchema {
            deleted: boolean,
        }
        const body = {} as indexMasterSchema;

        // Set data
        body.deleted = request.param('deleted') == 'true';

        // Validation
        const validation = ClientValidator.indexValidator(body);

        return { validation, body };
    }

    public static getClientHandler(request: RequestContract) {

        // Schema
        interface getClientdySchema {
            id: number,
        }
        const body = {} as getClientdySchema;

        // Set data
        body.id = Number(request.param('id'));

        // Validation
        const validation = ClientValidator.getValidator(body);

        return { validation, body };
    }

    public static createClientHandler(request: RequestContract) {
        // Schema
        interface createClientFiles {
            file: MultipartFileContract,
            value: string
        }

        interface createClientSchema {
            client: typeof Client,
            files: createClientFiles[],
            services: object,
        }

        const body = {
            files:[] as createClientFiles[]
        } as createClientSchema;
        
        const client = {} as typeof Client;

        // Get Data
        const payload = request.all();
        const files = request.allFiles() as any as MultipartFileContract[];

        // Clean Data
        Object.keys(payload).forEach(e => {
            if (payload[e] == "null" || String(payload[e]) == "") {
                payload[e] = null;
            }
        });

        // Set files
        Object.keys(files).forEach(column => {
            // Set each file with value
            body.files.push({
                value: payload["value__"+column],
                file: files[column]
            })

            delete payload["value__"+column];
        });

        body.services = JSON.parse(payload.services);

        delete payload.services;

        // Set empty file text
        for (let field of Object.keys(payload)) {
            if(field.startsWith("value__")) {
                field = field.substr(7);

                client[field] = {
                    value: payload["value__"+field],
                    path: null
                };

                delete payload[field];
                delete payload["value__"+field];
            }
        }

        // Set remaining client columns
        for (const [field, value] of Object.entries(payload)) {
            client[field] = value;
        }

        body.client = client;

        // Validation
        const validation = ClientValidator.createValidator(body);

        return { validation, body };
    }

    public static updateClientHandler(request: RequestContract) {

        const Client = TableManager.getTable('clients', TableManager.MODE.FULL);
        
        // Schema
        interface updateClientFiles {
            file: MultipartFileContract,
            value: string
        }

        interface updateClientSchema {
            client: typeof Client,
            files: updateClientFiles[],
            services: object,
        }

        const body = {
            files:[] as updateClientFiles[]
        } as updateClientSchema;

        const client = new Client();

        // Get Data
        const payload = request.all();
        const files = request.allFiles() as any as MultipartFileContract[];

        // Clean Data
        Object.keys(payload).forEach(e => {
            if (payload[e] == "null" || String(payload[e]) == "") {
                payload[e] = null;
            }
        });

        // Set new files, this will be added to client model by dao
        Object.keys(files).forEach(column => {
            body.files.push({
                value: payload["value__"+column],
                file: files[column]
            });

            delete payload["value__"+column];
        });

        body.services = JSON.parse(payload.services);

        delete payload.subsidiary;
        delete payload.services;
        delete payload.group;

        // Set existing file fields
        for (let field of Object.keys(payload)) {
            if(field.startsWith("value__")) {
                field = field.substr(7);

                client[field] = {
                    value: payload["value__"+field],
                    path: files[field] || payload[field]
                };

                delete payload[field];
                delete payload["value__"+field];
            }
        }

        // Set remaining client columns
        for (const [field, value] of Object.entries(payload)) {
            client[field] = value;
        }

        client.group_id = client.group_id || client.id;

        body.client = client;

        // Validation
        const validation = ClientValidator.updateValidator(body);

        return { validation, body };
    }

    public static bulkServiceUpdateClientHandler(request: RequestContract) {
        // Schema
        interface bulkServiceUpdateClientSchema {
            schedulers: Scheduler[],
            client_ids: number[],
            remove_old: boolean
        }
        const body = {} as bulkServiceUpdateClientSchema;

        const payload = request.all();

        // Set Data
        body.client_ids = payload.client_ids;
        body.remove_old = payload.remove_old;
        body.schedulers = payload.schedulers;

        // Validation
        const validation = ClientValidator.bulkServiceUpdateClientValidator(body);

        return { validation, body };
    }

    public static removeClientHandler(request: RequestContract) {
        // Schema
        interface bulkServiceUpdateClientSchema {
            client_ids: number[]
        }
        const body = {} as bulkServiceUpdateClientSchema;

        const payload = request.all();

        // Set Data
        body.client_ids = payload.id;

        // Validation
        const validation = ClientValidator.removeClientValidator(body);

        return { validation, body };
    }

    public static restoreClientHandler(request: RequestContract) {
        // Schema
        interface restoreClientSchema {
            client_ids: number[]
        }
        const body = {} as restoreClientSchema;

        const payload = request.all();

        // Set Data
        body.client_ids = payload.id;

        // Validation
        const validation = ClientValidator.restoreClientValidator(body);

        return { validation, body };
    }

    public static deleteClientHandler(request: RequestContract) {
        // Schema
        interface deleteClientSchema {
            client_ids: number[]
        }
        const body = {} as deleteClientSchema;

        const payload = request.all();

        // Set Data
        body.client_ids = payload.id;

        // Validation
        const validation = ClientValidator.deleteClientValidator(body);

        return { validation, body };
    }

}
