import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserSession } from '@/lib/session';

export async function PUT(req: Request) {
    try {
        // 1. Authenticate the user
        const session = await getUserSession();
        if (!session?.uid) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        // 2. Grab the new data from the frontend
        const body = await req.json();
        const { uphone, ugeo } = body;

        // 3. Update the database
        await prisma.user.update({
            where: { uid: session.uid },
            data: {
                uphone: uphone || "", // Fallback to empty string if they delete it
                ugeo: ugeo || "",
            }
        });

        return NextResponse.json({ success: true, message: "Profile updated!" }, { status: 200 });

    } catch (error) {
        console.error("PROFILE UPDATE ERROR:", error);
        return NextResponse.json({ success: false, message: "Database Error" }, { status: 500 });
    }
}