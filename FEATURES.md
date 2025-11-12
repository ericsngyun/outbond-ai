# Outrep.ai - Feature Planning & Roadmap

> **Vision**: AI-powered SDR personalization platform that helps agencies and SMB SaaS personalize hundreds of cold emails in minutes, not hours.

## 🎯 Product Positioning

**Target Audience**:

- Outbound sales teams (5-50 people)
- Agencies doing cold outreach for clients
- SMB SaaS companies with limited SDR resources

**Key Differentiator**:
Speed + Quality - "Personalize 100 cold emails in 10 minutes" with AI that actually sounds human.

**Pricing Strategy**:

- Freemium: 50 personalizations/month
- Starter: $49/mo - 500 personalizations/month
- Pro: $149/mo - 2,000 personalizations/month
- Enterprise: Custom pricing

---

## 📋 Feature Phases

### ✅ Phase 0: Foundation (COMPLETED)

**Status**: Shipped ✓

- [x] Next.js 15 + TypeScript + Tailwind
- [x] Clerk authentication (sign-up, sign-in, protected routes)
- [x] Database schema (User, Subscription models)
- [x] Clerk webhook sync
- [x] Health/version API routes
- [x] CI/CD pipeline (lint, typecheck, test, build)

---

### 🚧 Phase 1: Auth & Billing (IN PROGRESS)

**Goal**: Enable users to sign up and subscribe

**Stripe Integration**:

- [ ] Stripe Checkout (Server Actions)
- [ ] Subscription webhook handler (subscription.created, updated, deleted)
- [ ] Pricing page with 3 tiers
- [ ] Billing Portal integration (manage subscription, update payment method)
- [ ] Usage tracking foundation

**Dashboard Enhancements**:

- [ ] Subscription status display
- [ ] Usage meter (personalizations used/limit)
- [ ] Upgrade/downgrade CTAs

**Testing**:

- [ ] Stripe webhook tests
- [ ] Checkout flow tests
- [ ] Subscription status tests

**Estimated**: 2-3 days

---

### 🎯 Phase 2: Core MVP - CSV Personalization (NEXT)

**Goal**: Deliver the core value proposition - CSV in → personalized emails out

**CSV Upload & Processing**:

- [ ] CSV upload endpoint with validation
- [ ] Column mapping UI (which columns = first name, company, etc.)
- [ ] CSV parsing with Zod schemas
- [ ] Store CSV jobs in database (Job model)
- [ ] Support formats: CSV, Excel, Google Sheets URL

**AI Personalization Engine**:

- [ ] Anthropic Claude integration (primary)
- [ ] Prompt engineering for cold email personalization
- [ ] Multiple personalization strategies:
  - [ ] Pain point analysis
  - [ ] News/achievement mention
  - [ ] Company research
  - [ ] Role-specific messaging
- [ ] Batch processing (25 at a time to avoid rate limits)
- [ ] Token usage tracking

**BullMQ Job Queue**:

- [ ] Setup Redis + BullMQ in production
- [ ] Job processor for personalization
- [ ] Progress tracking (real-time updates)
- [ ] Retry logic for failed jobs
- [ ] Job status: pending, processing, completed, failed

**CSV Export**:

- [ ] Download personalized CSV
- [ ] Add "personalized_line" column to original data
- [ ] Export job results
- [ ] Job history view

**Dashboard Features**:

- [ ] Upload CSV interface
- [ ] Job status tracking
- [ ] Download results
- [ ] Job history table

**Database Models**:

```prisma
model Job {
  id             String   @id @default(cuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id])
  status         JobStatus
  inputFileUrl   String   // S3/cloud storage
  outputFileUrl  String?
  totalRows      Int
  processedRows  Int      @default(0)
  failedRows     Int      @default(0)
  tokensUsed     Int      @default(0)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

enum JobStatus {
  pending
  processing
  completed
  failed
  cancelled
}
```

**Estimated**: 1 week

