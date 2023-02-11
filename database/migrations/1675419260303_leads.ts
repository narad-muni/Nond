import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'leads'

    public async up () {
        this.schema.createTable(this.tableName, (table) => {
        table.increments('id')
        table.string('client');
        table.string('status');
        table.integer('assigned_to');
        table.string('description');
        table.date('started');
        })
    }

    public async down () {
        this.schema.dropTable(this.tableName)
    }
}
