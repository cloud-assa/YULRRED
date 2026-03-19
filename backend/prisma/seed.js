"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new client_1.PrismaClient();
async function main() {
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@securedeal.com' },
        update: {},
        create: {
            email: 'admin@securedeal.com',
            name: 'SecureDeal Admin',
            password: adminPassword,
            role: client_1.Role.ADMIN,
        },
    });
    const buyerPassword = await bcrypt.hash('Buyer@123', 10);
    const buyer = await prisma.user.upsert({
        where: { email: 'buyer@example.com' },
        update: {},
        create: {
            email: 'buyer@example.com',
            name: 'Demo Buyer',
            password: buyerPassword,
        },
    });
    const sellerPassword = await bcrypt.hash('Seller@123', 10);
    const seller = await prisma.user.upsert({
        where: { email: 'seller@example.com' },
        update: {},
        create: {
            email: 'seller@example.com',
            name: 'Demo Seller',
            password: sellerPassword,
        },
    });
    console.log('Seeded users:', { admin: admin.email, buyer: buyer.email, seller: seller.email });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map