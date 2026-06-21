import mysql from 'mysql2/promise';

const host = process.env.MYSQL_HOST || 'localhost';
const user = process.env.MYSQL_USER || 'root';
const password = process.env.MYSQL_PASSWORD || '';
const database = process.env.MYSQL_DATABASE || 'peaksender';
const port = parseInt(process.env.MYSQL_PORT || '3306');

let mysqlPool: mysql.Pool;

// Redis (Vercel KV) config
const kvUrl = process.env.KV_REST_API_URL;
const kvToken = process.env.KV_REST_API_TOKEN;
const useRedis = !!(kvUrl && kvToken);

// Redis connection helper
async function redisCall(command: any[]) {
  if (!kvUrl || !kvToken) {
    throw new Error('KV credentials are not configured');
  }

  const response = await fetch(kvUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${kvToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Redis REST error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  return data.result;
}

// Redis database getters/setters
async function getAllUsers(): Promise<any[]> {
  const userJsons = await redisCall(["HVALS", "peaksender:users"]) || [];
  return userJsons.map((j: string) => JSON.parse(j));
}

async function getUserByUsername(username: string): Promise<any | null> {
  const userJson = await redisCall(["HGET", "peaksender:users", username]);
  return userJson ? JSON.parse(userJson) : null;
}

async function getUserByEmail(email: string): Promise<any | null> {
  const username = await redisCall(["HGET", "peaksender:emails", email]);
  if (!username) return null;
  return getUserByUsername(username);
}

async function saveUser(user: any): Promise<void> {
  await redisCall(["HSET", "peaksender:users", user.username, JSON.stringify(user)]);
  await redisCall(["HSET", "peaksender:emails", user.email, user.username]);
}

async function updateUserBalanceById(id: any, balance: number): Promise<boolean> {
  const users = await getAllUsers();
  const user = users.find(u => String(u.id) === String(id));
  if (user) {
    user.balance = parseFloat(balance as any);
    await saveUser(user);
    return true;
  }
  return false;
}

async function updateUserBalanceByUsername(username: string, balance: number): Promise<boolean> {
  const user = await getUserByUsername(username);
  if (user) {
    user.balance = parseFloat(balance as any);
    await saveUser(user);
    return true;
  }
  return false;
}

async function updateUserDetails(id: any, username: string, email: string, role: string, status: string): Promise<boolean> {
  const users = await getAllUsers();
  const user = users.find(u => String(u.id) === String(id));
  if (user) {
    if (user.username !== username) {
      await redisCall(["HDEL", "peaksender:users", user.username]);
    }
    if (user.email !== email) {
      await redisCall(["HDEL", "peaksender:emails", user.email]);
    }
    user.username = username;
    user.email = email;
    user.role = role;
    user.status = status;
    await saveUser(user);
    return true;
  }
  return false;
}

async function getAllOrders(): Promise<any[]> {
  const orderJsons = await redisCall(["HVALS", "peaksender:orders"]) || [];
  return orderJsons.map((j: string) => JSON.parse(j));
}

async function updateOrderStatus(id: string, status: string): Promise<boolean> {
  const orderJson = await redisCall(["HGET", "peaksender:orders", id]);
  if (orderJson) {
    const order = JSON.parse(orderJson);
    order.status = status;
    await redisCall(["HSET", "peaksender:orders", id, JSON.stringify(order)]);
    return true;
  }
  return false;
}

// Seed Redis if empty
let isRedisInitialized = false;
async function initRedisDB() {
  if (isRedisInitialized) return;
  try {
    const adminUsername = 'peaksender27';
    const adminEmail = 'peaksender27@gmail.com';
    const hasAdmin = await redisCall(["HEXISTS", "peaksender:users", adminUsername]);
    if (!hasAdmin) {
      const defaultPasswordHash = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';
      const adminUser = {
        id: 1,
        username: adminUsername,
        email: adminEmail,
        password: defaultPasswordHash,
        balance: 12500.00,
        role: 'Admin',
        status: 'Active',
        createdAt: new Date().toISOString()
      };
      await saveUser(adminUser);
      console.log('Seeded default admin in Upstash Redis');
    }

    const ordersLen = await redisCall(["HLEN", "peaksender:orders"]) || 0;
    if (ordersLen === 0) {
      const now = new Date().toISOString();
      const o1 = {
        id: 'ORD-7721',
        customer: 'peaksender27',
        serviceId: 16440,
        serviceName: '➤ Instagram Followers »【 Real - HQ Accounts - 50K+ Per Day - No Drop - Instant - Lifetime Refill ♻️】🔥',
        link: 'https://instagram.com/peaksender',
        quantity: 1000,
        charge: 51.96,
        status: 'Completed',
        createdAt: now
      };
      const o2 = {
        id: 'ORD-9932',
        customer: 'john_doe',
        serviceId: 12600,
        serviceName: '⭆ Tiktok Likes【 HQ Accounts - 50K+ Per Day🚀 - Instant - No Refill 】🔥',
        link: 'https://tiktok.com/@video123',
        quantity: 5000,
        charge: 97.85,
        status: 'Pending',
        createdAt: now
      };
      await redisCall(["HSET", "peaksender:orders", o1.id, JSON.stringify(o1)]);
      await redisCall(["HSET", "peaksender:orders", o2.id, JSON.stringify(o2)]);
      console.log('Seeded default orders in Upstash Redis');
    }
    isRedisInitialized = true;
  } catch (error) {
    console.error('Failed to initialize Redis DB:', error);
  }
}

// SQL Query Dispatcher for Redis
async function executeRedisQuery(sql: string, params: any[] = []): Promise<[any, any]> {
  await initRedisDB();
  const normalizedSql = sql.trim().replace(/\s+/g, ' ');

  // 1. SELECT id FROM users WHERE username = ? OR email = ?
  if (normalizedSql.match(/SELECT\s+id\s+FROM\s+users\s+WHERE\s+username\s*=\s*\?\s*OR\s*email\s*=\s*\?/i)) {
    const [username, email] = params;
    const users = await getAllUsers();
    const match = users.filter(u => u.username === username || u.email === email);
    return [match.map(u => ({ id: u.id })), null];
  }

  // 2. SELECT * FROM users WHERE username = ? OR email = ?
  if (normalizedSql.match(/SELECT\s+\*\s+FROM\s+users\s+WHERE\s+username\s*=\s*\?\s*OR\s*email\s*=\s*\?/i)) {
    const [username, email] = params;
    const users = await getAllUsers();
    const match = users.filter(u => u.username === username || u.email === email);
    return [match, null];
  }

  // 3. SELECT * FROM users WHERE email = ?
  if (normalizedSql.match(/SELECT\s+\*\s+FROM\s+users\s+WHERE\s+email\s*=\s*\?/i)) {
    const [email] = params;
    const user = await getUserByEmail(email);
    return [user ? [user] : [], null];
  }

  // 4. SELECT id, username, email, balance, role, status, createdAt FROM users ORDER BY id ASC
  if (normalizedSql.match(/SELECT\s+id,\s*username,\s*email,\s*balance,\s*role,\s*status,\s*createdAt\s+FROM\s+users\s+ORDER\s+BY\s+id\s+ASC/i)) {
    const users = await getAllUsers();
    users.sort((a, b) => Number(a.id) - Number(b.id));
    return [users, null];
  }

  // 5. INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)
  if (normalizedSql.match(/INSERT\s+INTO\s+users\s*\(\s*username,\s*email,\s*password,\s*role\s*\)\s*VALUES\s*\(\s*\?,\s*\?,\s*\?,\s*\?\s*\)/i)) {
    const [username, email, password, role] = params;
    const id = Math.floor(Date.now() + Math.random() * 1000);
    const newUser = {
      id,
      username,
      email,
      password,
      balance: 0.00,
      role,
      status: 'Active',
      createdAt: new Date().toISOString()
    };
    await saveUser(newUser);
    return [{ affectedRows: 1 }, null];
  }

  // 6. INSERT INTO users (username, email, password, balance, role) VALUES (?, ?, ?, ?, ?)
  if (normalizedSql.match(/INSERT\s+INTO\s+users\s*\(\s*username,\s*email,\s*password,\s*balance,\s*role\s*\)\s*VALUES\s*\(\s*\?,\s*\?,\s*\?,\s*\?,\s*\?\s*\)/i)) {
    const [username, email, password, balance, role] = params;
    const id = Math.floor(Date.now() + Math.random() * 1000);
    const newUser = {
      id,
      username,
      email,
      password,
      balance: parseFloat(balance),
      role,
      status: 'Active',
      createdAt: new Date().toISOString()
    };
    await saveUser(newUser);
    return [{ affectedRows: 1 }, null];
  }

  // 7. UPDATE users SET balance = ? WHERE id = ?
  if (normalizedSql.match(/UPDATE\s+users\s+SET\s+balance\s*=\s*\?\s+WHERE\s+id\s*=\s*\?/i)) {
    const [balance, id] = params;
    const updated = await updateUserBalanceById(id, balance);
    return [{ affectedRows: updated ? 1 : 0 }, null];
  }

  // 8. UPDATE users SET balance = ? WHERE username = ?
  if (normalizedSql.match(/UPDATE\s+users\s+SET\s+balance\s*=\s*\?\s+WHERE\s+username\s*=\s*\?/i)) {
    const [balance, username] = params;
    const updated = await updateUserBalanceByUsername(username, balance);
    return [{ affectedRows: updated ? 1 : 0 }, null];
  }

  // 9. UPDATE users SET username = ?, email = ?, role = ?, status = ? WHERE id = ?
  if (normalizedSql.match(/UPDATE\s+users\s+SET\s+username\s*=\s*\?,\s*email\s*=\s*\?,\s*role\s*=\s*\?,\s*status\s*=\s*\?\s+WHERE\s+id\s*=\s*\?/i)) {
    const [username, email, role, status, id] = params;
    const updated = await updateUserDetails(id, username, email, role, status);
    return [{ affectedRows: updated ? 1 : 0 }, null];
  }

  // 10. SELECT balance FROM users WHERE username = ? FOR UPDATE
  // or SELECT balance FROM users WHERE username = ?
  if (normalizedSql.match(/SELECT\s+balance\s+FROM\s+users\s+WHERE\s+username\s*=\s*\?/i)) {
    const [username] = params;
    const user = await getUserByUsername(username);
    return [user ? [{ balance: user.balance }] : [], null];
  }

  // 11. SELECT SUM(charge) as totalSales FROM orders
  if (normalizedSql.match(/SELECT\s+SUM\(charge\)\s+as\s+totalSales\s+FROM\s+orders/i)) {
    const orders = await getAllOrders();
    const sum = orders.reduce((acc, o) => acc + parseFloat(o.charge || 0), 0);
    return [[{ totalSales: sum }], null];
  }

  // 12. SELECT COUNT(*) as totalUsers FROM users
  if (normalizedSql.match(/SELECT\s+COUNT\(\*\)\s+as\s+totalUsers\s+FROM\s+users/i)) {
    const len = await redisCall(["HLEN", "peaksender:users"]) || 0;
    return [[{ totalUsers: len }], null];
  }

  // 13. SELECT COUNT(*) as totalOrders FROM orders
  if (normalizedSql.match(/SELECT\s+COUNT\(\*\)\s+as\s+totalOrders\s+FROM\s+orders/i)) {
    const len = await redisCall(["HLEN", "peaksender:orders"]) || 0;
    return [[{ totalOrders: len }], null];
  }

  // 14. SELECT COUNT(*) as count FROM orders WHERE customer = ?
  if (normalizedSql.match(/SELECT\s+COUNT\(\*\)\s+as\s+count\s+FROM\s+orders\s+WHERE\s+customer\s*=\s*\?/i)) {
    const [username] = params;
    const orders = await getAllOrders();
    const count = orders.filter(o => o.customer === username).length;
    return [[{ count }], null];
  }

  // 15. SELECT * FROM orders ORDER BY createdAt DESC LIMIT 5
  if (normalizedSql.match(/SELECT\s+\*\s+FROM\s+orders\s+ORDER\s+BY\s+createdAt\s+DESC\s+LIMIT\s+5/i)) {
    const orders = await getAllOrders();
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return [orders.slice(0, 5), null];
  }

  // 16. SELECT * FROM orders ORDER BY createdAt DESC
  if (normalizedSql.match(/SELECT\s+\*\s+FROM\s+orders\s+ORDER\s+BY\s+createdAt\s+DESC/i)) {
    const orders = await getAllOrders();
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return [orders, null];
  }

  // 17. SELECT * FROM orders WHERE customer = ? ORDER BY createdAt DESC
  if (normalizedSql.match(/SELECT\s+\*\s+FROM\s+orders\s+WHERE\s+customer\s*=\s*\?\s+ORDER\s+BY\s+createdAt\s+DESC/i)) {
    const [username] = params;
    const orders = await getAllOrders();
    const match = orders.filter(o => o.customer === username);
    match.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return [match, null];
  }

  // 18. UPDATE orders SET status = ? WHERE id = ?
  if (normalizedSql.match(/UPDATE\s+orders\s+SET\s+status\s*=\s*\?\s+WHERE\s+id\s*=\s*\?/i)) {
    const [status, id] = params;
    const updated = await updateOrderStatus(id, status);
    return [{ affectedRows: updated ? 1 : 0 }, null];
  }

  // 19. INSERT INTO orders (id, customer, serviceId, serviceName, link, quantity, charge, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  if (normalizedSql.match(/INSERT\s+INTO\s+orders\s*\(\s*id,\s*customer,\s*serviceId,\s*serviceName,\s*link,\s*quantity,\s*charge,\s*status\s*\)\s*VALUES\s*\(\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?\s*\)/i)) {
    const [id, customer, serviceId, serviceName, link, quantity, charge, status] = params;
    const newOrder = {
      id,
      customer,
      serviceId: parseInt(serviceId),
      serviceName,
      link,
      quantity: parseInt(quantity),
      charge: parseFloat(charge),
      status,
      createdAt: new Date().toISOString()
    };
    await redisCall(["HSET", "peaksender:orders", id, JSON.stringify(newOrder)]);
    return [{ affectedRows: 1 }, null];
  }

  // 20. INSERT INTO orders (id, customer, serviceId, serviceName, link, quantity, charge, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  if (normalizedSql.match(/INSERT\s+INTO\s+orders\s*\(\s*id,\s*customer,\s*serviceId,\s*serviceName,\s*link,\s*quantity,\s*charge,\s*status,\s*createdAt\s*\)\s*VALUES\s*\(\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?,\s*\?\s*\)/i)) {
    const [id, customer, serviceId, serviceName, link, quantity, charge, status, createdAt] = params;
    const newOrder = {
      id,
      customer,
      serviceId: parseInt(serviceId),
      serviceName,
      link,
      quantity: parseInt(quantity),
      charge: parseFloat(charge),
      status,
      createdAt: new Date(createdAt).toISOString()
    };
    await redisCall(["HSET", "peaksender:orders", id, JSON.stringify(newOrder)]);
    return [{ affectedRows: 1 }, null];
  }

  // 21. SELECT count(*) as count FROM orders
  if (normalizedSql.match(/SELECT\s+count\(\*\)\s+as\s+count\s+FROM\s+orders/i)) {
    const len = await redisCall(["HLEN", "peaksender:orders"]) || 0;
    return [[{ count: len }], null];
  }

  console.warn('SQL query not recognized by Redis Mock client:', sql, params);
  return [[], null];
}

