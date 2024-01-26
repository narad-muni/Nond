import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'archived_invoices'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.string('id').primary();
            table.string('client');
            table.string('group');
            table.string('company');
            table.json('particulars');
            table.string('note');
            table.boolean('paid');
            table.boolean('gst');
            table.string('remarks');
            table.float('total');
            table.float('tax');
            table.date('date');
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
