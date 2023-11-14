import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'automators'

    public async up () {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id')
            table.integer('triggered_by')
            table.string('name')
            table.string('status')
            table.string('message')
            table.json('data')
            table.datetime('created_on')
        })
    }

    public async down () {
        this.schema.dropTable(this.tableName)
    }
}
