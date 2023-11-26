import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'tasks'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table.integer('assigned_to');
            table.integer('client_id');
            table.string('title');
            table.string('description');
            table.integer('service_id');
            table.integer('status');
            table.integer('priority');
            table.string('invoice_id');
            table.specificType('money', 'json[]');
            table.specificType('time', 'json[]');
            table.integer('total_money');
            table.string('total_time');
            table.boolean('billed').defaultTo(false);
            table.date('created');
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
