import MasterTemplate from 'App/Models/MasterTemplate';

export default class MasterTemplateDAO {

    public static async getAllClientColumns() {
        const columns = await MasterTemplate
            .query()
            .where('is_master', true)
            .where('table_name', 'clients');

        return columns;
    }

    public static async getMasterClientColumns() {
        const columns = await MasterTemplate
            .query()
            .where('is_master', true)
            .where('table_name', 'clients');

        return columns;
    }

}
