"use server"
import { NextResponse } from 'next/server';
import { prisma } from '@/lib//prisma';
const bcrypt = require('bcrypt');

export async function POST(req: Request) {

    try {
        const usercred = await req.json();
        const { email, password } = usercred;

        const user = await prisma.user.findFirst({
            where: { uemail: email }
        })

        if (!user) {
            console.log("no user found")
        }
        else{
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if(isPasswordValid){
                return NextResponse.json("logged in",{status:200});
            }
            else{
                console.log("Password not matched");
                return NextResponse.json({error:"Password not matched"},{status:500});
            }
        }
    }
    catch(error){
        console.log("some error in login",error)
        return NextResponse.json({error:"error in login auth route"},{status:500});
    }
}