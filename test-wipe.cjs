const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
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
      prisma.electricityCableRun.deleteMany({}),
      prisma.cctvDevice.deleteMany({}),
      prisma.cctvCableRun.deleteMany({}),
      prisma.waterDevice.deleteMany({}),
      prisma.waterPipeRun.deleteMany({}),
      prisma.lanCableRun.deleteMany({}),
      prisma.lanDevice.deleteMany({}),
      prisma.lanZone.deleteMany({}),
      prisma.lanLocation.deleteMany({})
    ]);
    console.log("Success");
  } catch (e) {
    console.error(e.message);
  }
}
run();
