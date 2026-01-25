import { prisma } from '@/lib//prisma';

export function GET() {

}

export async function POST() {
    const user = await prisma.user.create({
        data: {
            'uname': 'Rahul',
            'uemail': 'Rahul@gmail.com',
            'uphone': 1234567891,
            'ugeo': 'Urban Banglore',
            'role': 'FARMER',
        }
    })
    console.log(user);

    return new Response(JSON.stringify(user));
}