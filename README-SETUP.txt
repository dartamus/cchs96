GREENWAVE '96 - FIREBASE SETUP

Firebase project: cchs-class-of-1996

WIRED NOW
- Firebase Web app configuration
- Cloud Firestore classmate submission form
- Private profileSubmissions queue
- Public directory reads from publicProfiles
- Firestore Security Rules
- Firebase Hosting configuration
- 2026 reunion recap copy
- FEM footer Easter egg

IMPORTANT
Cloud Storage for Firebase requires the Blaze pay-as-you-go plan as of February 3, 2026. The current photo picker provides a local preview only. Do not enable broad public Storage rules.

NEXT CONSOLE STEP
1. Firebase Console > Databases & Storage > Firestore Database
2. Create database
3. Choose Standard edition / Native mode
4. Pick a database location (a western US region is reasonable for this audience; location cannot be changed later)
5. Start in Production mode
6. After creation, publish the firestore.rules file from this package (or deploy via Firebase CLI).

DEPLOY WITH FIREBASE CLI
- npm install -g firebase-tools
- firebase login
- cd into this folder
- firebase deploy

Do NOT share service-account JSON/private keys. The firebase-config.js browser config is expected to be client-side.
