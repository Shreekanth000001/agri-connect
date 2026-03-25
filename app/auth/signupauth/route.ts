import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/session'; // <-- Import the session generator
const bcrypt = require('bcrypt');

export async function POST(req: Request) {
    try {
        const userdetails = await req.json();
        
        const { uname, uemail, password, uphone, ugeo, uloc, role } = userdetails;

        // Security Check: Make sure the email isn't already registered
        const existingUser = await prisma.user.findUnique({
            where: { uemail: uemail }
        });

        if (existingUser) {
            return NextResponse.json({ error: "Email is already registered" }, { status: 409 });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create the user in Prisma
        const user = await prisma.user.create({
            data: {
                uname: uname,
                uemail: uemail,
                password: hashedPassword,
                uphone: uphone,
                ugeo: ugeo,   
                uloc: uloc,   
                role: role    
            }
        });

        // 🌟 UX UPGRADE: Auto-login the user immediately!
        await createSession(String(user.uid));

        const { password: _, ...userWithoutPassword } = user;
        
        return NextResponse.json({ success: true, user: userWithoutPassword }, { status: 201 });

    } catch (error) {
        console.error("Signup Error:", error);
        return NextResponse.json({ error: "Failed to create account. Please try again." }, { status: 500 });
    }
}