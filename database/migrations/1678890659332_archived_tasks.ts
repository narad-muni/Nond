import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'archived_tasks'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.integer('id').primary();
            table.string('assigned_to');
            table.string('client');
            table.integer('status');
            table.integer('priority');
            table.specificType('money', 'json[]');
            table.specificType('time', 'json[]');
            table.string('total_time');
            table.integer('total_money');
            table.boolean('billed');
            table.string('invoice_id');
            table.string('group');
            table.string('title');
            table.string('description');
            table.string('service');
            table.date('created');
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
