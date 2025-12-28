
import { PrismaClient } from '@prisma/client';
import { SearchQueueWorker } from './services/searchQueue';

const prisma = new PrismaClient();
const worker = new SearchQueueWorker();

async function main() {
    console.log("Creating Test Jobs (Twitter & LinkedIn)...");

    // Twitter Job
    const twitterJob = await prisma.searchJob.create({
        data: {
            term: "Twitter: marketing agency owner",
            status: 'PENDING',
            source: 'TWITTER',
            tenantId: 1
        }
    });

    // LinkedIn Job
    const linkedinJob = await prisma.searchJob.create({
        data: {
            term: "LinkedIn: marketing director in new york",
            status: 'PENDING',
            source: 'LINKEDIN',
            tenantId: 1
        }
    });

    console.log(`Created Jobs: Twitter #${twitterJob.id}, LinkedIn #${linkedinJob.id}`);

    // Process Twitter
    console.log("Processing Twitter Job...");
    await worker.processNextJob();

    // Process LinkedIn
    console.log("Processing LinkedIn Job...");
    await worker.processNextJob();

    // Verify
    const updatedTwitter = await prisma.searchJob.findUnique({
        where: { id: twitterJob.id },
        include: { personas: true }
    });

    const updatedLinkedin = await prisma.searchJob.findUnique({
        where: { id: linkedinJob.id },
        include: { personas: true }
    });

    console.log(`Twitter Job Status: ${updatedTwitter?.status}, Personas: ${updatedTwitter?.personas.length}`);
    console.log(`LinkedIn Job Status: ${updatedLinkedin?.status}, Personas: ${updatedLinkedin?.personas.length}`);

    await prisma.$disconnect();
}
main().catch(console.error);
