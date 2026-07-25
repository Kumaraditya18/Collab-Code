// Helper to safely parse JSON responses from fetch calls
export const parseResponseJson = async (res) => {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return await res.json();
  }
  const text = await res.text();
  if (text.startsWith('<')) {
    throw new Error('Backend server is unavailable or endpoint returned HTML.');
  }
  try {
    return JSON.parse(text);
  } catch {
    return { error: text || 'Invalid response from server.' };
  }
};
