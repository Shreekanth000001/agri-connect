import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        // 1. Grab the data sent from the frontend form
        const body = await req.json();
        const { name, email, message } = body;

        // 2. Validate that the data actually exists
        if (!name || !email || !message) {
            return NextResponse.json(
                { error: "All fields are required." }, 
                { status: 400 }
            );
        }

        // 3. Save it to the new database table
        await prisma.contactMessage.create({
            data: {
                name: name,
                email: email,
                message: message,
            }
        });

        // 4. Send a success response back to the frontend
        return NextResponse.json(
            { success: true, message: "Message received loud and clear!" }, 
            { status: 201 }
        );

    } catch (error) {
        console.error("Contact Form Error:", error);
        return NextResponse.json(
            { error: "Failed to send message. Please try again later." }, 
            { status: 500 }
        );
    }
}