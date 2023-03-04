import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'task_templates'

    public async up () {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id');
            table.string('name');
            table.string('title');
            table.string('description');
            table.integer('service');
            table.integer('status');
            table.integer('priority');
        })
    }

    public async down () {
        this.schema.dropTable(this.tableName)
    }
    }
