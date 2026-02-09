const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { query } = require('./db');

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };
}

function getToken(event) {
  const header = event.headers.authorization || event.headers.Authorization;
  if (!header) return null;
  const [type, token] = header.split(' ');
  if (type !== 'Bearer' || !token) return null;
  return token;
}

async function getUserById(userId) {
  const userResult = await query(
    `SELECT id, email, name, created_at
     FROM users
     WHERE id = $1`,
    [userId]
  );
  if (!userResult.rowCount) return null;
  const rolesResult = await query(
    `SELECT roles.name
     FROM user_roles
     JOIN roles ON roles.id = user_roles.role_id
     WHERE user_roles.user_id = $1`,
    [userId]
  );
  return {
    ...userResult.rows[0],
    roles: rolesResult.rows.map((row) => row.name),
  };
}

function requireEnv(name) {
  if (!process.env[name]) {
    throw new Error(`Missing ${name} environment variable.`);
  }
  return process.env[name];
}

async function authenticate(event) {
  const token = getToken(event);
  if (!token) {
    return { error: jsonResponse(401, { error: 'Missing bearer token.' }) };
  }
  try {
    const secret = requireEnv('JWT_SECRET');
    const decoded = jwt.verify(token, secret);
    const user = await getUserById(decoded.sub);
    if (!user) {
      return { error: jsonResponse(401, { error: 'User not found.' }) };
    }
    return { user };
  } catch (error) {
    return { error: jsonResponse(401, { error: 'Invalid token.' }) };
  }
}

function requireRole(user, allowed) {
  const roles = user.roles || [];
  return roles.some((role) => allowed.includes(role));
}

async function writeAuditLog({ actorId, action, metadata }) {
  await query(
    `INSERT INTO audit_logs (actor_id, action, metadata)
     VALUES ($1, $2, $3)`,
    [actorId, action, metadata || {}]
  );
}

exports.handler = async (event) => {
  try {
    const path = event.path.replace('/.netlify/functions/api', '');
    const method = event.httpMethod.toUpperCase();

    if (path === '/auth/login' && method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const schema = z.object({
        email: z.string().email(),
        password: z.string().min(6),
      });
      const { email, password } = schema.parse(body);

      const userResult = await query(
        `SELECT id, email, name, password_hash
         FROM users
         WHERE email = $1`,
        [email.toLowerCase()]
      );

      if (!userResult.rowCount) {
        return jsonResponse(401, { error: 'Invalid credentials.' });
      }

      const user = userResult.rows[0];
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return jsonResponse(401, { error: 'Invalid credentials.' });
      }

      const rolesResult = await query(
        `SELECT roles.name
         FROM user_roles
         JOIN roles ON roles.id = user_roles.role_id
         WHERE user_roles.user_id = $1`,
        [user.id]
      );
      const roles = rolesResult.rows.map((row) => row.name);
      const secret = requireEnv('JWT_SECRET');
      const token = jwt.sign(
        { roles },
        secret,
        { subject: user.id, expiresIn: '8h' }
      );

      await writeAuditLog({
        actorId: user.id,
        action: 'login',
        metadata: { email: user.email },
      });

      return jsonResponse(200, {
        token,
        user: { id: user.id, email: user.email, name: user.name, roles },
      });
    }

    if (path === '/me' && method === 'GET') {
      const { user, error } = await authenticate(event);
      if (error) return error;

      return jsonResponse(200, { user });
    }

    if (path === '/leads' && method === 'GET') {
      const { user, error } = await authenticate(event);
      if (error) return error;

      if (!requireRole(user, ['Admin', 'Sales'])) {
        return jsonResponse(403, { error: 'Access denied.' });
      }

      const leadsResult = await query(
        `SELECT leads.id, leads.name, leads.email, leads.phone, leads.status,
                leads.notes, leads.updated_at,
                users.email as owner_email
         FROM leads
         LEFT JOIN users ON users.id = leads.owner_id
         ORDER BY leads.updated_at DESC
         LIMIT 200`
      );

      return jsonResponse(200, { leads: leadsResult.rows });
    }

    if (path === '/leads' && method === 'POST') {
      const { user, error } = await authenticate(event);
      if (error) return error;

      if (!requireRole(user, ['Admin', 'Sales'])) {
        return jsonResponse(403, { error: 'Access denied.' });
      }

      const body = JSON.parse(event.body || '{}');
      const schema = z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional().nullable(),
        status: z.enum([
          'New',
          'Contacted',
          'Follow-Up',
          'Quotation Sent',
          'Converted',
          'Lost',
        ]),
        notes: z.string().optional().nullable(),
      });
      const data = schema.parse(body);

      const result = await query(
        `INSERT INTO leads (name, email, phone, status, notes, owner_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, name, email, phone, status, notes, updated_at`,
        [
          data.name,
          data.email,
          data.phone || null,
          data.status,
          data.notes || null,
          user.id,
        ]
      );

      await writeAuditLog({
        actorId: user.id,
        action: 'create_lead',
        metadata: { leadId: result.rows[0].id },
      });

      return jsonResponse(201, { lead: result.rows[0] });
    }

    if (path.startsWith('/leads/') && method === 'PATCH') {
      const { user, error } = await authenticate(event);
      if (error) return error;

      if (!requireRole(user, ['Admin', 'Sales'])) {
        return jsonResponse(403, { error: 'Access denied.' });
      }

      const leadId = path.split('/')[2];
      if (!leadId) {
        return jsonResponse(400, { error: 'Missing lead id.' });
      }

      const body = JSON.parse(event.body || '{}');
      const schema = z.object({
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional().nullable(),
        status: z
          .enum([
            'New',
            'Contacted',
            'Follow-Up',
            'Quotation Sent',
            'Converted',
            'Lost',
          ])
          .optional(),
        notes: z.string().optional().nullable(),
      });
      const data = schema.parse(body);

      const updates = [];
      const values = [];
      let idx = 1;
      Object.entries(data).forEach(([key, value]) => {
        updates.push(`${key} = $${idx++}`);
        values.push(value ?? null);
      });

      if (!updates.length) {
        return jsonResponse(400, { error: 'No updates provided.' });
      }

      values.push(leadId);
      const result = await query(
        `UPDATE leads
         SET ${updates.join(', ')}, updated_at = NOW()
         WHERE id = $${idx}
         RETURNING id, name, email, phone, status, notes, updated_at`,
        values
      );

      if (!result.rowCount) {
        return jsonResponse(404, { error: 'Lead not found.' });
      }

      await writeAuditLog({
        actorId: user.id,
        action: 'update_lead',
        metadata: { leadId },
      });

      return jsonResponse(200, { lead: result.rows[0] });
    }

    return jsonResponse(404, { error: 'Not found.' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonResponse(400, { error: error.errors.map((e) => e.message).join(', ') });
    }
    return jsonResponse(500, { error: error.message || 'Server error.' });
  }
};
