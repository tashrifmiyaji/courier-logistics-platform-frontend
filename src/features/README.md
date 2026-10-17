# Frontend feature layout

Each domain keeps its backend requests and React Query hooks beside each other:

```text
src/
  lib/
    api-client.ts       Shared HTTP transport, cookies, refresh, and API errors
    api.ts              Shared domain types and display helpers
  features/
    auth/
      api.ts            Login, registration, Google sign-in, and logout requests
      hooks.ts          Authentication mutations
    shipments/
      api.ts            Shipment, tracking, status, and assignment requests
      hooks.ts          Shipment queries and mutations
    users/
      api.ts            Profile, availability, and notification requests
      hooks.ts          Profile and notification queries/mutations
    operations/
      api.ts            Hub, zone, route quote, and pricing requests
      hooks.ts          Hub, zone, and quote queries/mutations
    admin/
      api.ts            Network statistics, people, courier, and audit requests
      hooks.ts          Administrator data queries
    payments/
      api.ts            bKash initiation and payment lookup requests
      hooks.ts          Payment initiation and lookup
```

Follow the request from a screen to the server in this order:

1. A page or component calls a feature hook (for example `useShipments`).
2. The hook in that feature's `hooks.ts` calls a function from its `api.ts`.
3. That function calls `apiClient` from `src/lib/api-client.ts`.
4. The shared client sends the request through the same-origin Next.js proxy at `/api/backend`, includes the HTTP-only session cookies, refreshes an expired access token, and throws `ApiError` for unsuccessful or malformed responses.

When adding a backend endpoint, add its typed request function to the matching feature's `api.ts`, then add a hook there if it needs React Query caching or mutation state. Keep page components focused on rendering, form state, and user feedback.
