import { NextResponse } from 'next/server';
import { fetchProducts } from '@/lib/api/productService';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || undefined;
  const search = searchParams.get('q') || searchParams.get('search') || undefined;
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 12;

  try {
    const apiRes = await fetchProducts({ category, search, page, limit });

    if (apiRes.data) {
      return NextResponse.json(apiRes.data.items, { status: 200 });
    }

    return NextResponse.json([], { status: 200 });
  } catch (error) {
    console.error('Products Route Error:', error);
    return NextResponse.json([], { status: 200 });
  }
}