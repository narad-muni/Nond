import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'register_templates'

    public async up () {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id');

            table.string('name');

            table.json('columns');

            table.json('client_columns');
        })
    }

    public async down () {
        this.schema.dropTable(this.tableName)
    }
}