class MockConnection {
  async query(sql: string, params: any[] = []) {
    return executeRedisQuery(sql, params);
  }
  async beginTransaction() {}
  async commit() {}
  async rollback() {}
  release() {}
}

class MockPool {
  async query(sql: string, params: any[] = []) {
    return executeRedisQuery(sql, params);
  }
  async getConnection() {
    return new MockConnection();
  }
  async end() {}
}

const mockPoolInstance = new MockPool();

export async function getPool(): Promise<any> {
  if (useRedis) {
    return mockPoolInstance;
  }

  // MySQL Fallback
  if (mysqlPool) return mysqlPool;

  try {
    const tempConnection = await mysql.createConnection({
      host,
      user,
      password,
      port,
    });
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await tempConnection.end();
  } catch (error) {
    console.error('Failed to pre-create MySQL database:', error);
  }

  const newPool = mysql.createPool({
    host,
    user,
    password,
    database,
    port,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  await initMySQLDB(newPool);
  mysqlPool = newPool;

  return mysqlPool;
}

async function initMySQLDB(dbPool: mysql.Pool) {
  try {
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
        role VARCHAR(50) NOT NULL DEFAULT 'User',
        status VARCHAR(50) NOT NULL DEFAULT 'Active',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    const [existingAdmin] = await dbPool.query('SELECT * FROM users WHERE email = ?', ['peaksender27@gmail.com']);
    if (Array.isArray(existingAdmin) && existingAdmin.length === 0) {
      const defaultPasswordHash = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';
      await dbPool.query(
        'INSERT INTO users (username, email, password, balance, role) VALUES (?, ?, ?, ?, ?)',
        ['peaksender27', 'peaksender27@gmail.com', defaultPasswordHash, 12500.00, 'Admin']
      );
      console.log('Default Admin Account created: peaksender27 / admin123');
    }

    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        customer VARCHAR(255) NOT NULL,
        serviceId INT NOT NULL,
        serviceName VARCHAR(500) NOT NULL,
        link VARCHAR(500) NOT NULL,
        quantity INT NOT NULL,
        charge DECIMAL(15, 2) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'Pending',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    const [existingOrders] = await dbPool.query('SELECT count(*) as count FROM orders');
    const orderCount = (existingOrders as any)[0]?.count || 0;
    if (orderCount === 0) {
      const now = new Date();
      await dbPool.query(
        'INSERT INTO orders (id, customer, serviceId, serviceName, link, quantity, charge, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          'ORD-7721',
          'peaksender27',
          16440,
          '➤ Instagram Followers »【 Real - HQ Accounts - 50K+ Per Day - No Drop - Instant - Lifetime Refill ♻️】🔥',
          'https://instagram.com/peaksender',
          1000,
          51.96,
          'Completed',
          now,
        ]
      );
      await dbPool.query(
        'INSERT INTO orders (id, customer, serviceId, serviceName, link, quantity, charge, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          'ORD-9932',
          'john_doe',
          12600,
          '⭆ Tiktok Likes【 HQ Accounts - 50K+ Per Day🚀 - Instant - No Refill 】🔥',
          'https://tiktok.com/@video123',
          5000,
          97.85,
          'Pending',
          now,
        ]
      );
      console.log('Seeded initial orders in MySQL');
    }

    console.log('MySQL Database Tables initialized successfully.');
  } catch (error) {
    console.error('MySQL database initialization failed:', error);
  }
}

let memoryStore: Record<string, string> = {};

export async function getKV(key: string): Promise<string | null> {
  if (useRedis) {
    try {
      return await redisCall(["GET", key]);
    } catch (e) {
      console.error('getKV Redis error:', e);
      return memoryStore[key] || null;
    }
  }
  return memoryStore[key] || null;
}

export async function setKV(key: string, value: string): Promise<void> {
  if (useRedis) {
    try {
      await redisCall(["SET", key, value]);
      return;
    } catch (e) {
      console.error('setKV Redis error:', e);
    }
  }
  memoryStore[key] = value;
}
