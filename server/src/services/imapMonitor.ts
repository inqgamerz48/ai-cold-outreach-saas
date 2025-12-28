import Imap from 'imap';
import { simpleParser } from 'mailparser';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ImapConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    tls: boolean;
}

interface EmailMessage {
    from: string;
    subject: string;
    body: string;
    date: Date;
    messageId: string;
}

export class ImapMonitor {
    private running = false;
    private pollingInterval: NodeJS.Timeout | null = null;

    /**
     * Start monitoring inbox for replies
     */
    start(intervalMs: number = 60000) { // Check every minute
        if (this.running) return;
        this.running = true;
        console.log('[ImapMonitor] Started inbox monitoring');

        this.poll(); // Initial poll
        this.pollingInterval = setInterval(() => this.poll(), intervalMs);
    }

    stop() {
        this.running = false;
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
        console.log('[ImapMonitor] Stopped inbox monitoring');
    }

    private async poll() {
        try {
            // Get all active email accounts with IMAP configured
            const accounts = await prisma.emailAccount.findMany({
                where: {
                    isActive: true,
                    imapHost: { not: null }
                }
            });

            for (const account of accounts) {
                if (!account.imapHost || !account.imapPort) continue;

                await this.checkInbox({
                    host: account.imapHost,
                    port: account.imapPort,
                    user: account.smtpUser,
                    password: account.smtpPass,
                    tls: true
                }, account.id);
            }
        } catch (error) {
            console.error('[ImapMonitor] Poll error:', error);
        }
    }

    /**
     * Check inbox for new messages
     */
    async checkInbox(config: ImapConfig, accountId: number): Promise<EmailMessage[]> {
        return new Promise((resolve, reject) => {
            const imap = new Imap({
                user: config.user,
                password: config.password,
                host: config.host,
                port: config.port,
                tls: config.tls,
                tlsOptions: { rejectUnauthorized: false }
            });

            const messages: EmailMessage[] = [];

            imap.once('ready', () => {
                imap.openBox('INBOX', false, (err, box) => {
                    if (err) {
                        imap.end();
                        return reject(err);
                    }

                    // Search for unseen messages from last 24 hours
                    const sinceDate = new Date();
                    sinceDate.setDate(sinceDate.getDate() - 1);

                    imap.search(['UNSEEN', ['SINCE', sinceDate]], (err, results) => {
                        if (err || !results.length) {
                            imap.end();
                            return resolve([]);
                        }

                        const fetch = imap.fetch(results, { bodies: '', markSeen: true });

                        fetch.on('message', (msg) => {
                            msg.on('body', (stream) => {
                                simpleParser(stream as any, async (err, parsed) => {
                                    if (err) return;

                                    const email: EmailMessage = {
                                        from: Array.isArray(parsed.from?.value)
                                            ? parsed.from.value[0]?.address || ''
                                            : '',
                                        subject: parsed.subject || '',
                                        body: parsed.text || '',
                                        date: parsed.date || new Date(),
                                        messageId: parsed.messageId || ''
                                    };

                                    messages.push(email);

                                    // Try to match with sent email and create reply
                                    await this.processReply(email, accountId);
                                });
                            });
                        });

                        fetch.once('end', () => {
                            imap.end();
                            resolve(messages);
                        });
                    });
                });
            });

            imap.once('error', (err: Error) => {
                console.error('[ImapMonitor] IMAP error:', err.message);
                reject(err);
            });

            imap.connect();
        });
    }

    /**
     * Process a reply and match to email log
     */
    private async processReply(email: EmailMessage, accountId: number) {
        try {
            // Find the original email by sender's email
            const emailLog = await prisma.emailLog.findFirst({
                where: {
                    lead: {
                        email: email.from
                    },
                    replied: false
                },
                orderBy: { sentAt: 'desc' }
            });

            if (!emailLog) {
                console.log(`[ImapMonitor] No matching email log for reply from ${email.from}`);
                return;
            }

            // Create reply record
            const reply = await prisma.reply.create({
                data: {
                    emailLogId: emailLog.id,
                    content: email.body,
                    sentiment: 'NEUTRAL', // Will be classified by AI
                    intent: 'UNKNOWN'
                }
            });

            // Mark email as replied
            await prisma.emailLog.update({
                where: { id: emailLog.id },
                data: { replied: true }
            });

            // Update campaign reply count
            await prisma.campaign.update({
                where: { id: emailLog.campaignId },
                data: { repliesCount: { increment: 1 } }
            });

            console.log(`[ImapMonitor] ✅ Logged reply from ${email.from} for email log ${emailLog.id}`);

            return reply;
        } catch (error) {
            console.error('[ImapMonitor] Failed to process reply:', error);
        }
    }

    /**
     * Test IMAP connection
     */
    async testConnection(config: ImapConfig): Promise<boolean> {
        return new Promise((resolve) => {
            const imap = new Imap({
                user: config.user,
                password: config.password,
                host: config.host,
                port: config.port,
                tls: config.tls,
                tlsOptions: { rejectUnauthorized: false },
                connTimeout: 10000
            });

            imap.once('ready', () => {
                console.log('[ImapMonitor] ✅ IMAP connection successful');
                imap.end();
                resolve(true);
            });

            imap.once('error', (err: Error) => {
                console.error('[ImapMonitor] ❌ IMAP connection failed:', err.message);
                resolve(false);
            });

            imap.connect();
        });
    }
}

export const imapMonitor = new ImapMonitor();
