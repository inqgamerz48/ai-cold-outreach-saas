
import { PrismaClient } from '@prisma/client';
import { SearchQueueWorker } from './services/searchQueue';

const prisma = new PrismaClient();
const worker = new SearchQueueWorker();

async function main() {
    console.log("Creating Test Job (Reddit)...");

    const job = await prisma.searchJob.create({
        data: {
            term: "Reddit: marketing, agency in entrepreneur, smallbusiness",
            status: 'PENDING',
            source: 'REDDIT',
            tenantId: 1
        }
    });
    console.log("Created Job:", job.id);

    console.log("Triggering Worker Processing...");
    await worker.processNextJob();

    // Verify
    const updatedJob = await prisma.searchJob.findUnique({
        where: { id: job.id },
        include: { personas: true }
    });

    console.log("Updated Job Status:", updatedJob?.status);
    console.log("Personas Found:", updatedJob?.personas.length);

    await prisma.$disconnect();
}
main().catch(console.error);
