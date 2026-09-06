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

  // Dynamic PWA Manifest Route with application/manifest+json
  app.get('/manifest.json', async (req, res) => {
    try {
      const token = req.query.token;
      let startUrl = '/';
      if (token) {
        startUrl = `/?token=${encodeURIComponent(token)}`;
      } else {
        const userWithToken = await prisma.user.findFirst({
          where: { magicToken: { not: null } }
        });
        if (userWithToken && userWithToken.magicToken) {
          startUrl = `/?token=${encodeURIComponent(userWithToken.magicToken)}`;
        }
      }

      res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
      res.json({
        name: "IP & DNS Manager",
        short_name: "NetIPAM",
        description: "Sistem Manajemen Alamat IP dan DNS Terintegrasi",
        start_url: startUrl,
        scope: "/",
        id: startUrl,
        display: "standalone",
        orientation: "any",
        background_color: "#10b981",
        theme_color: "#10b981",
        shortcuts: [
          {
            name: "Buka NetIPAM",
            url: startUrl,
            icons: [{ src: "/logo192.png", sizes: "192x192" }]
          }
        ],
        icons: [
          {
            src: "/logo192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "/logo512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "/logo.svg",
            sizes: "192x192 512x512",
            type: "image/svg+xml"
          }
        ]
      });
    } catch (e) {
      res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
      res.json({
        name: "IP & DNS Manager",
        short_name: "NetIPAM",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#10b981",
        theme_color: "#10b981",
        icons: [
          { src: "/logo192.png", sizes: "192x192", type: "image/png" },
          { src: "/logo512.png", sizes: "512x512", type: "image/png" }
        ]
      });
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
        subDomains,
        electricityDevices,
        cctvDevices,
        waterDevices,
        lanLocations,
        lanZones,
        lanDevices,
        lanCableRuns
      ] = await Promise.all([
        prisma.user.findMany(),
        prisma.iPGroup.findMany(),
        prisma.iPAllocation.findMany(),
        prisma.deviceCategory.findMany(),
        prisma.iPService.findMany(),
        prisma.dnsRecord.findMany(),
        prisma.subDomainRecord.findMany(),
        prisma.electricityDevice.findMany(),
        prisma.cctvDevice.findMany(),
        prisma.waterDevice.findMany(),
        prisma.lanLocation.findMany(),
        prisma.lanZone.findMany(),
        prisma.lanDevice.findMany(),
        prisma.lanCableRun.findMany()
      ]);
      
      res.json({
        'netipam_users_list_v1': users,
        'netipam_groups_v1': groups,
        'netipam_allocations_v1': allocations,
        'netipam_device_categories_v1': categories,
        'netipam_services_v1': services,
        'netipam_dns_records_v1': dnsRecords,
        'netipam_sub_domains_v1': subDomains,
        'netipam_electricity_devices_v1': electricityDevices,
        'netipam_cctv_devices_v1': cctvDevices,
        'netipam_water_devices_v1': waterDevices,
        'netipam_lan_locations_v1': lanLocations,
        'netipam_lan_zones_v1': lanZones,
        'netipam_lan_devices_v1': lanDevices,
        'netipam_lan_cables_v1': lanCableRuns
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
        case 'netipam_electricity_devices_v1':
          await replaceTable(prisma.electricityDevice, data);
          break;
        case 'netipam_cctv_devices_v1':
          await replaceTable(prisma.cctvDevice, data);
          break;
        case 'netipam_water_devices_v1':
          await replaceTable(prisma.waterDevice, data);
          break;
        case 'netipam_lan_locations_v1':
          await replaceTable(prisma.lanLocation, data);
          break;
        case 'netipam_lan_zones_v1':
          await replaceTable(prisma.lanZone, data);
          break;
        case 'netipam_lan_devices_v1':
          await replaceTable(prisma.lanDevice, data);
          break;
        case 'netipam_lan_cables_v1':
          await replaceTable(prisma.lanCableRun, data);
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
        prisma.subDomainRecord.deleteMany({}),
        prisma.electricityDevice.deleteMany({}),
        prisma.cctvDevice.deleteMany({}),
        prisma.waterDevice.deleteMany({}),
        prisma.lanCableRun.deleteMany({}),
        prisma.lanDevice.deleteMany({}),
        prisma.lanZone.deleteMany({}),
        prisma.lanLocation.deleteMany({})
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
    app.get('{*path}', (req, res) => {
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
