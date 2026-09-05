require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const crypto = require('crypto');

async function startServer() {
  const prisma = new PrismaClient();
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  // Helper to replace all records in a table
  async function replaceTable(model, dataArray) {
    await prisma.$transaction([
      model.deleteMany({}),
      model.createMany({ data: dataArray })
    ]);
  }

  // Direct login / token endpoint against Prisma database
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password, token } = req.body;

      if (token) {
        const cleanToken = token.trim();
        const user = await prisma.user.findFirst({
          where: { magicToken: cleanToken }
        });

        if (!user) {
          return res.status(401).json({ success: false, error: 'Token login tidak valid atau kadaluarsa!' });
        }

        const now = new Date().toISOString();
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: now }
        });

        const { password: _, ...safeUser } = user;
        return res.json({
          success: true,
          user: { ...safeUser, lastLogin: now }
        });
      }

      if (!username || !password) {
        return res.status(400).json({ success: false, error: 'Username dan kata sandi wajib diisi!' });
      }

      const user = await prisma.user.findFirst({
        where: {
          username: username.trim().toLowerCase()
        }
      });

      if (!user) {
        return res.status(401).json({ success: false, error: 'Username tidak ditemukan di database!' });
      }

      const hashedInput = crypto.createHash('sha256').update(password).digest('hex');
      if (user.password !== hashedInput && user.password !== password) {
        return res.status(401).json({ success: false, error: 'Kata sandi salah!' });
      }

      const now = new Date().toISOString();
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: now }
      });

      const { password: _, ...safeUser } = user;
      res.json({
        success: true,
        user: { ...safeUser, lastLogin: now }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server saat login.' });
    }
  });

  // GET all data
  app.get('/api/store/all', async (req, res) => {
    try {
      const [
        users,
        groups,
        allocations,
        categories,
        services,
        dnsRecords,
        subDomains
      ] = await Promise.all([
        prisma.user.findMany(),
        prisma.iPGroup.findMany(),
        prisma.iPAllocation.findMany(),
        prisma.deviceCategory.findMany(),
        prisma.iPService.findMany(),
        prisma.dnsRecord.findMany(),
        prisma.subDomainRecord.findMany()
      ]);
      
      res.json({
        'netipam_users_list_v1': users,
        'netipam_groups_v1': groups,
        'netipam_allocations_v1': allocations,
        'netipam_device_categories_v1': categories,
        'netipam_services_v1': services,
        'netipam_dns_records_v1': dnsRecords,
        'netipam_sub_domains_v1': subDomains
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to read data' });
    }
  });

  // POST to save specific entities
  app.post('/api/store/:key', async (req, res) => {
    const { key } = req.params;
    const data = req.body;
    
    try {
      switch (key) {
        case 'netipam_users_list_v1':
          const encryptedUsers = data.map(u => {
            if (u.password && !/^[a-f0-9]{64}$/i.test(u.password)) {
              return {
                ...u,
                password: crypto.createHash('sha256').update(u.password).digest('hex')
              };
            }
            return u;
          });
          await replaceTable(prisma.user, encryptedUsers);
          break;
        case 'netipam_groups_v1':
          await replaceTable(prisma.iPGroup, data);
          break;
        case 'netipam_allocations_v1':
          const cleanAllocations = data.map(a => {
            const { services: _, ...rest } = a;
            return rest;
          });
          await replaceTable(prisma.iPAllocation, cleanAllocations);
          break;
        case 'netipam_device_categories_v1':
          await replaceTable(prisma.deviceCategory, data);
          break;
        case 'netipam_services_v1':
          await replaceTable(prisma.iPService, data);
          break;
        case 'netipam_dns_records_v1':
          await replaceTable(prisma.dnsRecord, data);
          break;
        case 'netipam_sub_domains_v1':
          await replaceTable(prisma.subDomainRecord, data);
          break;
        default:
          return res.status(400).json({ error: 'Unknown key' });
      }
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to save data' });
    }
  });

  // DELETE all
  app.delete('/api/store/all', async (req, res) => {
    try {
      await prisma.$transaction([
        prisma.user.deleteMany({}),
        prisma.iPGroup.deleteMany({}),
        prisma.iPAllocation.deleteMany({}),
        prisma.deviceCategory.deleteMany({}),
        prisma.iPService.deleteMany({}),
        prisma.dnsRecord.deleteMany({}),
        prisma.subDomainRecord.deleteMany({})
      ]);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to wipe data' });
    }
  });

  // --- FRONTEND INTEGRATION ---
  if (process.env.NODE_ENV === 'production') {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, '../dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, '../dist/index.html'));
    });
  } else {
    // Serve Vite dev server in development
    const { createServer: createViteServer } = require('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = process.env.PORT || 3000;
  const HOST = process.env.HOST || '0.0.0.0';
  app.listen(PORT, HOST, () => {
    console.log(`🚀 Server (Frontend + Backend) running on http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  });
}

startServer().catch(console.error);
