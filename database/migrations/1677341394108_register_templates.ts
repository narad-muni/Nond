import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'register_templates'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id');
            table.integer('table_id');
            table.string('column_name');
            table.string('display_name');
            table.string('column_type');
            table.json('column_info');
            table.integer('order');
            table.integer('client_column_id');
            table.boolean('master');
            table.boolean('rollover');
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
