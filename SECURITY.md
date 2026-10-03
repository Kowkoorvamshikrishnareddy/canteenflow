# Security Policy — CanteenFlow

## 1. Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## 2. Reporting a Vulnerability

The CanteenFlow security team takes all vulnerability reports seriously. If you identify a potential security issue:

1. **Do NOT open a public GitHub Issue.**
2. Report the vulnerability privately via GitHub Security Advisories or by emailing the project maintainer.
3. Include detailed reproduction steps, request/response examples, and affected components.
4. Allow reasonable time for remediation prior to public disclosure.

---

## 3. Security Architecture & Controls

### 3.1 Authentication & Authorization
- **Cryptographic Tokens**: Standard JWT tokens signed with `JWT_SECRET` (HMAC SHA-256) with strict expiration.
- **Production Guardrails**: In `NODE_ENV=production`, header spoofing (`x-user-id`) and default fallback accounts are strictly disabled. Only cryptographically verified tokens are granted access.
- **Role-Based Access Control (RBAC)**: All administrative and kitchen counter endpoints are gated by `requireRole(['staff', 'admin'])` or `requireRole('admin')`.
- **Row-Level Tenant Isolation**: Orders, inventory, and analytics queries strictly require tenant matching (`collegeId` / `canteenId`) and prevent students from reading or tampering with other users' records.

### 3.2 Secret Management & GitHub Hygiene
- **Never Commit Secrets**: The repository includes a hardened `.gitignore` that ignores `.env`, `.env.*`, and `*.local` files.
- **Environment Template**: Only `.env.example` with empty placeholder values is committed to version control.
- **Cloud Secret Configuration**:
  - **Vercel (Frontend)**: Set `VITE_API_URL` to your production backend URL. Do not inject private keys or service secrets into client bundles.
  - **Render / Railway (Backend)**: Inject `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, `JWT_SECRET`, and `SESSION_SECRET` securely via the hosting provider's Environment Secret settings.
  - **GitHub Actions**: Use GitHub Repository Secrets (`Settings > Secrets and variables > Actions`) for any automated deployment credentials.

### 3.3 Payment Security
- **Server-Side Intent Generation**: Payment amounts are verified server-side against actual menu item prices and cart calculations to prevent client price tampering.
- **HMAC SHA-256 Signature Verification**: In live Razorpay mode, payment completion requires verifying cryptographic signatures (`crypto.createHmac('sha256', env.RAZORPAY_KEY_SECRET)`).
- **Idempotency**: Webhook events and order settlement are processed idempotently to prevent replay attacks.

### 3.4 Network & HTTP Protection
- **Helmet**: Secures HTTP response headers against clickjacking, MIME-sniffing, and XSS.
- **CORS Whitelisting**: Strict origin controls restrict API access to permitted frontend domains (`env.CLIENT_URL`).
- **Rate Limiting**: Express rate limiting (`express-rate-limit`) mitigates brute-force attacks and denial-of-service attempts.
