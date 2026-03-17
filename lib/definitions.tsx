import { useId } from 'react'
import * as z from 'zod'
 
export const SignupFormSchema = z.object({
  uid: z
    .number(),
  uname: z
    .string(),
})
 
export type FormState ={
   userDetails: {
        uid?:number
        uname?: string
      }
    expiresAt: Date
    }