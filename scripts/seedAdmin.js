#!/usr/bin/env node
const bcrypt = require('bcryptjs');
const { connectDatabase, disconnectDatabase } = require('../config/database-local');
const AdminUser = require('../models/AdminUser');

async function main() {
  const args = require('minimist')(process.argv.slice(2));
  const username = args.username || args.u || 'admin';
  const password = args.password || args.p || 'admin123';

  await connectDatabase();

  const exists = await AdminUser.findOne({ username });
  if (exists) {
    console.log(`Usuário ${username} já existe. Abortando.`);
    await disconnectDatabase();
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  await AdminUser.create({ username, passwordHash: hash });
  console.log(`Usuário admin criado: ${username}`);
  await disconnectDatabase();
}

main().catch(err => {
  console.error(err);
  disconnectDatabase();
}); 