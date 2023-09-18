import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { DateTime } from 'luxon';

import ResponseUtils from 'App/Utils/ResponseUtils';

import ClientRequestsHandler from 'App/RequestHandlers/ClientRequestHandler';

import Client from 'App/Models/Client';

import ClientDAO from 'App/Dao/ClientDAO';
import MasterTemplateDAO from 'App/Dao/MasterTemplateDAO';
import SchedulerDAO from 'App/Dao/SchedulerDAO';
import DynamicRegisterDAO from 'App/Dao/DynamicRegisterDAO';
import RegisterMasterDAO from 'App/Dao/RegisterMasterDAO';

export default class ClientsController {

    public static dateOptions = {
        serialize: (value) => {
            if (value) {
                return DateTime.fromJSDate(value).toLocaleString(DateTime.DATE_MED);
            } else {
                return value
            }
        }
    }

    public async index({ request, response }: HttpContextContract) {
        try {
            let data: Client[] = [];
            const { validation, body } = ClientRequestsHandler.indexClientHandler(request);

            // Request Validation
            if (validation.error) {
                ResponseUtils.ErrorResponse(response, validation.error.details[0].message);
                return;
            }

            // Get Client Columns
            const columns = await MasterTemplateDAO.getAllClientColumns();

            // Set Client Columns
            ClientDAO.setClientModelColumns(columns);

            // Get clients
            if (body.deleted) {
                data = await ClientDAO.getDeletedClients();
            } else {
                data = await ClientDAO.getActiveClients();
            }

            ResponseUtils.SuccessResponse(response, data);
        } catch (e) {
            console.log(e);

            ResponseUtils.CommonErrorResponse(response);
        }
    }

    public async indexMaster({ request, response }: HttpContextContract) {
        try {
            let data: Client[] = [];
            const { validation, body } = ClientRequestsHandler.indexMasterClientHandler(request);

            // Request Validation
            if (validation.error) {
                ResponseUtils.ErrorResponse(response, validation.error.details[0].message);
                return;
            }

            // Get Client Columns
            const columns = await MasterTemplateDAO.getMasterClientColumns();

            // Set Client Columns
            ClientDAO.setClientModelColumns(columns);

            // Get clients
            if (body.deleted) {
                data = await ClientDAO.getDeletedClients();
            } else {
                data = await ClientDAO.getActiveClients();
            }

            ResponseUtils.SuccessResponse(response, data);
        } catch (e) {
            console.log(e);

            ResponseUtils.CommonErrorResponse(response);
        }
    }

    public async get({ request, response }: HttpContextContract) {
        try {
            let data: Client | null;
            const { validation, body } = ClientRequestsHandler.getClientHandler(request);

            // Request Validation
            if (validation.error) {
                ResponseUtils.ErrorResponse(response, validation.error.details[0].message);
                return;
            }

            // Get Client Columns
            const columns = await MasterTemplateDAO.getAllClientColumns();

            // Set Client Columns
            ClientDAO.setClientModelColumns(columns);

            // Get client by id
            data = await ClientDAO.getClientById(body.id);

            // Send Response
            if (data != null) {
                ResponseUtils.SuccessResponse(response, data);
            } else {
                ResponseUtils.ErrorResponse(response, "No data found");
            }
        } catch (e) {
            console.log(e);

            ResponseUtils.CommonErrorResponse(response);
        }
    }

    public async options({ response }: HttpContextContract) {
        try {
            const clientOptions = await ClientDAO.getClientIdAndNameMap();

            ResponseUtils.SuccessResponse(response, clientOptions);
        } catch (e) {
            console.log(e);

            ResponseUtils.CommonErrorResponse(response);
        }
    }

    public async create({ request, response }: HttpContextContract) {
        try {
            const { validation, body } = ClientRequestsHandler.createClientHandler(request);

            // Request Validation
            if (validation.error) {
                ResponseUtils.ErrorResponse(response, validation?.error?.details[0].message);
                return;
            }

            // set data from validated body
            const files = body.files;
            const services = body.services;
            const client = body.client;
            
            // set client columns TODO : will be changed.... to only set once and when schema changes
            const columns = await MasterTemplateDAO.getAllClientColumns();
            await ClientDAO.setClientModelColumns(columns);

            // Add client
            const insertedClient = await ClientDAO.createClient(client);
            // Create schedulers object from service json
            const { schedulers } = await SchedulerDAO.getSchedulersFromServiceJSON(services, insertedClient.id);

            // Add files after client id is set
            await ClientDAO.addClientFiles(insertedClient, files);
            // create files after client id is set
            await SchedulerDAO.createSchedulers(schedulers);

            ResponseUtils.SuccessResponse(response, insertedClient);
        } catch (e) {
            console.log(e);

            ResponseUtils.CommonErrorResponse(response);
        }
    }

