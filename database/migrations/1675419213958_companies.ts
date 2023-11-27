import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
    protected tableName = 'companies'

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id');
            table.string('name');
            table.string('invoice_prefix');
            table.string('gst');
            table.string('upi');
            table.string('email');
            table.string('address');
            table.string('pan');
            table.string('signature');
            table.string('logo');
            table.integer('invoice_counter').defaultTo(0);

            table.string("account_holder_name");
            table.string("bank_name");
            table.string("account_number");
            table.string("ifsc_branch");

            table.string('smtp_host');
            table.string('smtp_port');
            table.string('smtp_email');
            table.string('smtp_password');

            table.boolean('deleted').defaultTo(false);

            /**
             * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
             */
        })
    }

    public async down() {
        this.schema.dropTable(this.tableName)
    }
}
