import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'schedulers'

    public async up () {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id');
            table.integer('type');
            table.date('next');
            table.string('frequency');
            table.json('data');
            table.integer('client_id');
            table.integer('count');
            table.integer('service_id');
            table.integer('register_id');
        })
    }

    public async down () {
        this.schema.dropTable(this.tableName)
    }
}
