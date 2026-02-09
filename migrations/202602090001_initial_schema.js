exports.up = async function up(knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS \"pgcrypto\"');
  await knex.schema
    .createTable('roles', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name').notNullable().unique();
      table.timestamps(true, true);
    })
    .createTable('users', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('email').notNullable().unique();
      table.string('name');
      table.string('password_hash').notNullable();
      table.timestamps(true, true);
    })
    .createTable('user_roles', (table) => {
      table.uuid('user_id').notNullable().references('users.id').onDelete('CASCADE');
      table.uuid('role_id').notNullable().references('roles.id').onDelete('CASCADE');
      table.primary(['user_id', 'role_id']);
      table.timestamps(true, true);
    })
    .createTable('customers', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name').notNullable();
      table.string('email');
      table.string('phone');
      table.timestamps(true, true);
    })
    .createTable('leads', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name').notNullable();
      table.string('email').notNullable();
      table.string('phone');
      table
        .enu('status', [
          'New',
          'Contacted',
          'Follow-Up',
          'Quotation Sent',
          'Converted',
          'Lost',
        ])
        .notNullable()
        .defaultTo('New');
      table.text('notes');
      table
        .uuid('owner_id')
        .references('users.id')
        .onDelete('SET NULL');
      table.timestamps(true, true);
    })
    .createTable('audit_logs', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table
        .uuid('actor_id')
        .references('users.id')
        .onDelete('SET NULL');
      table.string('action').notNullable();
      table.jsonb('metadata').notNullable().defaultTo('{}');
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    });

  await knex('roles').insert([
    { name: 'Admin' },
    { name: 'Sales' },
    { name: 'Service' },
    { name: 'Customer' },
    { name: 'StoreManager' },
  ]);
};

exports.down = async function down(knex) {
  await knex.schema
    .dropTableIfExists('audit_logs')
    .dropTableIfExists('leads')
    .dropTableIfExists('customers')
    .dropTableIfExists('user_roles')
    .dropTableIfExists('users')
    .dropTableIfExists('roles');
};
