import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'registers'

    public async up () {
        this.schema.createTable(this.tableName, (table) => {
        table.increments('id');
        table.string('name');
        table.json('columns');
        table.integer('template_id');
        table.boolean('is_active');
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
