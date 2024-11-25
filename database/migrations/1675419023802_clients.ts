import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'clients'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id');
            table.string('name');
            table.string('email');
            table.json('gst');
            table.string('address');
            table.json('pan');
            table.json('signature');
            table.json('logo');
            table.integer('group_id');
            table.boolean('deleted').defaultTo(false);
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
