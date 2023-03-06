import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'schedulers'

    public async up () {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id');
            table.integer('type');
            table.date('next');
            table.string('frequency');
            table.integer('client_id');
            table.integer('service_id');
        })
    }

    public async down () {
        this.schema.dropTable(this.tableName)
    }
}
