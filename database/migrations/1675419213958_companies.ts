import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'companies'

    public async up () {
        this.schema.createTable(this.tableName, (table) => {
        table.increments('id')
        table.string('name')
        table.string('gstin')
        table.string('email')
        table.string('signature')
        table.boolean('deleted').defaultTo(false)

        /**
         * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
         */
        table.timestamp('created_at', { useTz: true })
        table.timestamp('updated_at', { useTz: true })
        })
    }

    public async down () {
        this.schema.dropTable(this.tableName)
    }
}
