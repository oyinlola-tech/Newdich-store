import 'dotenv/config';
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? 'admin@newdich.com';
const password = process.env.ADMIN_PASSWORD ?? 'ChangeMe_Admin123';
const name = process.env.ADMIN_NAME?.trim() ?? 'Super Admin';
const phone = process.env.ADMIN_PHONE?.trim() ?? null;

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      role: UserRole.ADMIN,
      status: 'ACTIVE',
      passwordHash,
      name,
      phone
    },
    create: {
      name,
      email,
      phone,
      passwordHash,
      role: UserRole.ADMIN,
      status: 'ACTIVE',
      emailVerifiedAt: new Date()
    }
  });

  console.log(`[seed] Superadmin ready: ${admin.email} (id: ${admin.id})`);

  const defaultSettings: Record<string, { value: string | number | boolean; description: string }> = {
    'store.name': { value: 'Newdich Store', description: 'Store display name' },
    'store.currency': { value: 'NGN', description: 'Default currency code' },
    'store.email': { value: email, description: 'Store contact email' },
    'store.phone': { value: phone ?? '', description: 'Store contact phone' },
    'store.announcement': { value: '', description: 'Announcement bar text' },
    'checkout.enableGuestCheckout': { value: true, description: 'Allow guest checkout' },
    'email.orderConfirmationEnabled': { value: true, description: 'Send order confirmation emails' },
    'notifications.adminNewOrder': { value: true, description: 'Notify admins on new order' }
  };

  for (const [key, { value, description }] of Object.entries(defaultSettings)) {
    await prisma.storeSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value, description }
    });
  }

  console.log(`[seed] Store settings seeded (${Object.keys(defaultSettings).length} keys)`);
}

main()
  .catch((error) => {
    console.error('[seed] Failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
