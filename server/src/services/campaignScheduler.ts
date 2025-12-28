import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ScheduledEmail {
    campaignId: number;
    leadId: number;
    scheduledAt: Date;
    emailAccountId: number;
    subject: string;
    body: string;
}

class CampaignScheduler {
    private running = false;
    private queue: ScheduledEmail[] = [];

    start() {
        if (this.running) return;
        this.running = true;
        console.log('[Scheduler] Campaign scheduler started');
        this.processQueue();
    }

    stop() {
        this.running = false;
        console.log('[Scheduler] Campaign scheduler stopped');
    }

    async scheduleEmails(
        campaignId: number,
        leadIds: number[],
        emailAccountId: number,
        subject: string,
        body: string,
        dailyLimit: number = 20
    ) {
        const now = new Date();
        const scheduledEmails: ScheduledEmail[] = [];

        // Spread emails across the day
        const intervalMinutes = Math.max(1, Math.floor(480 / dailyLimit)); // 8 hours / limit

        leadIds.forEach((leadId, index) => {
            const scheduledAt = new Date(now.getTime() + index * intervalMinutes * 60 * 1000);
            scheduledEmails.push({
                campaignId,
                leadId,
                scheduledAt,
                emailAccountId,
                subject,
                body
            });
        });

        this.queue.push(...scheduledEmails);
        console.log(`[Scheduler] Queued ${scheduledEmails.length} emails for campaign ${campaignId}`);

        return {
            queued: scheduledEmails.length,
            estimatedCompletion: scheduledEmails[scheduledEmails.length - 1]?.scheduledAt
        };
    }

    private async processQueue() {
        while (this.running) {
            const now = new Date();
            const dueEmails = this.queue.filter(e => e.scheduledAt <= now);

            for (const email of dueEmails) {
                try {
                    // Process the email (actual sending handled by campaignService)
                    console.log(`[Scheduler] Processing email for lead ${email.leadId} in campaign ${email.campaignId}`);

                    // Remove from queue
                    const index = this.queue.indexOf(email);
                    if (index > -1) {
                        this.queue.splice(index, 1);
                    }
                } catch (error) {
                    console.error(`[Scheduler] Failed to process email:`, error);
                }
            }

            // Wait 30 seconds before next check
            await new Promise(resolve => setTimeout(resolve, 30000));
        }
    }

    getQueueStatus() {
        return {
            pending: this.queue.length,
            running: this.running,
            nextScheduled: this.queue.length > 0
                ? this.queue.sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())[0]?.scheduledAt
                : null
        };
    }

    getQueueForCampaign(campaignId: number) {
        return this.queue.filter(e => e.campaignId === campaignId);
    }

    cancelCampaignQueue(campaignId: number) {
        const initialLength = this.queue.length;
        this.queue = this.queue.filter(e => e.campaignId !== campaignId);
        const removed = initialLength - this.queue.length;
        console.log(`[Scheduler] Cancelled ${removed} scheduled emails for campaign ${campaignId}`);
        return removed;
    }
}

export const campaignScheduler = new CampaignScheduler();
