import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { GoogleMapsScraper } from './scrapers/google_maps';
import { AuthService } from './services/authService';
import { tenantMiddleware } from './middleware/auth';
import { AIScraperService } from './services/aiScraperService';
import { SearchQueueWorker } from './services/searchQueue';
import { SerpScraper } from './scrapers/serp';

const app = express();
const prisma = new PrismaClient();
const authService = new AuthService();
const aiScraper = new AIScraperService();
const searchQueue = new SearchQueueWorker();
// Start the worker
searchQueue.start();

const PORT = 3001;

// Rate limiting configurations
const generalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false
});

const aiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20, // 20 AI requests per minute
    message: { error: 'AI rate limit exceeded, please wait a moment.' }
});

const emailLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // 10 email sends per minute
    message: { error: 'Email rate limit exceeded, please slow down.' }
});

// Configure CORS properly
const corsOptions = {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(generalLimiter); // Apply general rate limiting to all routes
app.use(tenantMiddleware); // Apply tenant context to all requests

// Basic Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'active', system: 'Commander Node', tenant: req.tenantId });
});

// ==================== SETTINGS ROUTES ====================

// Runtime config storage (in production, use database or secure vault)
let runtimeConfig = {
    apifyToken: process.env.APIFY_API_TOKEN || '',
    hunterKey: process.env.HUNTER_API_KEY || ''
};

// Get current settings
app.get('/api/settings', (req, res) => {
    res.json({
        apifyToken: runtimeConfig.apifyToken ? '***configured***' : '',
        hunterKey: runtimeConfig.hunterKey ? '***configured***' : '',
        apifyConfigured: !!runtimeConfig.apifyToken,
        hunterConfigured: !!runtimeConfig.hunterKey
    });
});

// Save settings
app.post('/api/settings', (req, res) => {
    const { apifyToken, hunterKey } = req.body;

    // Update runtime config
    if (apifyToken && apifyToken !== '***configured***') {
        runtimeConfig.apifyToken = apifyToken;
        process.env.APIFY_API_TOKEN = apifyToken;
        console.log('[Settings] Apify API token updated');
    }

    if (hunterKey && hunterKey !== '***configured***') {
        runtimeConfig.hunterKey = hunterKey;
        process.env.HUNTER_API_KEY = hunterKey;
        console.log('[Settings] Hunter.io API key updated');
    }

    res.json({
        success: true,
        apifyValid: !!runtimeConfig.apifyToken,
        hunterValid: !!runtimeConfig.hunterKey,
        message: 'Settings saved. New scraping jobs will use updated keys.'
    });
});

// ==================== EMAIL ACCOUNTS ROUTES ====================
import { EmailSender } from './services/emailSender';
const emailSender = new EmailSender();

