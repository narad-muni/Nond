import { string } from '@ioc:Adonis/Core/Helpers';

import { BaseModel, BelongsTo, belongsTo, column} from '@ioc:Adonis/Lucid/Orm';

import MasterTemplateDAO from 'App/Dao/MasterTemplateDAO';
import RegisterTemplateDAO from 'App/Dao/RegisterTemplateDAO';
import RegisterMasterDAO from 'App/Dao/RegisterMasterDAO';

import MasterTemplate from 'App/Models/MasterTemplate';
import RegisterTemplate from 'App/Models/RegisterTemplate';

import {default as CompanyModel} from 'App/Models/Company';
import {default as ClientModel} from 'App/Models/Client';

export default class TableManager {
    
    static MODES = {
        FULL: 1,
        MASTER: 2,
        TEMPLATE: 3,
        TEMPLATE_ROLLOVER: 4,
    } as const;

    // @ts-ignore
    static FullTableMap = new Map<string, BaseModel>();
    // @ts-ignore
    static MasterTableMap = new Map<string, BaseModel>();
    // @ts-ignore
    static TemplateTableMap = new Map<string, BaseModel>();

    public static async init(){
        await this.loadClientsTable();
        await this.loadCompaniesTable();
        await this.loadTables();
    }

    public static async loadClientsTable(){
        for(const mode of Object.values(this.MODES)) {

            if(mode == this.MODES.TEMPLATE_ROLLOVER || mode == this.MODES.TEMPLATE) continue;
            
            const Client = ClientModel;

            // Fetch colums
            let columns: MasterTemplate[];

            if(mode == this.MODES.FULL){
                columns = await MasterTemplateDAO.getAllColumns(Client.table);
            }else{
                columns = await MasterTemplateDAO.getMasterColumns(Client.table);
            }

            await MasterTemplateDAO.setColumns(Client, columns);

            this.setTable(Client, mode);
        }
    }

    public static async loadCompaniesTable(){
        for(const mode of Object.values(this.MODES)) {

            if(mode == this.MODES.TEMPLATE_ROLLOVER || mode == this.MODES.TEMPLATE) continue;
            
            const Company = CompanyModel;

            // Fetch colums
            let columns: MasterTemplate[];

            if(mode == this.MODES.FULL){
                columns = await MasterTemplateDAO.getAllColumns(Company.table);
            }else{
                columns = await MasterTemplateDAO.getMasterColumns(Company.table);
            }

            await MasterTemplateDAO.setColumns(Company, columns);

            this.setTable(Company, mode);
        }
    }

    public static async loadTables(){
        let activeRegisters = await RegisterMasterDAO.getActiveRegisters();
        
        for(const register of activeRegisters){
            await TableManager.loadTableByNameAndVersion(register.id, register.name, register.version);
        }
    }

    public static async loadTableById(table_id: number, mode?: typeof TableManager.MODES[keyof typeof TableManager.MODES]){
        const register = await RegisterMasterDAO.getRegisterById(table_id);

        await this.loadTableByNameAndVersion(register.id, register.name, register.version, mode);
    }

    public static async loadActiveTableByName(name: string, mode?: typeof TableManager.MODES[keyof typeof TableManager.MODES]){
        const register = await RegisterMasterDAO.getActiveRegisterByName(name);

        await this.loadTableByNameAndVersion(register.id, register.name, register.version, mode);
    }

    public static async loadTableByNameAndVersion(id:number, name: string, version: string, mode?: typeof TableManager.MODES[keyof typeof TableManager.MODES]){
        if(mode){
            await TableManager.loadTableByNameAndVersionMode(id, name, version, mode);
        }else{
            for(const mode of Object.values(TableManager.MODES)) {
                await TableManager.loadTableByNameAndVersionMode(id, name, version, mode);
            }
        }
    }

    public static async loadTableByNameAndVersionMode(id:number, name: string, version: string, mode: typeof TableManager.MODES[keyof typeof TableManager.MODES]){
        let table_name: string;
        const Client = this.getTable("clients", TableManager.MODES.FULL);


        if(mode == TableManager.MODES.TEMPLATE_ROLLOVER){
            table_name = string.escapeHTML("rollover__register__" + name + version);
        }else{
            table_name = string.escapeHTML("register__" + name + version);
        }

        class table extends BaseModel{
            public static table = table_name;

            @column({ isPrimary: true })
            public id: number

            @column()
            public client_id: number

            @belongsTo(() => Client, {
                foreignKey: 'client_id'
            })
            public __client: BelongsTo<typeof Client>
        }

        // Fetch colums
        let columns: RegisterTemplate[];

        if(mode == this.MODES.FULL){
            columns = await RegisterTemplateDAO.getAllColumns(id);
        }else if(mode == this.MODES.MASTER){
            columns = await RegisterTemplateDAO.getMasterColumns(id);
        }else{
            columns = await RegisterTemplateDAO.getTemplateColumns(id);
        }

        await RegisterTemplateDAO.setColumns(table, columns);

        this.setTable(table, mode);
    }

    // @ts-ignore
    public static setTable(table: BaseModel, mode: typeof TableManager.MODES[keyof typeof TableManager.MODES]){
        if(mode == TableManager.MODES.FULL){
            this.FullTableMap.set(table.table, table);
        }else if(mode == TableManager.MODES.MASTER){
            this.MasterTableMap.set(table.table, table);
        }else{
            this.TemplateTableMap.set(table.table, table);
        }
    }

    public static deleteTable(table_name: string, mode: typeof TableManager.MODES[keyof typeof TableManager.MODES]){
        if(mode == TableManager.MODES.FULL){
            this.FullTableMap.delete(table_name);
        }else if(mode == TableManager.MODES.MASTER){
            this.MasterTableMap.delete(table_name);
        }else{
            this.TemplateTableMap.delete(table_name);
        }
    }

    // @ts-ignore
    public static getTable(table_name: string, mode: typeof TableManager.MODES[keyof typeof TableManager.MODES]): BaseModel{
        console.log("hi");
        let table;

        if(mode == TableManager.MODES.FULL){
            table = this.FullTableMap.get(table_name);
        }else if(mode == TableManager.MODES.MASTER){
            table = this.MasterTableMap.get(table_name);
        }else{
            table = this.TemplateTableMap.get(table_name);
        }

        if(table){
            return table;
        }else{
            throw new Error("Error, table "+ table_name +" not found in table manager map");
        }
    }

}