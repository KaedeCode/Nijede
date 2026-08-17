exports.up = function(knex) {
  return knex.schema.createTable('feedback', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL');
    table.string('email', 255).nullable();
    table.text('message').notNullable();
    table.string('type', 50).defaultTo('general');
    table.string('status', 50).defaultTo('new');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('feedback');
};