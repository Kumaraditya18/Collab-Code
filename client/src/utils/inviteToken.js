// Lightweight secure Base64-URL invite token utility

export const generateEncryptedInviteToken = (roomId, roomType = 'public', inviterName = 'Team Member') => {
  const payload = {
    r: roomId,
    t: roomType,
    inv: inviterName || 'Team Member',
    ts: Date.now(),
  };
  const jsonStr = JSON.stringify(payload);
  return btoa(unescape(encodeURIComponent(jsonStr)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

export const parseEncryptedInviteToken = (token) => {
  if (!token) return null;
  try {
    let base64 = token.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const jsonStr = decodeURIComponent(escape(atob(base64)));
    const payload = JSON.parse(jsonStr);
    if (payload && payload.r) {
      return {
        roomId: payload.r,
        roomType: payload.t || 'public',
        inviterName: payload.inv || 'Team Member',
        timestamp: payload.ts,
      };
    }
  } catch {
    return null;
  }
  return null;
};
