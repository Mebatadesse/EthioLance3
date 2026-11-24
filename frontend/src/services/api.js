const configuredApiUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");
const API_BASE_URL = /\/api$/i.test(configuredApiUrl)
  ? configuredApiUrl
  : `${configuredApiUrl}/api`;

export const getCurrentUser = () => {
  for (const storage of [localStorage, sessionStorage]) {
    try {
      const user = JSON.parse(storage.getItem("ethioLanceUser") || "null");
      if (user && (user.id || user.email)) return user;
    } catch {
      // Ignore malformed user data and check the other storage area.
    }
  }
  return {};
};

export const getUserStorageKey = (baseKey) => {
  const user = getCurrentUser();
  const identity = user.id || user.email?.trim().toLowerCase() || "anonymous";
  return `${baseKey}:${encodeURIComponent(String(identity))}`;
};

export const readUserData = (baseKey, fallback = {}) => {
  try {
    const scopedKey = getUserStorageKey(baseKey);
    const scopedValue = localStorage.getItem(scopedKey);
    if (scopedValue) return JSON.parse(scopedValue);

    // Migrate the old shared cache only when it clearly belongs to this account.
    const user = getCurrentUser();
    const legacyValue = localStorage.getItem(baseKey);
    if (user.email && legacyValue) {
      const legacyData = JSON.parse(legacyValue);
      if (String(legacyData.email || "").trim().toLowerCase() === user.email.trim().toLowerCase()) {
        localStorage.setItem(scopedKey, JSON.stringify(legacyData));
        return legacyData;
      }
    }
  } catch {
    // Fall back to an empty value if browser storage is unavailable or malformed.
  }
  return fallback;
};

export const writeUserData = (baseKey, value) => {
  localStorage.setItem(getUserStorageKey(baseKey), JSON.stringify(value));
};

export const apiRequest = async (endpoint, options = {}) => {
  const token =
    localStorage.getItem("ethioLanceToken") ||
    sessionStorage.getItem("ethioLanceToken");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
};
