import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateCampaignData {
    name: string;
    userId: number;
    tenantId: number;
}

export class CampaignService {
    /**
     * Create a new campaign
     */
    async createCampaign(data: CreateCampaignData) {
        return await prisma.campaign.create({
            data: {
                name: data.name,
                status: 'DRAFT',
                userId: data.userId,
                tenantId: data.tenantId
            }
        });
    }

    /**
     * Get all campaigns for a tenant
     */
    async getCampaigns(tenantId: number) {
        return await prisma.campaign.findMany({
            where: { tenantId },
            include: {
                user: { select: { name: true, email: true } },
                emailLogs: { select: { id: true, sentAt: true, opened: true, replied: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Get a single campaign by ID
     */
    async getCampaign(id: number, tenantId: number) {
        return await prisma.campaign.findFirst({
            where: { id, tenantId },
            include: {
                user: true,
                emailLogs: {
                    include: {
                        lead: true,
                        replies: true
                    }
                }
            }
        });
    }

    /**
     * Start a campaign
     */
    async startCampaign(id: number, tenantId: number) {
        const campaign = await prisma.campaign.findFirst({
            where: { id, tenantId }
        });

        if (!campaign) {
            throw new Error('Campaign not found');
        }

        if (campaign.status !== 'DRAFT' && campaign.status !== 'PAUSED') {
            throw new Error('Can only start campaigns that are DRAFT or PAUSED');
        }

        return await prisma.campaign.update({
            where: { id },
            data: { status: 'ACTIVE' }
        });
    }

    /**
     * Pause a campaign
     */
    async pauseCampaign(id: number, tenantId: number) {
        return await prisma.campaign.update({
            where: { id },
            data: { status: 'PAUSED' }
        });
    }

    /**
     * Get campaign stats
     */
    async getStats(id: number, tenantId: number) {
        const campaign = await prisma.campaign.findFirst({
            where: { id, tenantId },
            include: {
                emailLogs: {
                    include: {
                        replies: true
                    }
                }
            }
        });

        if (!campaign) {
            throw new Error('Campaign not found');
        }

        const totalSent = campaign.emailLogs.length;
        const totalOpened = campaign.emailLogs.filter(log => log.opened).length;
        const totalReplied = campaign.emailLogs.filter(log => log.replied).length;

        return {
            totalSent,
            totalOpened,
            totalReplied,
            openRate: totalSent > 0 ? (totalOpened / totalSent * 100).toFixed(1) : '0',
            replyRate: totalSent > 0 ? (totalReplied / totalSent * 100).toFixed(1) : '0'
        };
    }

    /**
     * Log an email sent
     */
    async logEmail(campaignId: number, leadId: number, subject: string, body: string, messageId?: string) {
        const emailLog = await prisma.emailLog.create({
            data: {
                campaignId,
                leadId,
                subject,
                body,
                sentAt: new Date()
            }
        });

        // Update campaign count
        await prisma.campaign.update({
            where: { id: campaignId },
            data: { emailsSent: { increment: 1 } }
        });

        return emailLog;
    }

    /**
     * Get leads available to add to a campaign (not already emailed)
     */
    async getAvailableLeads(campaignId: number, tenantId: number) {
        // Get leads that haven't been emailed in this campaign
        const campaign = await prisma.campaign.findFirst({
            where: { id: campaignId, tenantId },
            include: { emailLogs: { select: { leadId: true } } }
        });

        if (!campaign) throw new Error('Campaign not found');

        const emailedLeadIds = campaign.emailLogs.map(log => log.leadId);

        return await prisma.lead.findMany({
            where: {
                tenantId,
                email: { not: null },
                id: { notIn: emailedLeadIds }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Get queued leads for a campaign (pending emails)
     */
    async getQueuedLeads(campaignId: number, tenantId: number) {
        const campaign = await prisma.campaign.findFirst({
            where: { id: campaignId, tenantId },
            include: {
                emailLogs: {
                    include: { lead: true }
                }
            }
        });

        if (!campaign) throw new Error('Campaign not found');
        return campaign.emailLogs;
    }

    /**
     * Execute campaign - send emails to leads
     * Returns number of emails sent
     */
    async executeCampaign(
        campaignId: number,
        tenantId: number,
        leadIds: number[],
        emailAccount: any,
        emailSubject: string,
        emailBody: string,
        emailSender: any,
        aiService?: any
    ): Promise<{ sent: number; errors: string[] }> {
        const campaign = await prisma.campaign.findFirst({
            where: { id: campaignId, tenantId }
        });

        if (!campaign) throw new Error('Campaign not found');
        if (campaign.status !== 'ACTIVE') {
            throw new Error('Campaign must be ACTIVE to execute');
        }

        const leads = await prisma.lead.findMany({
            where: {
                id: { in: leadIds },
                tenantId,
                email: { not: null }
            }
        });

        let sent = 0;
        const errors: string[] = [];

        for (const lead of leads) {
            if (!lead.email) continue;

            try {
                // Replace template variables
                let subject = emailSubject
                    .replace(/\{\{name\}\}/g, lead.name || 'there')
                    .replace(/\{\{company\}\}/g, lead.company || 'your company');

                let body = emailBody
                    .replace(/\{\{name\}\}/g, lead.name || 'there')
                    .replace(/\{\{company\}\}/g, lead.company || 'your company');

                // Send email
                const messageId = await emailSender.sendEmail(
                    {
                        host: emailAccount.smtpHost,
                        port: emailAccount.smtpPort,
                        user: emailAccount.smtpUser,
                        pass: emailAccount.smtpPass,
                        email: emailAccount.email
                    },
                    {
                        to: lead.email,
                        subject,
                        html: body
                    }
                );

                // Log the email
                await this.logEmail(campaignId, lead.id, subject, body, messageId);
                sent++;

                // Rate limit: delay between emails
                await new Promise(resolve => setTimeout(resolve, 2000));

            } catch (error: any) {
                errors.push(`Failed to send to ${lead.email}: ${error.message}`);
            }
        }

        // Update email account sent count
        await prisma.emailAccount.update({
            where: { id: emailAccount.id },
            data: { sentToday: { increment: sent } }
        });

        return { sent, errors };
    }
}

