import { NextResponse } from 'next/server';
import { fetchProductById } from '@/lib/api/productService';

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    const apiRes = await fetchProductById(id);

    if (apiRes.data) {
      return NextResponse.json({
        prodData: apiRes.data,
        fData: {
          uid: apiRes.data.fid,
          uname: `Farmer #${apiRes.data.fid}`,
        },
      });
    }

    return NextResponse.json({ message: 'Product not found' }, { status: 404 });
  } catch (error) {
    console.error('Product Listings Route Error:', error);
    return NextResponse.json({ message: 'Internal Error fetching product' }, { status: 500 });
  }
}
