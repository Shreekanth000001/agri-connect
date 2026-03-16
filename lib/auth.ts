import { SignupFormSchema, FormState } from '@/lib/definitions'
import { createSession } from '@/lib/session'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/session'
import { prisma } from '@/lib//prisma';
const bcrypt = require('bcrypt');

export async function signup(state: FormState, formData: FormData) {
  // Validate form fields
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    geo: formData.get('geo'),
    ph: formData.get('ph'),
  })
 
  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }
 
  // Call the provider or db to create a user...

   const { name, email, password, geo, ph } = validatedFields.data
  // e.g. Hash the user's password before storing it
  const hashedPassword = await bcrypt.hash(password, 10)
 
  // 3. Insert the user into the database or call an Auth Library's API
  const data = await prisma.user.create({
            data: {
                'uname': name,
                'uemail': email,
                'password': hashedPassword,
                'uphone': ph,
                'ugeo': geo
            }
        });
 
  const user = data.uid;
 
  if (!user) {
    return {
      message: 'An error occurred while creating your account.',
    }
  }

    await createSession(String(user));
  // 5. Redirect user
  // redirect('/profile')
}


