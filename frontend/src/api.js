const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('bloom_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  if (res.status === 401) {
    localStorage.removeItem('bloom_token');
    localStorage.removeItem('bloom_user');
    window.dispatchEvent(new Event('bloom_auth_changed'));
    const errorData = await res.json().catch(() => ({ error: 'Unauthorized' }));
    throw new Error(errorData.error || 'Session expired. Please log in again.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
};

export const api = {
  // --- AUTH ---
  async register(name, email, password, cyclePrefs = {}) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, ...cyclePrefs }),
    });
    return handleResponse(res);
  },

  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // --- USER PROFILE & PREFERENCES ---
  async getPreferences() {
    const res = await fetch(`${API_BASE}/user/preferences`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async updatePreferences(prefs) {
    const res = await fetch(`${API_BASE}/user/preferences`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(prefs),
    });
    return handleResponse(res);
  },

  async updateProfile(name) {
    const res = await fetch(`${API_BASE}/user/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ name }),
    });
    return handleResponse(res);
  },

  async changePassword(current_password, new_password) {
    const res = await fetch(`${API_BASE}/user/password`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ current_password, new_password }),
    });
    return handleResponse(res);
  },

  async deleteAccount() {
    const res = await fetch(`${API_BASE}/user/account`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async exportUserData() {
    const res = await fetch(`${API_BASE}/user/export`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // --- CYCLE & CALENDAR ---
  async getCycleStatus() {
    const res = await fetch(`${API_BASE}/cycle/status`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getCalendar(year, month) {
    const res = await fetch(`${API_BASE}/cycle/calendar?year=${year}&month=${month}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // --- PERIOD LOGS ---
  async getPeriods() {
    const res = await fetch(`${API_BASE}/periods`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createPeriod(payload) {
    const res = await fetch(`${API_BASE}/periods`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async updatePeriod(id, payload) {
    const res = await fetch(`${API_BASE}/periods/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async deletePeriod(id) {
    const res = await fetch(`${API_BASE}/periods/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // --- DAILY SYMPTOMS ---
  async getSymptoms(dateStr) {
    const url = dateStr ? `${API_BASE}/symptoms?date=${dateStr}` : `${API_BASE}/symptoms`;
    const res = await fetch(url, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async saveSymptoms(payload) {
    const res = await fetch(`${API_BASE}/symptoms`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getRecentSymptoms(limit = 7) {
    const res = await fetch(`${API_BASE}/symptoms/recent?limit=${limit}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // --- NLP JOURNAL ---
  async analyzeJournal(content) {
    const res = await fetch(`${API_BASE}/journal/analyze`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ content }),
    });
    return handleResponse(res);
  },

  async getJournal(query = '') {
    const url = query ? `${API_BASE}/journal?q=${encodeURIComponent(query)}` : `${API_BASE}/journal`;
    const res = await fetch(url, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async saveJournal(title, content, entry_date) {
    const res = await fetch(`${API_BASE}/journal`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title, content, entry_date }),
    });
    return handleResponse(res);
  },

  async confirmJournalTags(entryId, symptoms, mood) {
    const res = await fetch(`${API_BASE}/journal/${entryId}/confirm-tags`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ symptoms, mood }),
    });
    return handleResponse(res);
  },

  async deleteJournal(entryId) {
    const res = await fetch(`${API_BASE}/journal/${entryId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // --- ANALYTICS ---
  async getAnalytics() {
    const res = await fetch(`${API_BASE}/analytics`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // --- DEMO SEED ---
  async seedDemoData() {
    const res = await fetch(`${API_BASE}/demo/seed`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  }
};

