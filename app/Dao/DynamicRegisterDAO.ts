import StringUtils from 'App/Utils/StringUtils'

import DynamicRegister from "App/Models/DynamicRegister";
import RegisterMaster from 'App/Models/RegisterMaster';

export default class DynamicRegisterDAO {

    public static async deleteClientsFromRegisters(client_ids: number[], activeRegisters: RegisterMaster[]) {

        for await (const register of activeRegisters) {
            DynamicRegister.table = StringUtils.sanitizeTableName("register__" + register?.name + register?.version);

            await DynamicRegister
                .query()
                .whereIn('client_id', client_ids)
                .delete();
        }
    }
}
