# Firestore permission setup

The profile page reads `orders` and `sell_requests` using the signed-in
customer's Firebase UID. The rules in this folder allow that owner-only access.
They must be deployed to Firebase separately from a Vercel deployment.

From `apps/web`, sign in once and publish the checked-in rules:

```sh
npx firebase-tools@latest login
npm run deploy:firestore-rules
```

This deploys `firestore.rules` to the `selltronics-74f3a` Firebase project.
After it completes, sign out and back in on the website, then reopen Profile.

The storefront reads only products whose `status` is `Available`. Administrative
operations should use authenticated staff custom claims or a secure server endpoint.
