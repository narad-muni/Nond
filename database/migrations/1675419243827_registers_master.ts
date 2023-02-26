import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'register_masters'

    public async up () {
        this.schema.createTable(this.tableName, (table) => {
        table.increments('id');
        table.string('name');
        table.integer('service_id');
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
