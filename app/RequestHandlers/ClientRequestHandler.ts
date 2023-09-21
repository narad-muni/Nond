import { RequestContract } from '@ioc:Adonis/Core/Request';
import ClientValidator from 'App/Validators/ClientValidator';
import { MultipartFileContract } from '@ioc:Adonis/Core/BodyParser';
import Scheduler from 'App/Models/Scheduler';

import TableManager from 'App/Utils/TableManager';

const Client = TableManager.getTable('clients', TableManager.MODES.FULL);

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
        interface createClientSchema {
            client: typeof Client,
            files: MultipartFileContract[],
            services: object,
        }
        const body = {} as createClientSchema;
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

        // Set data
        body.files = files;
        body.services = JSON.parse(payload._services);

        delete payload._services;

        // Set client columns
        for (const [field, value] of Object.entries(payload)) {
            client[field] = value;
        }

        body.client = client;

        // Validation
        const validation = ClientValidator.createValidator(body);

        return { validation, body };
    }

    public static updateClientHandler(request: RequestContract) {

        const Client = TableManager.getTable('clients', TableManager.MODES.FULL);
        
        // Schema
        interface updateClientSchema {
            client: typeof Client,
            files: MultipartFileContract[],
            services: object,
        }
        const body = {} as updateClientSchema;
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

        // Set data
        body.files = files;
        body.services = JSON.parse(payload._services);

        delete payload.subsidiary;
        delete payload._services;
        delete payload.services;
        delete payload.group;

        // Set client columns
        for (const [field, value] of Object.entries(payload)) {
            client[field] = value;
        }

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
