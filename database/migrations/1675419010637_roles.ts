import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'roles'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table.string('name')
            table.json('read')
            table.json('create')
            table.json('update')
            table.json('remove')
            table.json('destroy')

            /**
             * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
             */
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
