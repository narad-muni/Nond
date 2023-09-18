import { string } from '@ioc:Adonis/Core/Helpers';

import DynamicRegister from "App/Models/DynamicRegister";
import RegisterMaster from 'App/Models/RegisterMaster';

export default class DynamicRegisterDAO{

    public static async deleteClientsFromRegisters(client_ids: number[], activeRegisters: RegisterMaster[]){

        for await (const register of activeRegisters) {
            DynamicRegister.table = string.escapeHTML("register__" + register?.name + register?.version);

            await DynamicRegister
                .query()
                .whereIn('client_id', client_ids)
                .delete();
        }
    }
}