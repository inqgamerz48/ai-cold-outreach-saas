import nodemailer from 'nodemailer';

interface EmailAccountConfig {
    host: string;
    port: number;
    user: string;
    pass: string;
    email: string; // The "From" address
}

interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    replyTo?: string;
}

export class EmailSender {
    /**
     * Send an email using the specified account configuration
     */
    async sendEmail(account: EmailAccountConfig, options: SendEmailOptions): Promise<string> {
        try {
            const transporter = nodemailer.createTransport({
                host: account.host,
                port: account.port,
                secure: account.port === 465, // true for 465, false for other ports
                auth: {
                    user: account.user,
                    pass: account.pass,
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            const info = await transporter.sendMail({
                from: `"Outreach Pro" <${account.email}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
                replyTo: options.replyTo || account.email,
            });

            console.log(`[EmailSender] ✅ Sent email to ${options.to}. MessageId: ${info.messageId}`);
            return info.messageId;

        } catch (error: any) {
            console.error(`[EmailSender] ❌ Failed to send to ${options.to}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Verify SMTP connection
     */
    async verifyConnection(account: EmailAccountConfig): Promise<boolean> {
        try {
            const transporter = nodemailer.createTransport({
                host: account.host,
                port: account.port,
                secure: account.port === 465,
                auth: {
                    user: account.user,
                    pass: account.pass,
                }
            });

            await transporter.verify();
            console.log('[EmailSender] ✅ SMTP connection verified');
            return true;
        } catch (error: any) {
            console.error('[EmailSender] ❌ Verification failed:', error.message);
            return false;
        }
    }
}
