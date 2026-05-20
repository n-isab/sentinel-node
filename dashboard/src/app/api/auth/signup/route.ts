import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST (req: Request) {
  await dbConnect();
  try{
    const {name, email, password} = await req.json();


    // 2. check theuser already exists
    const userExists = await User.findOne({email});
    if(userExists){
      return NextResponse.json({error: "User already exists..!"}, {status: 400});
    }

    //3.hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    //4. create useer
      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
      });
      return NextResponse.json({message: "User created successfully"}, {status: 201});
  } catch (error) {
     return NextResponse.json({error: error.message}, {status: 500});

  }
}