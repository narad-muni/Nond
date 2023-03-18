import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'registers'

    public async up () {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id');
            table.integer('master_id');
            table.string('suffix');
            table.boolean('active');
        })
    }

    public async down () {
        this.schema.dropTable(this.tableName)
    }
}
