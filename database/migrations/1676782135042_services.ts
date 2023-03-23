import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'services'

    public async up () {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id');
            table.string('name');
            table.integer('hsn');
            table.integer('gst');
            table.integer('template_id');
        })
    }

    public async down () {
        this.schema.dropTable(this.tableName)
    }
}
