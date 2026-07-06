import { API_BASE } from './api';

export interface Review {
  id: string;
  productId: string;
  userId: string | null;
  userName: string;
  rating: number;
  title: string;
  content: string;
  createdAt: string;
}

export interface CreateReviewPayload {
  rating: number;
  title: string;
  content: string;
}

async function readErrorMessage(res: Response) {
  const text = await res.text();

  try {
    const parsed = JSON.parse(text);
    if (typeof parsed?.message === 'string' && parsed.message.trim()) {
      return parsed.message;
    }
  } catch {
    // Fall back to raw text below.
  }

  return text || 'Co loi xay ra';
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Vui long dang nhap');
  }

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export async function fetchProductReviews(productId: string): Promise<Review[]> {
  const res = await fetch(`${API_BASE}/reviews/product/${productId}`);

  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json();
}

export async function createReview(productId: string, payload: CreateReviewPayload): Promise<Review> {
  const res = await fetch(`${API_BASE}/reviews/product/${productId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json();
}