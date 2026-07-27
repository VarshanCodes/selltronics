# Firestore permission setup

The storefront reads only products whose `status` is `Available`. Deploy the
rules in `firestore.rules` from the Firebase Console:

1. Open Firebase Console → **Firestore Database** → **Rules**.
2. Replace the existing rules with the contents of `firestore.rules`.
3. Click **Publish**.

These rules intentionally keep admin reads and edits private. Connect the
admin dashboard to Firebase Authentication and custom claims before allowing
admin operations from a browser.
