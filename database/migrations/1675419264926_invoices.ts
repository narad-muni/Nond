import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'invoices'

    public async up () {
        this.schema.createTable(this.tableName, (table) => {
            table.string('id');
            table.integer('client_id');
            table.integer('company_id');
            table.json('particulars');
            table.boolean('paid');
            table.boolean('gst');
            table.string('remarks');
            table.float('total');
            table.float('tax');
            table.boolean('deleted').defaultTo(false)
            table.date('date');

            /**
             * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
             */
       })
    }

    public async down () {
        this.schema.dropTable(this.tableName)
    }
}
