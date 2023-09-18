import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'archived_register_templates'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id');
            table.integer('table_id');
            table.json('columns');
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
