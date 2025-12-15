# Upwork / LinkedIn 提出用キット（英語テンプレ）

このファイルは **そのままコピペして使える**提案文・投稿文・リンク集のテンプレです。  
DocuFlow はポートフォリオ用途のため、公開URLは英語LPを正として貼ります。

---

## リンク（貼るだけ）

- Product (EN): `https://docuflow-azure.vercel.app/en`
- Pricing (EN): `https://docuflow-azure.vercel.app/en/pricing`
- Repo: （GitHub URLを貼る）

---

## Upwork 提案文テンプレ（短め）

Hi [Client Name],

I’m a full-stack engineer. I built **DocuFlow**, an AI-powered document workspace for PDFs/Docs.

What makes it “production-grade” (not just a UI demo):

- **Server-side RBAC** for org operations (Owner/Admin/Member) + database **RLS alignment**
- **Scoped data access** to prevent ID-only leakage and unauthorized mutations
- **AI quota enforcement** across features (no bypass paths)
- **Expiring share links** (plan-based) + token rotation
- **Rate limiting** for heavy endpoints (export)
- **Audit logs** + **Sentry tagging** for critical events (billing/org actions)

Links:
- Live (EN): https://docuflow-azure.vercel.app/en
- Pricing (EN): https://docuflow-azure.vercel.app/en/pricing

If you share your requirements (scope, timeline, constraints), I can propose an implementation plan and a milestone-based delivery.

Best,  
[Your Name]

---

## Upwork 提案文テンプレ（長め：信頼重視）

Hi [Client Name],

I’m a full-stack engineer specializing in **Next.js + Supabase + Stripe**.
I recently shipped a portfolio-grade product called **DocuFlow** (AI document workspace) designed to demonstrate real production concerns:

**Security / Access control**
- Server-side org RBAC (Owner/Admin/Member) for invitations, role changes, member removal, org deletion, and ownership transfer
- DB-side RLS alignment to prevent privilege bypass
- Document fetch/mutations scoped by `user_id` where needed to avoid ID-only leakage

**Plan limits & abuse prevention**
- AI usage is always accounted server-side (quota enforcement)
- Storage limits enforced by real content size (not just file size)
- Rate limiting for heavy endpoints (export)
- Share links with plan-based expiration & token regeneration

**Observability**
- Audit logs for critical actions
- Sentry events tagged for alerting on billing/org critical events

Live pages:
- https://docuflow-azure.vercel.app/en
- https://docuflow-azure.vercel.app/en/pricing

If you tell me what you’re building (product, users, constraints), I can suggest a secure architecture and ship iteratively with clear milestones.

Best,  
[Your Name]

---

## LinkedIn 投稿テンプレ（英語）

I built **DocuFlow** — an AI-powered document workspace for PDFs/Docs.

What I focused on (beyond UI):
- Server-side RBAC + DB RLS alignment
- Quota-enforced AI features (no bypass paths)
- Expiring share links + audit logs
- Rate limiting for heavy endpoints
- Stripe billing scope + Sentry tagging for critical events

Live (EN): https://docuflow-azure.vercel.app/en  
Pricing (EN): https://docuflow-azure.vercel.app/en/pricing

If you’re building a SaaS with Next.js/Supabase/Stripe and need help with security, billing, or observability, feel free to reach out.


