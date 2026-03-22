"use server"
import { SignupFormSchema, FormState } from '@/lib/definitions'
import { createSession } from '@/lib/session'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/session'
import { prisma } from '@/lib//prisma';
import { redirect } from 'next/navigation'
const bcrypt = require('bcrypt');

export async function signup(formData: FormData) {
  try {
    const name = String(formData.get('name'));
    const email = String(formData.get('email'));
    const password = formData.get('password');
    const address = String(formData.get('address'));
    const state = String(formData.get('state'));
    const pincode = String(formData.get('pincode'));
    const geo = address + state + pincode;
        const loc = String(formData.get('loc'));
    const ph = String(formData.get('ph'));

    const hashedPassword = await bcrypt.hash(password, 10)

    const data = await prisma.user.create({
      data: {
        'uname': name,
        'uemail': email,
        'password': hashedPassword,
        'uphone': ph,
        'ugeo': geo,
        'uloc':loc
      }
    });

    const user = data.uid;


    if (!user) {
      return {
        message: 'An error occurred while creating your account.',
      }
    }
    else {
      await createSession(String(user));
    }

  }
  catch (error) {
    console.log(error);
    return error;
  }


  // 5. Redirect user
  redirect('/')
}


