# Cure-All API Client

Shared API client for web and mobile apps. Uses the standard API response
envelope and supports cookie or bearer modes.

## Usage

```ts
import { createApiClient } from "@cure-all/api-client";

const client = createApiClient({
  baseUrl: "http://localhost:3000",
  authMode: "cookie",
});

const response = await client.get<{ status: string }>("/health");
if (response.ok) {
  console.log(response.data?.status);
}
```

## Auth Modes

- `cookie` (default): uses `credentials: "include"` and refreshes via `/auth/refresh`.
- `bearer`: sends access token via `Authorization` header. Provide `tokenStorage`.

## Token Storage Interface

```ts
const storage = {
  getAccessToken: () => localStorage.getItem("access"),
  setAccessToken: (token: string | null) => {
    if (token) localStorage.setItem("access", token);
    else localStorage.removeItem("access");
  },
  getRefreshToken: () => localStorage.getItem("refresh"),
  setRefreshToken: (token: string | null) => {
    if (token) localStorage.setItem("refresh", token);
    else localStorage.removeItem("refresh");
  },
  clear: () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
  },
};
```
