
import { PrismaClient } from '@prisma/client';
import { SearchQueueWorker } from './services/searchQueue';

const prisma = new PrismaClient();
const worker = new SearchQueueWorker();

async function main() {
    console.log("Creating Test Job (Queue Test)...");

    // Create a Job
    const job = await prisma.searchJob.create({
        data: {
            term: "pizza in brooklyn, ny",
            status: 'PENDING',
            source: 'GOOGLE_MAPS',
            tenantId: 1
        }
    });
    console.log("Created Job:", job.id);

    // Process
    console.log("Triggering Worker Processing...");
    await worker.processNextJob();

    // Verify
    const updatedJob = await prisma.searchJob.findUnique({
        where: { id: job.id },
        include: { leads: true }
    });

    console.log("Updated Job Status:", updatedJob?.status);
    console.log("Leads Found:", updatedJob?.leads.length);

    // Cleanup
    await prisma.$disconnect();
}

main().catch(console.error);
