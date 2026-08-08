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

// Cache the resolved real user ID (Server-to-Server OAuth doesn't support 'me')
let resolvedZoomUserIdCache = null;

const resolveZoomUserId = async (token) => {
  const configured = String(process.env.ZOOM_USER_ID || '').trim();

  // If a real user ID or email is explicitly set (not 'me'), use it directly
  if (configured && configured !== 'me') {
    return configured;
  }

  // Return cached value if we already resolved it
  if (resolvedZoomUserIdCache) {
    return resolvedZoomUserIdCache;
  }

  // Auto-discover the first user in the account
  const usersResponse = await axios.get('https://api.zoom.us/v2/users?page_size=1&status=active', {
    headers: { Authorization: `Bearer ${token}` }
  });

  const users = usersResponse.data?.users || [];
  if (!users.length) {
    throw new Error('No active Zoom users found in account. Set ZOOM_USER_ID in .env to your Zoom email.');
  }

  resolvedZoomUserIdCache = users[0].id || users[0].email;
  console.log(`[Zoom] Auto-resolved user ID: ${resolvedZoomUserIdCache}`);
  return resolvedZoomUserIdCache;
};

const createZoomMeetingForSeminar = async ({ topic, startTime, durationMinutes = 90 }) => {
  const token = await getZoomAccessToken();
  const zoomUserId = await resolveZoomUserId(token);
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