import { apiClient, ApiClientResponse } from './apiClient';
import { ProductAuctionItem } from '@/lib/definitions';

export interface ProductListParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  status?: string;
}

export interface PaginatedProductsResponse {
  items: ProductAuctionItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Helper to normalize product/auction object returned from FastAPI backend
export function normalizeProductItem(raw: Record<string, unknown>): ProductAuctionItem {
  const imageUrlRaw = raw.imageUrl || raw.image_url || raw.images || raw.image || raw.thumbnail || [];
  let imageUrl: string[] = [];

  if (Array.isArray(imageUrlRaw)) {
    imageUrl = imageUrlRaw.map(String);
  } else if (typeof imageUrlRaw === 'string') {
    imageUrl = [imageUrlRaw];
  }

  if (imageUrl.length === 0) {
    imageUrl = ['/agri-conn-logo.png'];
  }

  // Format image URLs cleanly (preserving Next.js public assets vs FastAPI backend uploads)
  const baseUrl = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1\/?$/, '')
    : 'http://localhost:8000';

  imageUrl = imageUrl.map((img) => {
    if (!img) return '/agri-conn-logo.png';
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    if (img === '/agri-conn-logo.png' || img === 'agri-conn-logo.png') return '/agri-conn-logo.png';
    if (img.startsWith('/uploads/') || img.startsWith('uploads/')) {
      const cleanPath = img.startsWith('/') ? img : `/${img}`;
      return `${baseUrl}${cleanPath}`;
    }
    if (img.startsWith('/')) {
      return `${baseUrl}${img}`;
    }
    return `${baseUrl}/uploads/${img}`;
  });

  const rawUser = (raw.user_fid || raw.user || raw.farmer || {}) as Record<string, unknown>;
  const farmerName = String(
    raw.farmerName || raw.farmer_name || rawUser.uname || rawUser.name || rawUser.full_name || 'Agri Farmer'
  );
  const farmerLocation = String(
    rawUser.uloc || rawUser.ugeo || raw.farmerLocation || raw.farmer_location || raw.location || '12.9716, 77.5946'
  );

  return {
    ProdAucId: Number(raw.ProdAucId || raw.id || raw.auction_id || 0),
    title: String(raw.title || raw.name || 'Agricultural Produce'),
    description: String(raw.description || ''),
    imageUrl,
    fid: Number(raw.fid || raw.farmer_id || raw.farmerId || rawUser.uid || rawUser.id || 0),
    category: String(raw.category || 'General'),
    startingBid: Number(raw.startingBid || raw.starting_bid || raw.price || 0),
    startTime: new Date((raw.startTime || raw.start_time || Date.now()) as string | number).toISOString(),
    endTime: new Date((raw.endTime || raw.end_time || Date.now()) as string | number).toISOString(),
    auctionStatus: (raw.auctionStatus || raw.status || 'OPEN') as ProductAuctionItem['auctionStatus'],
    farmerName,
    farmerLocation,
    location: farmerLocation,
  };
}

export async function fetchProducts(params: ProductListParams = {}): Promise<ApiClientResponse<PaginatedProductsResponse>> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.category) query.set('category', params.category);
  if (params.search) query.set('search', params.search);
  if (params.status) query.set('status', params.status);

  const queryString = query.toString();
  const endpoint = `/auctions${queryString ? `?${queryString}` : ''}`;

  const res = await apiClient.get<Record<string, unknown> | Record<string, unknown>[]>(endpoint);

  if (res.data) {
    let items: ProductAuctionItem[] = [];
    let total = 0;
    let page = params.page || 1;
    let limit = params.limit || 10;

    if (Array.isArray(res.data)) {
      items = res.data.map(normalizeProductItem);
      total = items.length;
    } else if (typeof res.data === 'object') {
      const rawObj = res.data as Record<string, unknown>;
      const rawItems = Array.isArray(rawObj.items)
        ? rawObj.items
        : Array.isArray(rawObj.auctions)
        ? rawObj.auctions
        : [];
      items = rawItems.map(normalizeProductItem);
      total = Number(rawObj.total || rawObj.total_count || items.length);
      page = Number(rawObj.page || page);
      limit = Number(rawObj.limit || limit);
    }

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      ...res,
      data: {
        items,
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  return { ...res, data: undefined };
}

export async function fetchProductById(id: number | string): Promise<ApiClientResponse<ProductAuctionItem>> {
  const res = await apiClient.get<Record<string, unknown>>(`/auctions/${id}`);

  if (res.data) {
    return {
      ...res,
      data: normalizeProductItem(res.data),
    };
  }

  return { ...res, data: undefined };
}

export async function searchProducts(
  query: string,
  category?: string,
  page = 1,
  limit = 12
): Promise<ApiClientResponse<PaginatedProductsResponse>> {
  const searchParams = new URLSearchParams();
  if (query) searchParams.set('q', query);
  if (category) searchParams.set('category', category);
  searchParams.set('page', String(page));
  searchParams.set('limit', String(limit));

  const endpoint = `/auctions/search?${searchParams.toString()}`;
  const res = await apiClient.get<Record<string, unknown> | Record<string, unknown>[]>(endpoint);

  if (res.data) {
    let items: ProductAuctionItem[] = [];
    let total = 0;

    if (Array.isArray(res.data)) {
      items = res.data.map(normalizeProductItem);
      total = items.length;
    } else if (typeof res.data === 'object') {
      const rawObj = res.data as Record<string, unknown>;
      const rawItems = Array.isArray(rawObj.items)
        ? rawObj.items
        : Array.isArray(rawObj.auctions)
        ? rawObj.auctions
        : [];
      items = rawItems.map(normalizeProductItem);
      total = Number(rawObj.total || items.length);
    }

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      ...res,
      data: {
        items,
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  return { ...res, data: undefined };
}