// Get all email accounts for tenant
app.get('/api/email-accounts', async (req, res) => {
    const tenantId = req.tenantId || 1;

    try {
        const accounts = await prisma.emailAccount.findMany({
            where: { tenantId },
            select: {
                id: true,
                email: true,
                smtpHost: true,
                smtpPort: true,
                smtpUser: true,
                dailyLimit: true,
                sentToday: true,
                isActive: true,
                createdAt: true
            }
        });
        res.json({ status: 'success', accounts });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Create email account
app.post('/api/email-accounts', async (req, res) => {
    const { email, smtpHost, smtpPort, smtpUser, smtpPass, dailyLimit } = req.body;
    const tenantId = req.tenantId || 1;

    if (!email || !smtpHost || !smtpPort || !smtpUser || !smtpPass) {
        return res.status(400).json({ error: 'All SMTP fields are required' });
    }

    try {
        const account = await prisma.emailAccount.create({
            data: {
                email,
                smtpHost,
                smtpPort: parseInt(smtpPort),
                smtpUser,
                smtpPass,
                dailyLimit: dailyLimit || 50,
                tenantId
            }
        });
        res.json({ status: 'success', account: { ...account, smtpPass: '***hidden***' } });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Verify email account connection
app.post('/api/email-accounts/:id/verify', async (req, res) => {
    const id = parseInt(req.params.id);
    const tenantId = req.tenantId || 1;

    try {
        const account = await prisma.emailAccount.findFirst({
            where: { id, tenantId }
        });

        if (!account) {
            return res.status(404).json({ error: 'Account not found' });
        }

        const isValid = await emailSender.verifyConnection({
            host: account.smtpHost,
            port: account.smtpPort,
            user: account.smtpUser,
            pass: account.smtpPass,
            email: account.email
        });

        // Update account status
        await prisma.emailAccount.update({
            where: { id },
            data: { isActive: isValid }
        });

        res.json({ status: 'success', verified: isValid });
    } catch (error: any) {
        res.status(500).json({ error: error.message, verified: false });
    }
});

// Delete email account
app.delete('/api/email-accounts/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const tenantId = req.tenantId || 1;

    try {
        await prisma.emailAccount.deleteMany({
            where: { id, tenantId }
        });
        res.json({ status: 'success', message: 'Account deleted' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== AUTH ROUTES ====================

// Register new user
app.post('/api/auth/register', async (req, res) => {
    const { email, password, name, tenantName } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const user = await authService.register(email, password, name, tenantName);
        res.json(user);
    } catch (error: any) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const user = await authService.login(email, password);

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.json(user);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== LEADS & PERSONAS ROUTES ====================

// Get all leads for tenant
app.get('/api/leads', async (req, res) => {
    const tenantId = req.tenantId || 1;

    try {
        const leads = await prisma.lead.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ status: 'success', leads });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get single lead
app.get('/api/leads/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const tenantId = req.tenantId || 1;

    try {
        const lead = await prisma.lead.findFirst({
            where: { id, tenantId }
        });
        if (!lead) {
            return res.status(404).json({ error: 'Lead not found' });
        }
        res.json({ status: 'success', lead });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get all personas for tenant
app.get('/api/personas', async (req, res) => {
    const tenantId = req.tenantId || 1;

    try {
        const personas = await prisma.persona.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ status: 'success', personas });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get single persona
app.get('/api/personas/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const tenantId = req.tenantId || 1;

    try {
        const persona = await prisma.persona.findFirst({
            where: { id, tenantId }
        });
        if (!persona) {
            return res.status(404).json({ error: 'Persona not found' });
        }
        res.json({ status: 'success', persona });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== TEMPLATES ROUTES ====================

// Get all templates
app.get('/api/templates', async (req, res) => {
    const tenantId = req.tenantId || 1;

    try {
        const templates = await prisma.template.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ status: 'success', templates });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Create template
app.post('/api/templates', async (req, res) => {
    const { name, subject, body } = req.body;
    const tenantId = req.tenantId || 1;

    if (!name || !subject || !body) {
        return res.status(400).json({ error: 'Name, subject, and body are required' });
    }

    try {
        const template = await prisma.template.create({
            data: { name, subject, body, tenantId }
        });
        res.json({ status: 'success', template });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Update template
app.put('/api/templates/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const { name, subject, body } = req.body;
    const tenantId = req.tenantId || 1;

    try {
        const template = await prisma.template.updateMany({
            where: { id, tenantId },
            data: { name, subject, body }
        });
        res.json({ status: 'success', updated: template.count });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Delete template
app.delete('/api/templates/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const tenantId = req.tenantId || 1;

    try {
        await prisma.template.deleteMany({
            where: { id, tenantId }
        });
        res.json({ status: 'success', message: 'Template deleted' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== KNOWLEDGE BASE PROXY ROUTES ====================

import axios from 'axios';
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

// Add knowledge item
app.post('/api/knowledge/add', async (req, res) => {
    const tenantId = req.tenantId || 1;
    const { title, content, knowledge_type, metadata } = req.body;

    if (!title || !content || !knowledge_type) {
        return res.status(400).json({ error: 'Title, content, and knowledge_type are required' });
    }

    try {
        const response = await axios.post(`${AI_ENGINE_URL}/knowledge/add`, {
            tenant_id: tenantId,
            title,
            content,
            knowledge_type,
            metadata
        });
        res.json(response.data);
    } catch (error: any) {
        console.error('Knowledge add error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Query knowledge base
app.post('/api/knowledge/query', async (req, res) => {
    const tenantId = req.tenantId || 1;
    const { query, n_results, knowledge_type } = req.body;

    if (!query) {
        return res.status(400).json({ error: 'Query is required' });
    }

    try {
        const response = await axios.post(`${AI_ENGINE_URL}/knowledge/query`, {
            tenant_id: tenantId,
            query,
            n_results: n_results || 3,
            knowledge_type
        });
        res.json(response.data);
    } catch (error: any) {
        console.error('Knowledge query error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ==================== SEARCH JOB ROUTES ====================

// Get Job Status & Results
app.get('/api/search/job/:id', async (req, res) => {
    const jobId = parseInt(req.params.id);
    const tenantId = req.tenantId || 1;

    try {
        const job = await prisma.searchJob.findFirst({
            where: { id: jobId, tenantId },
            include: {
                leads: true,
                personas: true
            }
        });

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        res.json({
            status: 'success',
            job: {
                id: job.id,
                status: job.status,
                term: job.term,
                source: job.source,
                createdAt: job.createdAt,
                resultCount: (job.leads?.length || 0) + (job.personas?.length || 0)
            },
            data: job.source === 'GOOGLE_MAPS' ? job.leads : job.personas
        });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== SCRAPING ROUTES (ASYNC) ====================

// Google Maps Search Endpoint
app.post('/api/search/maps', async (req, res) => {
    const { term } = req.body;
    const tenantId = req.tenantId || 1;

    if (!term) {
        return res.status(400).json({ error: 'Search term is required' });
    }

    console.log(`[Commander] Enqueueing Maps Search for: ${term} (Tenant: ${tenantId})`);

    try {
        // Create Job (PENDING)
        const job = await prisma.searchJob.create({
            data: {
                term,
                status: 'PENDING',
                source: 'GOOGLE_MAPS',
                tenantId
            }
        });

        // Return immediately
        res.json({ status: 'queued', jobId: job.id });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Persona Search Endpoint (Legacy/SERP)
app.post('/api/search/persona', async (req, res) => {
    const { role, location } = req.body;
    const tenantId = req.tenantId || 1;

    if (!role || !location) {
        return res.status(400).json({ error: 'Role and Location are required' });
    }

    console.log(`[Commander] Starting Persona Search (Sync) for: ${role} in ${location}`);

    try {
        const job = await prisma.searchJob.create({
            data: {
                term: `${role} in ${location}`,
                status: 'RUNNING',
                source: 'PERSONA',
                tenantId
            }
        });

        const scraper = new SerpScraper();
        const results = await scraper.searchPersonas(role, location);

        // Save Personas
        const personasData = results.map(p => ({
            name: p.name,
            role: p.role,
            company: p.company,
            linkedinUrl: p.linkedinUrl,
            source: 'GOOGLE_SERP',
            jobId: job.id,
            tenantId
        }));

        await prisma.persona.createMany({
            data: personasData
        });

        await prisma.searchJob.update({
            where: { id: job.id },
            data: { status: 'COMPLETED' }
        });

        res.json({ status: 'success', jobId: job.id, count: results.length, data: results });

    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== AI SERVICE ROUTES ====================

import { AIService } from './services/aiService';
const aiService = new AIService();

// Generate Email
app.post('/api/ai/generate', async (req, res) => {
    const { leadName, leadCompany, leadRole, userContext, tone } = req.body;
    const tenantId = req.tenantId || 1;

    if (!leadName || !userContext) {
        return res.status(400).json({ error: 'Lead Name and User Context are required' });
    }

    try {
        const email = await aiService.generateEmail({
            tenantId,
            leadName,
            leadCompany,
            leadRole,
            userContext,
            tone
        });

        res.json({ status: 'success', email });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Classify Reply
app.post('/api/ai/classify', async (req, res) => {
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ error: 'Content is required' });
    }

    try {
        const classification = await aiService.classifyReply(content);
        res.json({ status: 'success', classification });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== REPLY TRACKING ROUTES ====================

// Log a new reply (and auto-classify if AI engine available)
app.post('/api/replies', async (req, res) => {
    const { emailLogId, content } = req.body;
    const tenantId = req.tenantId || 1;

    if (!emailLogId || !content) {
        return res.status(400).json({ error: 'Email Log ID and content are required' });
    }

    try {
        // Try to classify the reply using AI
        let sentiment = 'NEUTRAL';
        let intent = 'UNKNOWN';

        try {
            const classification = await aiService.classifyReply(content);
            sentiment = classification.sentiment || 'NEUTRAL';
            intent = classification.intent || 'UNKNOWN';
        } catch {
            console.log('[Replies] AI classification unavailable, using defaults');
        }

        // Create the reply
        const reply = await prisma.reply.create({
            data: {
                emailLogId: parseInt(emailLogId),
                content,
                sentiment,
                intent
            }
        });

        // Update the email log to mark as replied
        await prisma.emailLog.update({
            where: { id: parseInt(emailLogId) },
            data: { replied: true }
        });

        // Update campaign reply count
        const emailLog = await prisma.emailLog.findUnique({
            where: { id: parseInt(emailLogId) }
        });

        if (emailLog) {
            await prisma.campaign.update({
                where: { id: emailLog.campaignId },
                data: { repliesCount: { increment: 1 } }
            });
        }

        res.json({ status: 'success', reply });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get all replies for an email log
app.get('/api/email-logs/:id/replies', async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        const replies = await prisma.reply.findMany({
            where: { emailLogId: id },
            orderBy: { receivedAt: 'desc' }
        });
        res.json({ status: 'success', replies });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get all email logs for a campaign with replies
app.get('/api/campaigns/:id/email-logs', async (req, res) => {
    const id = parseInt(req.params.id);
    const tenantId = req.tenantId || 1;

    try {
        const emailLogs = await prisma.emailLog.findMany({
            where: { campaignId: id },
            include: {
                lead: { select: { name: true, email: true, company: true } },
                replies: true
            },
            orderBy: { sentAt: 'desc' }
        });
        res.json({ status: 'success', emailLogs });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get analytics summary for all campaigns
app.get('/api/analytics', async (req, res) => {
    const tenantId = req.tenantId || 1;

    try {
        const campaigns = await prisma.campaign.findMany({
            where: { tenantId },
            include: {
                emailLogs: {
                    include: { replies: true }
                }
            }
        });

        // Build analytics data
        const totalCampaigns = campaigns.length;
        const totalSent = campaigns.reduce((a, c) => a + c.emailsSent, 0);
        const totalOpened = campaigns.reduce((a, c) => a + c.emailLogs.filter(l => l.opened).length, 0);
        const totalReplied = campaigns.reduce((a, c) => a + c.emailLogs.filter(l => l.replied).length, 0);

        // Reply sentiment breakdown
        const allReplies = campaigns.flatMap(c => c.emailLogs.flatMap(l => l.replies));
        const sentimentBreakdown = {
            positive: allReplies.filter(r => r.sentiment === 'POSITIVE').length,
            neutral: allReplies.filter(r => r.sentiment === 'NEUTRAL').length,
            negative: allReplies.filter(r => r.sentiment === 'NEGATIVE').length
        };

        // Intent breakdown
        const intentBreakdown = {
            interested: allReplies.filter(r => r.intent === 'INTERESTED').length,
            notInterested: allReplies.filter(r => r.intent === 'NOT_INTERESTED').length,
            question: allReplies.filter(r => r.intent === 'QUESTION').length,
            unknown: allReplies.filter(r => r.intent === 'UNKNOWN').length
        };

        // Campaign performance
        const campaignPerformance = campaigns.map(c => ({
            id: c.id,
            name: c.name,
            sent: c.emailsSent,
            opened: c.emailLogs.filter(l => l.opened).length,
            replied: c.emailLogs.filter(l => l.replied).length,
            openRate: c.emailsSent > 0 ? Math.round(c.emailLogs.filter(l => l.opened).length / c.emailsSent * 100) : 0,
            replyRate: c.emailsSent > 0 ? Math.round(c.emailLogs.filter(l => l.replied).length / c.emailsSent * 100) : 0
        }));

        res.json({
            status: 'success',
            analytics: {
                totalCampaigns,
                totalSent,
                totalOpened,
                totalReplied,
                openRate: totalSent > 0 ? Math.round(totalOpened / totalSent * 100) : 0,
                replyRate: totalSent > 0 ? Math.round(totalReplied / totalSent * 100) : 0,
                sentimentBreakdown,
                intentBreakdown,
                campaignPerformance
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== CAMPAIGN MANAGEMENT ROUTES ====================

import { CampaignService } from './services/campaignService';
const campaignService = new CampaignService();

// Get all campaigns
app.get('/api/campaigns', async (req, res) => {
    const tenantId = req.tenantId || 1;

    try {
        const campaigns = await campaignService.getCampaigns(tenantId);
        res.json({ status: 'success', campaigns });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get single campaign
app.get('/api/campaigns/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const tenantId = req.tenantId || 1;

    try {
        const campaign = await campaignService.getCampaign(id, tenantId);
        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }
        res.json({ status: 'success', campaign });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Create campaign
app.post('/api/campaigns', async (req, res) => {
    const { name } = req.body;
    const tenantId = req.tenantId || 1;
    const userId = 1; // TODO: Get from auth

    if (!name) {
        return res.status(400).json({ error: 'Campaign name is required' });
    }

    try {
        const campaign = await campaignService.createCampaign({ name, userId, tenantId });
        res.json({ status: 'success', campaign });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Start campaign
app.post('/api/campaigns/:id/start', async (req, res) => {
    const id = parseInt(req.params.id);
    const tenantId = req.tenantId || 1;

    try {
        const campaign = await campaignService.startCampaign(id, tenantId);
        res.json({ status: 'success', campaign });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Pause campaign
app.post('/api/campaigns/:id/pause', async (req, res) => {
    const id = parseInt(req.params.id);
    const tenantId = req.tenantId || 1;

    try {
        const campaign = await campaignService.pauseCampaign(id, tenantId);
        res.json({ status: 'success', campaign });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get campaign stats
app.get('/api/campaigns/:id/stats', async (req, res) => {
    const id = parseInt(req.params.id);
    const tenantId = req.tenantId || 1;

    try {
        const stats = await campaignService.getStats(id, tenantId);
        res.json({ status: 'success', stats });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get available leads for campaign (not yet emailed)
app.get('/api/campaigns/:id/available-leads', async (req, res) => {
    const id = parseInt(req.params.id);
    const tenantId = req.tenantId || 1;

    try {
        const leads = await campaignService.getAvailableLeads(id, tenantId);
        res.json({ status: 'success', leads });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get queued/sent leads for campaign
app.get('/api/campaigns/:id/queue', async (req, res) => {
    const id = parseInt(req.params.id);
    const tenantId = req.tenantId || 1;

    try {
        const queue = await campaignService.getQueuedLeads(id, tenantId);
        res.json({ status: 'success', queue });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Execute campaign - send emails to selected leads
app.post('/api/campaigns/:id/execute', async (req, res) => {
    const id = parseInt(req.params.id);
    const tenantId = req.tenantId || 1;
    const { leadIds, emailAccountId, subject, body, useAi } = req.body;

    if (!leadIds || !leadIds.length) {
        return res.status(400).json({ error: 'Lead IDs are required' });
    }

    if (!emailAccountId) {
        return res.status(400).json({ error: 'Email account ID is required' });
    }

    if (!subject || !body) {
        return res.status(400).json({ error: 'Email subject and body are required' });
    }

    try {
        // Get email account
        const emailAccount = await prisma.emailAccount.findFirst({
            where: { id: emailAccountId, tenantId }
        });

        if (!emailAccount) {
            return res.status(404).json({ error: 'Email account not found' });
        }

        if (!emailAccount.isActive) {
            return res.status(400).json({ error: 'Email account is not verified' });
        }

        // Check daily limit
        if (emailAccount.sentToday >= emailAccount.dailyLimit) {
            return res.status(400).json({ error: 'Daily send limit reached for this account' });
        }

        // Execute campaign
        const result = await campaignService.executeCampaign(
            id,
            tenantId,
            leadIds,
            emailAccount,
            subject,
            body,
            emailSender
        );

        res.json({ status: 'success', ...result });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== AI-POWERED SCRAPING ROUTES (ASYNC) ====================

// Reddit Scraping
app.post('/api/search/reddit', async (req, res) => {
    const { subreddits, keywords, limit } = req.body;
    const tenantId = req.tenantId || 1;

    if (!subreddits || !keywords) {
        return res.status(400).json({ error: 'Subreddits and keywords are required' });
    }

    try {
        // Create Job
        const job = await prisma.searchJob.create({
            data: {
                term: `Reddit: ${keywords.join(', ')} in ${subreddits.join(', ')}`,
                status: 'PENDING',
                source: 'REDDIT',
                tenantId
            }
        });

        res.json({ status: 'queued', jobId: job.id });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Twitter Scraping
app.post('/api/search/twitter', async (req, res) => {
    const { query, maxResults } = req.body;
    const tenantId = req.tenantId || 1;

    if (!query) {
        return res.status(400).json({ error: 'Query is required' });
    }

    try {
        const job = await prisma.searchJob.create({
            data: {
                term: `Twitter: ${query}`,
                status: 'PENDING',
                source: 'TWITTER',
                tenantId
            }
        });

        res.json({ status: 'queued', jobId: job.id });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// LinkedIn Scraping
app.post('/api/search/linkedin', async (req, res) => {
    const { keywords, location, limit } = req.body;
    const tenantId = req.tenantId || 1;

    if (!keywords) {
        return res.status(400).json({ error: 'Keywords are required' });
    }

    try {
        const job = await prisma.searchJob.create({
            data: {
                term: `LinkedIn: ${keywords} ${location || ''}`,
                status: 'PENDING',
                source: 'LINKEDIN',
                tenantId
            }
        });

        res.json({ status: 'queued', jobId: job.id });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`[Commander] Server running on http://localhost:${PORT}`);
});
