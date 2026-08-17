# Greenwave '96 Photo Archive Setup

This setup keeps the photo workflow on Google Drive + Google Apps Script so you can avoid Firebase Storage billing.

## What is already built

- Website "Upload Photos" button
- Google Apps Script upload page
- Up to 8 photos per submission
- Private `Incoming Photos` review folder
- Public `Approved Photos` gallery folder
- Live gallery embedded back into the reunion website
- Name, email, category, and caption stored with each upload
- Approved photos automatically become visible in the website gallery

## 1. Create the Apps Script project

1. Go to `script.google.com` while signed into the Google account that should own the archive.
2. Click **New project**.
3. Rename it **CCHS 1996 Photo Archive**.
4. Replace the default `Code.gs` contents with the included `apps-script/Code.gs` file.
5. Add two HTML files using **+ > HTML**:
   - `Upload` and paste `apps-script/Upload.html`
   - `Gallery` and paste `apps-script/Gallery.html`
6. Save.

## 2. Let the script create the Drive folders

1. In the function dropdown, choose `setupPhotoFolders`.
2. Click **Run**.
3. Google will ask you to authorize Drive access. Approve it for your own script.
4. The script creates:
   - `CCHS Class of 1996 Photos`
   - `Incoming Photos`
   - `Approved Photos`

You only need to run this once.

## 3. Deploy the photo app

1. Click **Deploy > New deployment**.
2. Choose **Web app**.
3. Description: `Greenwave 96 Photos`.
4. Set **Execute as** to **Me**.
5. Set access to **Anyone** (wording can vary by Google account type).
6. Click **Deploy**.
7. Copy the deployment URL ending in `/exec`.

## 4. Connect it to the website

Open `index.html` and find:

```js
const PHOTO_APP_URL = 'PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';
```

Replace the placeholder with your `/exec` URL and save.

Example:

```js
const PHOTO_APP_URL = 'https://script.google.com/macros/s/ABC123/exec';
```

That's the only website setting required for photos.

## How approval works

Uploads land in **Incoming Photos** and are not shown publicly.

To approve a photo:

1. Open Google Drive.
2. Open `CCHS Class of 1996 Photos > Incoming Photos`.
3. Review the image.
4. Move it into `Approved Photos`.
5. Refresh the website gallery.

The gallery script makes approved images viewable by anyone with the link so they can render on the public reunion site.

## Cost

The code itself has no paid service. It uses storage from the Google account that owns the Drive folders and normal Google Apps Script quotas.

## Notes

- Each upload is limited to 20 MB per photo in the supplied code.
- Each submission accepts up to 8 photos. Classmates can immediately submit another batch.
- If a managed Google Workspace account blocks public link sharing, use a personal Google account for the archive or change the domain sharing policy.
- The gallery uses Google Drive image thumbnails. This is a pragmatic small-community solution, not a high-traffic image CDN.
