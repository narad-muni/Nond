import RegisterMaster from "App/Models/RegisterMaster";

export default class RegisterMasterDAO{
    public static async getActiveRegisters(): Promise<RegisterMaster[]>{
        return await RegisterMaster
            .query()
            .select('name', 'version')
            .where('active', true);
    }
}