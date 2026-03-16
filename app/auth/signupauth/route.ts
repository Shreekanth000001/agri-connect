"use server"
import { NextResponse } from 'next/server';
import { prisma } from '@/lib//prisma';
const bcrypt = require('bcrypt');

export async function POST(req: Request) {

    try {
        const userdetails = await req.json();
        const { uname, uemail, password, uphone, ugeo } = userdetails;

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        console.log(userdetails);
        const user = await prisma.user.create({
            data: {
                'uname': uname,
                'uemail': uemail,
                'password': hashedPassword,
                'uphone': uphone,
                'ugeo': ugeo
            }
        });
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json(userWithoutPassword, { status: 201 });

    }
    catch (error) {
        console.log(error);
        return NextResponse.json({ error: "error in creating user" }, { status: 500 })
    }
}
export async function GET() {
    console.log("get working");
    return new Response("get is working yo");
}