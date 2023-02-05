import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'invoices'

    public async up () {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id');
            table.integer('client_id');
            table.json('description');
            table.integer('paid');
            table.integer('pending');
            table.boolean('deleted').defaultTo(false)

            /**
             * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
             */
       })
    }

    public async down () {
        this.schema.dropTable(this.tableName)
    }
}
