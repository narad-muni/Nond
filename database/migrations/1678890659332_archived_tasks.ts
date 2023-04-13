import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'archived_tasks'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
        table.integer('id').primary();
        table.string('assigned_to');
        table.string('client');
        table.string('group');
        table.string('title');
        table.string('description');
        table.string('service');
        table.date('created');
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
