# ParcelPilot — Courier & Logistics Platform

A role-aware Next.js App Router frontend for the B7A6 courier logistics API. Customers book and track shipments, couriers manage assigned deliveries, and administrators operate the courier, hub, pricing, and shipment workflows.

## Stack

- Next.js 16 App Router and TypeScript
- Tailwind CSS 4 with Radix UI Alert Dialog and Tooltip primitives
- TanStack Query for API data fetching, caching, and mutations
- Zustand for the in-memory signed-in user
- React Hook Form and Zod for authentication and operational forms
- bKash Tokenized Checkout; payment state is verified by the backend callback

## Run locally

1. Start the B7A6 backend and its database. Its API should be reachable at `http://localhost:4000/api/v1`.
2. Copy `.env.local.example` to `.env.local`. Set `BACKEND_API_URL` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.
3. Configure the backend `FRONTEND_URL` as `http://localhost:3000`.
4. Configure backend bKash sandbox credentials and set `BKASH_CALLBACK_URL` to the public backend URL followed by `/api/v1/payments/bkash/callback`.
5. Run:

   ```bash
   npm install
   npm run dev
   ```

The application opens at `http://localhost:3000`. The Next.js server proxies browser API requests through `/api/backend/*`; set cookies are scoped to the frontend origin and remain HTTP-only. Access-token refresh is attempted through the backend refresh-token endpoint after an API `401`.

## Demo logins

The login screen includes one-click Customer, Courier, and Admin demo buttons. Configure these **server-only** environment variables in `.env.local` (and in the deployment environment):

```text
DEMO_ADMIN_EMAIL=
DEMO_ADMIN_PASSWORD=
DEMO_CUSTOMER_EMAIL=
DEMO_CUSTOMER_PASSWORD=
DEMO_COURIER_EMAIL=
DEMO_COURIER_PASSWORD=
```

Use dedicated evaluation accounts. The backend must contain those accounts; its courier accounts are created by an administrator. Never commit actual credentials. If the variables are unset, the demo buttons explain that demo login is not configured.

## Google sign-in

Google sign-in is shown on the login tab when `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is configured. The frontend sends Google's ID token to the backend `/auth/google` endpoint; the backend verifies it against its own `GOOGLE_CLIENT_ID` and sets the same HTTP-only session cookies as password login. Configure the same Google OAuth client ID in the frontend `.env.local` and backend `.env`. In Google Cloud Console, add the exact frontend origins used for local and deployed testing (for example `http://localhost:3000` and your deployed frontend origin) to the OAuth client's authorized JavaScript origins. Restart the frontend after changing `NEXT_PUBLIC_*` values.

## Frontend workflows

### Customer

- Register or log in; review shipment history and notifications.
- Create a shipment by choosing active pickup/destination hubs, adding parcel and contact details, and calculating the backend route price.
- Open shipment details, follow the tracking timeline, cancel before pickup, or continue to bKash checkout.
- Track publicly using the tracking code.

### Courier

- See assigned shipments and earnings/delivery totals.
- Change availability and advance an assigned shipment through the backend-allowed status transitions.
- Review shipment notes, locations, and tracking history.

### Admin

- Review network totals and paid revenue.
- Search/filter shipments, assign available couriers, and update operational status.
- Manage user roles/accounts and create courier accounts.
- Manage zones, hubs, active state, route prices, and audit history.

Backend authorization remains authoritative. Hiding a navigation item is only a UI affordance; protected requests are still checked by the B7A6 API.

## Payment return flow

The frontend only initiates the backend's configured bKash provider. It redirects to the returned `paymentURL`; the public backend callback executes and verifies the transaction, then redirects the browser to `/payment/result`. The result page reads the payment record from the authenticated API and reports success only after the backend returns `PAID`. No simulated payment path is included.

## Production configuration

On the frontend deployment, configure `BACKEND_API_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, and the three demo account pairs. On the backend, configure `GOOGLE_CLIENT_ID` to the same Google OAuth client ID, `FRONTEND_URL` as the exact frontend origin, and `BKASH_CALLBACK_URL` as the public backend callback endpoint. Use bKash sandbox values for test evaluation and live credentials only for an appropriately configured production merchant account. Do not place API secrets in `NEXT_PUBLIC_*` variables; the Google client ID is public, but backend secrets are not.

## Validation

```bash
npx tsc --noEmit
npm run build
```
