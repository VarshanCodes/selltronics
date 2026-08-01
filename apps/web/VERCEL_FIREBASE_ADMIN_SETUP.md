# Vercel Firebase Admin setup

Product publishing runs in a Vercel server function and needs a Firebase Admin
service account. Firebase browser configuration values cannot replace it.

1. In [Google Cloud Console](https://console.cloud.google.com/iam-admin/serviceaccounts?project=selltronics-74f3a), select the `selltronics-74f3a` project, open **Service Accounts**, create or select a service account, and create a JSON key.
2. In Vercel, open the Selltronics project, then **Settings → Environment Variables**.
3. Add `FIREBASE_SERVICE_ACCOUNT_JSON` with the complete contents of that JSON file as its value. Do not add `NEXT_PUBLIC_`, do not wrap the JSON in extra quotation marks, and enable it for **Production**, **Preview**, and **Development** as needed.
4. Confirm `ADMIN_PASSWORD` and a strong, unique `ADMIN_SESSION_SECRET` are also present there.
5. Redeploy the project. Environment-variable changes only apply to deployments created after the change.

For local development, rename `apps/web/.env.locaL` to `.env.local` and add the
same service-account JSON there. Keep `.env.local` out of Git.

Treat the JSON key as a password: never commit it, paste it into client code,
or share it in a public log or screenshot.
