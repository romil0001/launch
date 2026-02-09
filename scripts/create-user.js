require('dotenv').config();

const bcrypt = require('bcryptjs');
const { Client } = require('pg');

const args = process.argv.slice(2);
const getArg = (name) => {
  const index = args.findIndex((arg) => arg === `--${name}`);
  if (index === -1) return null;
  return args[index + 1];
};

async function run() {
  const email = getArg('email');
  const password = getArg('password');
  const rolesArg = getArg('roles') || 'Sales';

  if (!email || !password) {
    console.error('Usage: npm run create:user -- --email you@example.com --password Secret123 --roles Admin,Sales');
    process.exit(1);
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('Missing DATABASE_URL in environment.');
    process.exit(1);
  }

  const client = new Client({ connectionString });
  await client.connect();

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const userResult = await client.query(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
       RETURNING id, email`,
      [email.toLowerCase(), passwordHash]
    );

    const user = userResult.rows[0];
    const roles = rolesArg.split(',').map((role) => role.trim());
    const roleRows = await client.query(
      `SELECT id, name FROM roles WHERE name = ANY($1)`,
      [roles]
    );

    if (!roleRows.rowCount) {
      throw new Error('No matching roles found.');
    }

    await client.query('DELETE FROM user_roles WHERE user_id = $1', [user.id]);

    for (const role of roleRows.rows) {
      await client.query(
        `INSERT INTO user_roles (user_id, role_id)
         VALUES ($1, $2)`,
        [user.id, role.id]
      );
    }

    console.log(`User ready: ${user.email} (${roles.join(', ')})`);
  } finally {
    await client.end();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
