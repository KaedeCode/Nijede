exports.up = function(knex) {
  return knex.schema.table('users', (table) => {
    table.date('birthdate').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('birthdate');
  });
};