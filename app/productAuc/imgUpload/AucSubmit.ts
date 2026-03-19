import { prisma } from '@/lib//prisma';
import { redirect } from 'next/navigation'
import {Category} from '@prisma/client'
export default async function AucFormSubmit( formData: FormData) {
    try {
        const fid = Number(formData.get('uid'));
        const title = String(formData.get('title'));
        const description = String(formData.get('description'));
        const startingBid = Number(formData.get('startingBid'));
        const startTime = String(formData.get('startTime'));
        const endTime = String(formData.get('endTime'));
        const category = String(formData.get('category')) as Category;
        const rawimageUrl = String(formData.get('imageUrl'));
        const imageUrl = rawimageUrl ? JSON.parse(rawimageUrl) : [];
        const result = await prisma.productAuction.create({
            data: {
                'fid': fid,
                'title': title,
                'description': description,
                'startingBid': startingBid,
                'startTime': startTime,
                'endTime': endTime,
                'category': category,
                'imageUrl': imageUrl,
            }
        })
    }
    catch (error) {
        return ;
    }
    redirect('/')
}