---

### 🚀 Phase 3: Email Sending Integration

**Goal**: Send emails directly from the platform

**Gmail Integration**:

- [ ] OAuth2 flow for Gmail API
- [ ] Send email via Gmail API
- [ ] Email templates with merge tags
- [ ] Preview before send
- [ ] Schedule sending (rate limiting: 50/day for new Gmail accounts)

**Email Provider Options**:

- [ ] Gmail (primary)
- [ ] Outlook/Office365 (future)
- [ ] SMTP custom (future)

**Sending Features**:

- [ ] Send immediately vs. schedule
- [ ] Personalization token replacement
- [ ] Track sent status in database
- [ ] Email warm-up warnings/education

**Database Models**:

```prisma
model EmailAccount {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  provider      EmailProvider
  email         String
  accessToken   String   @db.Text // encrypted
  refreshToken  String   @db.Text // encrypted
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model SentEmail {
  id              String   @id @default(cuid())
  jobId           String
  job             Job      @relation(fields: [jobId], references: [id])
  recipientEmail  String
  subject         String
  body            String   @db.Text
  sentAt          DateTime
  status          EmailStatus
  messageId       String?  // Provider message ID
}

enum EmailProvider {
  gmail
  outlook
  smtp
}

enum EmailStatus {
  queued
  sent
  failed
  bounced
}
```

**Estimated**: 1 week

---

### 📊 Phase 4: Analytics & Tracking

**Goal**: Help users understand campaign performance

**Email Analytics**:

- [ ] Open tracking (pixel)
- [ ] Click tracking (link wrapping)
- [ ] Reply detection
- [ ] Bounce tracking

**Dashboard Analytics**:

- [ ] Campaign performance overview
- [ ] Open rate, reply rate, bounce rate
- [ ] Best performing personalizations
- [ ] Time-series charts

**Database Models**:

```prisma
model EmailEvent {
  id         String    @id @default(cuid())
  sentEmailId String
  sentEmail   SentEmail @relation(fields: [sentEmailId], references: [id])
  eventType   EmailEventType
  occurredAt  DateTime  @default(now())
  metadata    Json?
}

enum EmailEventType {
  sent
  delivered
  opened
  clicked
  replied
  bounced
  unsubscribed
}
```

**Estimated**: 1 week

---

### 🔥 Phase 5: Sequences & Follow-ups

**Goal**: Multi-touch outreach campaigns

**Sequence Builder**:

- [ ] Visual sequence builder
- [ ] 3-5 step sequences
- [ ] Delay between steps (1 day, 3 days, etc.)
- [ ] A/B testing variants
- [ ] Auto-pause on reply

**Sequence Logic**:

- [ ] Trigger: reply, click, open, time
- [ ] Branching logic (if opened → send follow-up A, else → send B)

**Database Models**:

```prisma
model Sequence {
  id          String         @id @default(cuid())
  userId      String
  user        User           @relation(fields: [userId], references: [id])
  name        String
  isActive    Boolean        @default(false)
  steps       SequenceStep[]
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
}

model SequenceStep {
  id          String   @id @default(cuid())
  sequenceId  String
  sequence    Sequence @relation(fields: [sequenceId], references: [id])
  order       Int
  delayDays   Int
  subject     String
  body        String   @db.Text
  createdAt   DateTime @default(now())
}
```

**Estimated**: 2 weeks

---

### 🎨 Phase 6: Lead Enrichment

**Goal**: Enhance prospect data automatically

**Data Enrichment**:

- [ ] Integration with Apollo.io, Clay, Clearbit
- [ ] Enrich company data (industry, size, funding)
- [ ] Enrich person data (title, LinkedIn, photo)
- [ ] Real-time enrichment during upload

**Enrichment Features**:

- [ ] Auto-enrich on upload (optional)
- [ ] Manual enrichment button
- [ ] Credits/usage tracking
- [ ] Partial enrichment (fill missing fields only)