    public async update({ request, response }: HttpContextContract) {
        try {

            const { validation, body } = ClientRequestsHandler.updateClientHandler(request);

            // Request Validation
            if (validation.error) {
                ResponseUtils.ErrorResponse(response, validation?.error?.details[0].message);
                return;
            }

            // set data from validated body
            const files = body.files;
            const services = body.services;
            const client = body.client;
            const oldClient = await ClientDAO.getClientById(client.id);

            // set client columns TODO : will be changed.... to only set once and when schema changes
            const columns = await MasterTemplateDAO.getAllClientColumns();
            await ClientDAO.setClientModelColumns(columns);

            // Create schedulers object from service json
            const { schedulers, uncheckedSchedulers } = await SchedulerDAO.getSchedulersFromServiceJSON(services, client.id);
            
            const { newSchedulers, updatedSchedulers, deletedSchedulerIds } = await SchedulerDAO.segregateSchedulers(schedulers, uncheckedSchedulers);
            
            // Create New Schedulers
            await SchedulerDAO.createSchedulers(newSchedulers);
            // Update Schedulers
            await SchedulerDAO.updateSchedulers(updatedSchedulers);
            // Delete unchecked Schedulers
            await SchedulerDAO.deleteSchedulers(deletedSchedulerIds);
            
            // Delete files
            await ClientDAO.removeDeletedClientFiles(columns, client, oldClient);
            // Update client
            const updatedClient = await ClientDAO.updateClient(client);
            // Insert new files
            await ClientDAO.addClientFiles(updatedClient, files);

            ResponseUtils.SuccessResponse(response, client);

        } catch (e) {
            console.log(e);

            ResponseUtils.CommonErrorResponse(response);
        }
    }

    public async bulkServiceUpdate({ request, response }: HttpContextContract) {
        try {
            const { validation, body } = ClientRequestsHandler.bulkServiceUpdateClientHandler(request);

            // Request Validation
            if (validation.error) {
                ResponseUtils.ErrorResponse(response, validation?.error?.details[0].message);
                return;
            }

            const { schedulers, uncheckedSchedulers } = await SchedulerDAO.getSchedulersFromServiceJSON(body.schedulers, 0);

            const unchecked_service_ids = uncheckedSchedulers.map(e => e.service_id);
            const checked_service_ids = schedulers.map(e => e.service_id);

            // Delete Other schedulers if remove old is true
            if(body.remove_old){
                await SchedulerDAO.deleteSchedulersByClientAndServiceId(body.client_ids, unchecked_service_ids);
            }
            
            await SchedulerDAO.deleteSchedulersByClientAndServiceId(body.client_ids, checked_service_ids);

            await SchedulerDAO.createSchedulersForClients(body.client_ids, schedulers);

            ResponseUtils.SuccessResponse(response);
        } catch (e) {
            console.log(e);

            ResponseUtils.CommonErrorResponse(response);
        }
    }

    public async remove({ request, response }: HttpContextContract) {
        try {
            const { validation, body } = ClientRequestsHandler.removeClientHandler(request);

            // Request Validation
            if (validation.error) {
                ResponseUtils.ErrorResponse(response, validation?.error?.details[0].message);
                return;
            }

            await ClientDAO.removeClientByIds(body.client_ids);

            ResponseUtils.SuccessResponse(response);
        } catch (e) {
            console.log(e);

            ResponseUtils.CommonErrorResponse(response);
        }
    }

    public async restore({ request, response }: HttpContextContract) {
        try {
            const { validation, body } = ClientRequestsHandler.restoreClientHandler(request);

            // Request Validation
            if (validation.error) {
                ResponseUtils.ErrorResponse(response, validation?.error?.details[0].message);
                return;
            }

            await ClientDAO.restoreClientByIds(body.client_ids);

            ResponseUtils.SuccessResponse(response);
        } catch (e) {
            console.log(e);

            ResponseUtils.CommonErrorResponse(response);
        }
    }

    public async destroy({ request, response }: HttpContextContract) {
        try {
            const { validation, body } = ClientRequestsHandler.deleteClientHandler(request);

            // Request Validation
            if (validation.error) {
                ResponseUtils.ErrorResponse(response, validation?.error?.details[0].message);
                return;
            }

            const client_ids = body.client_ids;
            const activeRegisters = await RegisterMasterDAO.getActiveRegisters();

            // Delete all files for clients
            await ClientDAO.deleteClientFiles(client_ids);

            // Set group of clients to null having deleted clients as parents
            await ClientDAO.removeGroupsFromClients(client_ids);

            // Delete Schedulers for clients
            await SchedulerDAO.deleteSchedulersByClientId(client_ids);

            // Delete entries of clients from registers
            await DynamicRegisterDAO.deleteClientsFromRegisters(client_ids, activeRegisters);

            // Delete clients permanently
            await ClientDAO.deleteClients(client_ids);

            ResponseUtils.SuccessResponse(response);
        } catch (e) {
            console.log(e);

            ResponseUtils.CommonErrorResponse(response);
        }
    }
}
