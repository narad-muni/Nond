import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'templates'

    public async up () {
        this.schema.createTable(this.tableName, (table) => {
        table.increments('id')
        table.string('name')
        table.json('columns')
        table.json('client_columns')
        table.integer('cost')
        table.string('per')

        /**
         * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
         */
       })
    }

    public async down () {
        this.schema.dropTable(this.tableName)
    }
}
