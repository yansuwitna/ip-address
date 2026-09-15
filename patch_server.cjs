const fs = require('fs');
let content = fs.readFileSync('server/index.cjs', 'utf-8');

// For POST: Add switch cases
const postCases = `
        case 'netipam_sound_devices_v1':
          await replaceTable(prisma.soundDevice, data);
          break;
        case 'netipam_sound_cables_v1':
          await replaceTable(prisma.soundCableRun, data);
          break;
        case 'netipam_sound_device_types_v1':
          await replaceTable(prisma.soundDeviceTypeModel, data);
          break;
        case 'netipam_sound_cable_types_v1':
          await replaceTable(prisma.soundCableType, data);
          break;
        default:`;
content = content.replace('default:', postCases.trim());

// For DELETE: Add deleteMany
const deleteLines = `
        prisma.dnsRecordTypeModel.deleteMany({}),
        prisma.soundDevice.deleteMany({}),
        prisma.soundCableRun.deleteMany({}),
        prisma.soundDeviceTypeModel.deleteMany({}),
        prisma.soundCableType.deleteMany({})`;
content = content.replace('prisma.dnsRecordTypeModel.deleteMany({})', deleteLines.trim());

fs.writeFileSync('server/index.cjs', content);
