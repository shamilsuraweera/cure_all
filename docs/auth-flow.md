# Auth Flow (Web + Mobile)

## Overview
- Auth endpoints use HTTP-only cookies for access and refresh tokens.
- Web clients rely on cookies automatically; mobile clients should use a cookie jar.

## Endpoints
- `POST /auth/login` → sets `access_token` + `refresh_token` cookies.
- `POST /auth/refresh` → rotates both cookies.
- `POST /auth/logout` → clears both cookies.

## Web (Browser)
- Use `fetch`/Axios with `credentials: "include"` so cookies are sent.
- Cookies are `httpOnly`, `sameSite=strict`, and `secure` in production.

## Mobile (React Native)
- Use a cookie jar (recommended) to store and send cookies.
- If using a networking layer without cookie support, add a cookie manager library.
- Avoid storing tokens in JS-visible storage when possible.

## Refresh Strategy
- On 401 from an API call, attempt `POST /auth/refresh`, then retry the request.
- If refresh fails, force re-login.
