import { PrismaClient, Role, TestType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const random = (min: number, max: number) => Math.random() * (max - min) + min;

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.testSession.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  for (let i = 1; i <= 50; i += 1) {
    const role = i <= 3 ? Role.CLINICIAN : Role.PATIENT;
    const user = await prisma.user.create({
      data: {
        email: `demo${i}@example.com`,
        passwordHash,
        role,
        firstNameEnc: Buffer.from(`Demo${i}`).toString('base64'),
        lastNameEnc: Buffer.from(`User${i}`).toString('base64'),
        dobEnc: Buffer.from('1970-01-01').toString('base64'),
      },
    });

    if (role === Role.PATIENT) {
      for (const type of [TestType.VISUAL, TestType.AUDITORY, TestType.OLFACTORY, TestType.COGNITIVE, TestType.COMPOSITE]) {
        const score = random(35, 95);
        await prisma.testSession.create({
          data: {
            userId: user.id,
            testType: type,
            deviceInfo: { model: 'iPhone 13', os: 'iOS', browser: 'Safari', screenSize: '390x844' },
            environmentData: { ambientNoise: random(30, 55), screenBrightness: random(0.4, 0.9), headphoneType: 'Bluetooth' },
            rawResponses: [{ trial: 1, response: 'sample', reactionTimeMs: random(400, 1900) }],
            computedScores: { rawScore: score, normalizedScore: score, classification: score > 60 ? 'Normal' : 'Impaired' },
            calibrationData: { pixelDensity: 2.5, viewingDistanceCm: 40, volumeReferenceDb: -15 },
          },
        });
      }
    }
  }
}

main().finally(async () => prisma.$disconnect());
