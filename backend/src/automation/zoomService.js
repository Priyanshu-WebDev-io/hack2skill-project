const axios = require('axios');

const LEGACY_DEFAULT_ZOOM_LINK = 'https://zoom.us/j/recurring-default-link';

let zoomTokenCache = {
  accessToken: null,
  expiresAt: 0
};

const isZoomConfigured = () => {
  return Boolean(
    process.env.ZOOM_ACCOUNT_ID &&
      process.env.ZOOM_CLIENT_ID &&
      process.env.ZOOM_CLIENT_SECRET
  );
};

const getConfiguredDefaultZoomLink = () => {
  const value = String(process.env.DEFAULT_ZOOM_LINK || '').trim();
  return value || null;
};

const isPlaceholderZoomLink = (zoomLink) => {
  const link = String(zoomLink || '').trim();
  return !link || link === LEGACY_DEFAULT_ZOOM_LINK;
};

const getZoomAccessToken = async () => {
  if (!isZoomConfigured()) {
    throw new Error('Zoom credentials are not configured.');
  }

  const now = Date.now();
  if (zoomTokenCache.accessToken && now < zoomTokenCache.expiresAt - 60 * 1000) {
    return zoomTokenCache.accessToken;
  }

  const auth = Buffer.from(
    `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
  ).toString('base64');

  const tokenResponse = await axios.post(
    'https://zoom.us/oauth/token',
    null,
    {
      params: {
        grant_type: 'account_credentials',
        account_id: process.env.ZOOM_ACCOUNT_ID
      },
      headers: {
        Authorization: `Basic ${auth}`
      }
    }
  );

  const accessToken = tokenResponse.data.access_token;
  const expiresInSeconds = Number(tokenResponse.data.expires_in || 3600);

  zoomTokenCache = {
    accessToken,
    expiresAt: now + expiresInSeconds * 1000
  };

  return accessToken;
};

const createZoomMeetingForSeminar = async ({ topic, startTime, durationMinutes = 90 }) => {
  const token = await getZoomAccessToken();
  const zoomUserId = process.env.ZOOM_USER_ID || 'me';
  const timezone = process.env.ZOOM_TIMEZONE || 'Asia/Kolkata';

  const response = await axios.post(
    `https://api.zoom.us/v2/users/${encodeURIComponent(zoomUserId)}/meetings`,
    {
      topic,
      type: 2,
      start_time: new Date(startTime).toISOString(),
      duration: durationMinutes,
      timezone,
      settings: {
        host_video: true,
        participant_video: true,
        waiting_room: true,
        join_before_host: false,
        mute_upon_entry: true,
        approval_type: 2,
        registration_type: 1
      }
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return {
    id: response.data.id,
    joinUrl: response.data.join_url,
    startUrl: response.data.start_url,
    password: response.data.password || ''
  };
};

module.exports = {
  isZoomConfigured,
  getConfiguredDefaultZoomLink,
  isPlaceholderZoomLink,
  LEGACY_DEFAULT_ZOOM_LINK,
  createZoomMeetingForSeminar
};