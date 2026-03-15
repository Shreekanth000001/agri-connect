"use server"
import { prisma } from '@/lib//prisma';

const bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';

export async function POST(req: Request) {
    let erro;
    let hashed;
    bcrypt.hash(myPlaintextPassword, saltRounds, function(err:Object, hash: String) {
    erro=err;
    hashed=hash;
});

      const userdetails = await req.json();
      console.log(erro," ", hashed);
      console.log(userdetails);
    const user = await prisma.user.create({
        data: {
            'uid':userdetails.uid,
            'uname':userdetails.uname,
            'uemail':userdetails.uemail,
            'uphone':userdetails.uphone,
            'ugeo':userdetails.ugeo
        }
    });
    return new Response(JSON.stringify(user));
}
 export async function GET(){
    console.log("get working");
    return new Response("get is working yo");
 }