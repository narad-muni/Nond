import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'register_masters'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id');
            table.string('name');
            table.string('version');
            table.integer('service_id');
            table.boolean('active');
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
