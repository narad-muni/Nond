import RegisterMaster from "App/Models/RegisterMaster";

export default class RegisterMasterDAO {
    public static async getActiveRegisters(): Promise<RegisterMaster[]> {
        return await RegisterMaster
            .query()
            .select('id', 'name', 'version')
            .where('active', true);
    }

    public static async getRegisterById(register_id: number): Promise<RegisterMaster> {
        return await RegisterMaster
            .query()
            .select('id', 'name', 'version')
            .where('id', register_id)
            .firstOrFail();
    }

    public static async getActiveRegisterByName(register_name: string): Promise<RegisterMaster> {
        return await RegisterMaster
            .query()
            .select('id', 'name', 'version')
            .where('name', register_name)
            .where('active', true)
            .firstOrFail();
    }

    public static async getRegisterByNameAndVersion(register_name: string, register_version: string): Promise<RegisterMaster> {
        return await RegisterMaster
            .query()
            .select('id', 'name', 'version')
            .where('name', register_name)
            .where('version', register_version)
            .firstOrFail();
    }
}