**Estimated**: 1 week

---

### 🔗 Phase 7: CRM Integrations

**Goal**: Sync with existing sales tools

**CRM Connections**:

- [ ] HubSpot integration
- [ ] Salesforce integration
- [ ] Pipedrive integration

**Sync Features**:

- [ ] Import leads from CRM
- [ ] Export results to CRM
- [ ] Bi-directional sync
- [ ] Custom field mapping

**Estimated**: 2 weeks

---

### 🤖 Phase 8: Advanced AI Features

**Goal**: Smarter, more human-like personalization

**AI Improvements**:

- [ ] Fine-tuned models for better personalization
- [ ] Multiple writing styles (formal, casual, humor)
- [ ] Industry-specific templates
- [ ] A/B test AI models (Claude vs GPT-4)

**AI Playbooks**:

- [ ] User-defined personalization strategies
- [ ] Custom prompts per campaign
- [ ] Personalization quality scoring

**Estimated**: 2 weeks

---

## 🎛️ Technical Architecture

### Current Stack

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript, Tailwind, shadcn/ui
- **Backend**: Next.js API routes, Server Actions
- **Database**: PostgreSQL (Neon) + Prisma ORM
- **Auth**: Clerk
- **Payments**: Stripe
- **Storage**: TBD (AWS S3, Vercel Blob, or Cloudflare R2)
- **Queue**: BullMQ + Upstash Redis
- **AI**: Anthropic Claude (primary), OpenAI (fallback)
- **Email**: Resend (transactional), Gmail API (sending)
- **Hosting**: Vercel (web), Fly.io/Railway (worker)

### Future Considerations

- **Rate Limiting**: Upstash Rate Limit
- **Caching**: Redis for hot data
- **Monitoring**: Sentry + Vercel Analytics
- **Logging**: Structured logs with Axiom or LogDrain

---

## 📈 Success Metrics

**Launch Targets (3 months)**:

- 100 signups
- 20 paying customers
- 5,000 emails personalized
- <5% churn

**Growth Targets (6 months)**:

- 500 signups
- 100 paying customers ($10k MRR)
- 50,000 emails personalized
- <10% churn

---

## 🚧 Known Technical Debt

### To Address Later:

- [ ] Internationalization (i18n)
- [ ] Dark mode
- [ ] Mobile app (React Native?)
- [ ] White-label solution for agencies
- [ ] API for developers
- [ ] Zapier integration

---

## 🔒 Security & Compliance

### Required for Launch:

- [x] Environment variable validation
- [x] Webhook signature verification
- [x] SQL injection prevention (Prisma ORM)
- [ ] Rate limiting on API routes
- [ ] CSRF protection
- [ ] XSS prevention (sanitize user input)

### Required for Scale:

- [ ] SOC 2 Type II certification
- [ ] GDPR compliance
- [ ] Data encryption at rest
- [ ] Regular security audits
- [ ] Bug bounty program

---

## 📝 Notes

**Why This Order?**

1. **Auth & Billing first**: Can't monetize without payments
2. **CSV → AI → CSV MVP**: Core value prop, no dependencies
3. **Email sending next**: Natural progression from CSV export
4. **Analytics after sending**: Need sent emails to track
5. **Sequences after analytics**: Need tracking to auto-pause
6. **Enrichment & CRM**: Nice-to-haves that enhance core product

**Development Velocity**:

- MVP (Phases 0-2): ~2 weeks
- Email sending (Phase 3): +1 week = 3 weeks total
- Analytics (Phase 4): +1 week = 1 month total
- Full featured (Phases 5-8): 2-3 months total

**Competitive Positioning**:

- Faster than Autobound.ai (no complex setup)
- Simpler than Instantly.ai (focused on personalization, not deliverability)
- Cheaper than Apollo.io (no data credits needed)
- Better AI than generic email tools (purpose-built for cold outreach)

---

Last Updated: 2025-11-12
Version: 1.0
