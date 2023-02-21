import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'master_templates'

    public async up () {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id');
            table.string('table_name');
            table.string('column_name');
            table.string('display_name');
            table.string('column_type');
            table.boolean('is_master');
       })
    }

    public async down () {
        this.schema.dropTable(this.tableName)
    }
}