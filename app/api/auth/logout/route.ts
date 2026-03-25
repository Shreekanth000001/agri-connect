import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        // Await the cookies() function as required by Next.js 14+
        const cookieStore = await cookies();
        
        // Delete the session cookie (assuming your cookie is named 'session')
        // If you named it something else in lib/session.ts, change the name here!
        cookieStore.delete('session');

        return NextResponse.json({ success: true, message: "Logged out successfully" }, { status: 200 });
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json({ error: "Failed to log out" }, { status: 500 });
    }
}