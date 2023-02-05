import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'employees'

    public async up () {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id');
            table.string('username');
            table.string('password');
            table.integer('role_id');
            table.boolean('is_admin');
            table.boolean('deleted').defaultTo(false)

            /**
             * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
             */
            table.timestamp('created_at', { useTz: true })
            table.timestamp('updated_at', { useTz: true })
        });

    }

    public async down () {
        this.schema.dropTable(this.tableName)
    }
}
