import { API_BASE } from './api';

export type Category = {
  id: string;
  name: string;
  slug?: string;
  position?: number;
};

const CATEGORY_CACHE_KEY = 'instrument_store.categories';

function sortCategories(categories: Category[]) {
  return [...categories].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

export function getCachedCategories(): Category[] {
  try {
    const raw = localStorage.getItem(CATEGORY_CACHE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return sortCategories(
      parsed.filter((category): category is Category => {
        return Boolean(category && typeof category.id === 'string' && typeof category.name === 'string');
      }),
    );
  } catch {
    return [];
  }
}

function cacheCategories(categories: Category[]) {
  try {
    localStorage.setItem(CATEGORY_CACHE_KEY, JSON.stringify(sortCategories(categories)));
  } catch {
    // Ignore storage failures and fall back to the live response.
  }
}

function clearCategoryCache() {
  try {
    localStorage.removeItem(CATEGORY_CACHE_KEY);
  } catch {
    // Ignore storage failures.
  }
}

async function readErrorMessage(res: Response) {
  const text = await res.text();

  try {
    const parsed = JSON.parse(text);
    if (typeof parsed?.message === 'string' && parsed.message.trim()) {
      return parsed.message;
    }
  } catch {
    // Fall back to raw text.
  }

  return text || 'Không thể xử lý yêu cầu';
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Vui lòng đăng nhập');
  }

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE}/categories`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Failed to load categories (${res.status})`);
    }

    const data = (await res.json()) as Category[];
    const categories = sortCategories(data);
    cacheCategories(categories);
    return categories;
  } catch (error) {
    const cachedCategories = getCachedCategories();
    if (cachedCategories.length > 0) {
      return cachedCategories;
    }

    throw error;
  }
}

export async function createAdminCategory(name: string, position?: number): Promise<Category> {
  const res = await fetch(`${API_BASE}/categories/admin`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, position }),
  });

  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }

  clearCategoryCache();
  return res.json();
}

export async function deleteAdminCategory(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/categories/admin/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok && res.status !== 204) {
    throw new Error(await readErrorMessage(res));
  }

  clearCategoryCache();
}
