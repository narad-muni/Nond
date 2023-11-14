import fs from 'fs';
import { DateTime } from 'luxon';

import TableManager from 'App/Utils/TableManager';

// For type checking
const Company = TableManager.getTable('companies', TableManager.MODE.FULL);

export default class CompanyDAO {

    public static DateOptions = {
        serialize: (value) => {
            if (value) {
                return DateTime.fromJSDate(value).toLocaleString(DateTime.DATE_MED);
            } else {
                return value
            }
        }
    }

    public static async getCompanyIdAndNameMap() {
        // Get models
        const Company = TableManager.getTable('companies', TableManager.MODE.FULL);

        const companies = await Company
            .query()
            .select('id', 'name');

        const serilizedCompanies = companies.map(e => e.serialize());

        serilizedCompanies.map(e => {
            e.value = e.id;

            delete e.id;
        });

        return serilizedCompanies;
    }

    public static async getCompanyById(id: number) {
        // Get models
        const Company = TableManager.getTable('companies', TableManager.MODE.FULL);

        const company = await Company
            .query()
            .where('id', id)
            .first();

        return company;
    }

    public static async getCompaniesByIds(ids: number[]) {
        // Get models
        const Company = TableManager.getTable('companies', TableManager.MODE.FULL);

        const company = await Company
            .query()
            .whereIn('id', ids);

        return company;
    }

    public static async getDeletedCompanies() {
        // Get models
        const Company = TableManager.getTable('companies', TableManager.MODE.FULL);

        const companies = await Company
            .query()
            .where('deleted', true);

        return companies;
    }

    public static async getActiveCompanies() {
        // Get models
        const Company = TableManager.getTable('companies', TableManager.MODE.FULL);

        const companies = await Company
            .query()
            .where('deleted', false);

        return companies;
    }

    public static async getAllCompanies() {
        // Get models
        const Company = TableManager.getTable('companies', TableManager.MODE.FULL);

        const companies = await Company
            .query();

        return companies;
    }

}