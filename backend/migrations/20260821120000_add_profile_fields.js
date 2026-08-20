exports.up = function(knex) {
  return knex.schema.table('users', (table) => {
    table.string('pronouns', 50).nullable();
    table.text('bio').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('pronouns');
    table.dropColumn('bio');
  });
};