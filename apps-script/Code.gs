/**
 * Greenwave '96 Photo Archive
 * Google Apps Script backend for $0-ish Drive photo uploads + gallery.
 *
 * SETUP: replace the two folder IDs below before deploying.
 */
const CONFIG = {
  // Leave these as AUTO unless you already created your own folders.
  INCOMING_FOLDER_ID: 'AUTO',
  APPROVED_FOLDER_ID: 'AUTO',
  MAX_FILES_PER_SUBMISSION: 8,
  MAX_FILE_MB: 20,
  AUTO_PUBLISH_APPROVED: true
};

function doGet(e) {
  const view = (e && e.parameter && e.parameter.view) || 'gallery';
  const file = view === 'upload' ? 'Upload' : 'Gallery';
  return HtmlService.createHtmlOutputFromFile(file)
    .setTitle(view === 'upload' ? "Upload Photos | Greenwave '96" : "Photo Gallery | Greenwave '96")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function savePhotoSubmission(formObject) {
  validateConfig_();
  const folder = DriveApp.getFolderById(getFolderId_('INCOMING_FOLDER_ID'));
  const submitter = clean_(formObject.submitter || 'Anonymous classmate');
  const email = clean_(formObject.email || '');
  const category = clean_(formObject.category || 'Other');
  const note = clean_(formObject.note || '');
  const uploaded = [];

  for (let i = 1; i <= CONFIG.MAX_FILES_PER_SUBMISSION; i++) {
    const blob = formObject['photo' + i];
    if (!blob || typeof blob.getBytes !== 'function' || blob.getBytes().length === 0) continue;

    const contentType = blob.getContentType() || '';
    if (!contentType.startsWith('image/')) {
      throw new Error('Only image files are allowed.');
    }
    const maxBytes = CONFIG.MAX_FILE_MB * 1024 * 1024;
    if (blob.getBytes().length > maxBytes) {
      throw new Error(`Each photo must be under ${CONFIG.MAX_FILE_MB} MB.`);
    }

    const original = cleanFilename_(blob.getName() || `photo-${i}.jpg`);
    const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss');
    const safeSubmitter = submitter.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 30) || 'classmate';
    blob.setName(`${stamp}_${safeSubmitter}_${original}`);

    const file = folder.createFile(blob);
    file.setDescription(JSON.stringify({
      submitter,
      email,
      category,
      note,
      originalName: original,
      submittedAt: new Date().toISOString()
    }));
    uploaded.push({ id: file.getId(), name: original });
  }

  if (!uploaded.length) throw new Error('Choose at least one photo.');
  return { ok: true, count: uploaded.length, files: uploaded };
}

function listApprovedPhotos() {
  validateConfig_();
  const folder = DriveApp.getFolderById(getFolderId_('APPROVED_FOLDER_ID'));
  const files = folder.getFiles();
  const photos = [];

  while (files.hasNext()) {
    const file = files.next();
    const mime = file.getMimeType() || '';
    if (!mime.startsWith('image/')) continue;

    if (CONFIG.AUTO_PUBLISH_APPROVED) {
      try {
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (err) {
        // Some Workspace domains can block public sharing. Gallery still returns the item,
        // but the image may not render until sharing policy allows it.
      }
    }

    let meta = {};
    try { meta = JSON.parse(file.getDescription() || '{}'); } catch (err) {}
    photos.push({
      id: file.getId(),
      name: meta.originalName || file.getName(),
      category: meta.category || 'CCHS Memories',
      note: meta.note || '',
      submitter: meta.submitter || '',
      created: file.getDateCreated().toISOString(),
      imageUrl: `https://drive.google.com/thumbnail?id=${file.getId()}&sz=w1600`,
      viewUrl: file.getUrl()
    });
  }

  photos.sort((a, b) => b.created.localeCompare(a.created));
  return photos;
}

/** Optional admin helper. Run after moving photos into Approved. */
function publishApprovedPhotos() {
  validateConfig_();
  const folder = DriveApp.getFolderById(getFolderId_('APPROVED_FOLDER_ID'));
  const files = folder.getFiles();
  let count = 0;
  while (files.hasNext()) {
    const file = files.next();
    if (!(file.getMimeType() || '').startsWith('image/')) continue;
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    count++;
  }
  Logger.log(`Published ${count} approved images.`);
}

/** Run this ONCE from the Apps Script editor before deploying. */
function setupPhotoFolders() {
  const props = PropertiesService.getScriptProperties();
  const existingIncoming = props.getProperty('INCOMING_FOLDER_ID');
  const existingApproved = props.getProperty('APPROVED_FOLDER_ID');
  if (existingIncoming && existingApproved) {
    Logger.log('Photo folders already configured.');
    Logger.log('Incoming: https://drive.google.com/drive/folders/' + existingIncoming);
    Logger.log('Approved: https://drive.google.com/drive/folders/' + existingApproved);
    return { incoming: existingIncoming, approved: existingApproved };
  }

  const parent = DriveApp.createFolder('CCHS Class of 1996 Photos');
  const incoming = parent.createFolder('Incoming Photos');
  const approved = parent.createFolder('Approved Photos');
  props.setProperties({
    PHOTO_PARENT_FOLDER_ID: parent.getId(),
    INCOMING_FOLDER_ID: incoming.getId(),
    APPROVED_FOLDER_ID: approved.getId()
  });
  Logger.log('Created CCHS Class of 1996 Photos.');
  Logger.log('Incoming: https://drive.google.com/drive/folders/' + incoming.getId());
  Logger.log('Approved: https://drive.google.com/drive/folders/' + approved.getId());
  return { parent: parent.getId(), incoming: incoming.getId(), approved: approved.getId() };
}

function getFolderId_(key) {
  const configured = CONFIG[key];
  if (configured && configured !== 'AUTO') return configured;
  const id = PropertiesService.getScriptProperties().getProperty(key);
  if (!id) throw new Error('Run setupPhotoFolders() once from the Apps Script editor first.');
  return id;
}

function validateConfig_() {
  getFolderId_('INCOMING_FOLDER_ID');
  getFolderId_('APPROVED_FOLDER_ID');
}

function clean_(value) {
  return String(value || '').replace(/[<>]/g, '').trim().slice(0, 1000);
}

function cleanFilename_(value) {
  return String(value || 'photo.jpg').replace(/[\\/:*?"<>|]/g, '-').slice(0, 180);
}
