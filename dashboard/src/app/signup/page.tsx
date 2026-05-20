"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";


export default function SignupPage (){
  const [formData, setFormData] = useState({name: "", email: "", password: ""});
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try{
      // send data to api route
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if(res.ok){
       // If the DB saved the user, move to the login page smoothlyIf the DB saved the user, move to the login page smoothly
       router.push("/login");
      } else {
        alert(data.error || "Signup Failed");
      }
    } catch (err){
      console.error("Connection error :",err);
      alert("could not connect to the server")
    }
    
  };

  return(
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 w-full max-w-md shadow-2xl">
        <h2 className="text-3xl font-bold text-blue-400 mb-6 text-center"> Create Account</h2>
        <form onSubmit={handleSignup} className="space-y-4">
          <input 
           type="text" 
           placeholder="Full Name"
           className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg text-white focus:border-blue-500 outline-none"
           onChange={(e) => setFormData({...formData, name:e.target.value})}
           />
          
          <input
           type="email"
           placeholder="Email Address"
           className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg text-white focus:border-blue-500 outline-none"
           onChange={(e) => setFormData({...formData, email:e.target.value})}
           />

          <input 
           type="password"
           placeholder="Create Password"
           className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg text-white focus:border-blue-500 outline-none"
           onChange={(e) => setFormData({...formData, password: e.target.value})}
           />
           <button className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold transition-all">
            Get Started
            
           </button>

        </form>
         <p className="mt-6 text-center text-gray-500 text-sm">
          Already a member? <Link href="/login"
          className="text-blue-400 hover:underline"
          >Login</Link>
         </p>

      </div>
    </div>
  );
}