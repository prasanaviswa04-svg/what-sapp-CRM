const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (e) {
    console.warn('⚠️ Could not create uploads directory:', e.message);
  }
}

/**
 * Saves base64 media (image/document) to local uploads directory and returns relative URL + buffer
 */
function saveBase64Media(mediaStr, prefix = 'img') {
  if (!mediaStr || typeof mediaStr !== 'string') {
    return { url: '', buffer: null };
  }

  // If already an HTTP/HTTPS URL
  if (mediaStr.startsWith('http://') || mediaStr.startsWith('https://') || mediaStr.startsWith('/uploads/')) {
    return { url: mediaStr, buffer: null };
  }

  // Handle data URI
  const match = mediaStr.match(/^data:([A-Za-z0-9-+\/]+);base64,(.+)$/);
  if (!match) {
    return { url: mediaStr, buffer: null };
  }

  const mimeType = match[1];
  const base64Data = match[2];
  const buffer = Buffer.from(base64Data, 'base64');

  let ext = 'jpg';
  if (mimeType.includes('png')) ext = 'png';
  else if (mimeType.includes('webp')) ext = 'webp';
  else if (mimeType.includes('gif')) ext = 'gif';
  else if (mimeType.includes('pdf')) ext = 'pdf';

  const filename = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const filePath = path.join(uploadsDir, filename);

  try {
    fs.writeFileSync(filePath, buffer);
    return {
      url: `/uploads/${filename}`,
      buffer,
      mimeType,
      filename
    };
  } catch (err) {
    console.error('❌ Failed to save base64 media to disk:', err.message);
    return {
      url: '',
      buffer,
      mimeType
    };
  }
}

/**
 * Parses coordinates, address, and Google Maps URL from varied inputs
 */
function parseGoogleMapsLocation(input) {
  if (!input) return null;

  // Object format
  if (typeof input === 'object') {
    const lat = input.latitude || input.lat;
    const lng = input.longitude || input.lng;
    const name = input.name || input.title || 'Location';
    const address = input.address || input.locality || '';
    const mapsUrl =
      input.googleMapsUrl ||
      input.mapsUrl ||
      (lat && lng ? `https://maps.google.com/?q=${lat},${lng}` : (address ? `https://maps.google.com/?q=${encodeURIComponent(address)}` : ''));

    return {
      latitude: lat ? parseFloat(lat) : null,
      longitude: lng ? parseFloat(lng) : null,
      name,
      address,
      googleMapsUrl: mapsUrl
    };
  }

  // String format
  if (typeof input === 'string') {
    const str = input.trim();
    if (!str) return null;

    // Check if contains coordinates: @lat,lng or q=lat,lng or "lat, lng"
    const coordRegex = /[@=]?(-?\d+\.\d+),\s*(-?\d+\.\d+)/;
    const match = str.match(coordRegex);

    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      return {
        latitude: lat,
        longitude: lng,
        name: 'Google Maps Location',
        address: `${lat}, ${lng}`,
        googleMapsUrl: str.startsWith('http') ? str : `https://maps.google.com/?q=${lat},${lng}`
      };
    }

    // Generic address or search query
    return {
      latitude: null,
      longitude: null,
      name: str,
      address: str,
      googleMapsUrl: str.startsWith('http') ? str : `https://maps.google.com/?q=${encodeURIComponent(str)}`
    };
  }

  return null;
}

module.exports = {
  saveBase64Media,
  parseGoogleMapsLocation,
  uploadsDir
};
