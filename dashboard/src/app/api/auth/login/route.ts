import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST (req: Request){
  await dbConnect();

  try{
    const { email,password } = await req.json();

    // find user in the user collection
    // We use .select("+password") because our model hides it by default
    const user = await User.findOne({ email}).select("+password");

   {/* if(!user){
      return NextResponse.json(
        { error: "Invaild email or password"},
        { status: 401}
      );
    } */}

    // 2. Compare the entered password with the hashed password in DB 
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if(!user || !isPasswordCorrect){
      return NextResponse.json(
        { error: "Invaild credentials"},
        {status: 401}
      );
    }

    //Set a "session" cookie that expires in 1 day
    const cookieStore = await cookies();
    cookieStore.set("auth_token", "secure_session_id_here",{
      httpOnly: true, // prevent js from stealing the token
      secure:process.env.NODE_ENV === "production",
      maxAge:60 * 60 * 24, // 1 day
      path:"/",
     })

    // success 
    return NextResponse.json({
      message: "Login successful",
      user:{name:user.name, email: user.email}
    }, {status: 200});
  } catch (error :any) {
    console.error("Login API Error :", error);
    return NextResponse.json(
      {error: "Internal server Error"},
      {status: 500}
    );
  }
}