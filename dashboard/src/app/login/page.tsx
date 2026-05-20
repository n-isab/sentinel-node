'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";



export default function LoginPage(){
  const [email, setEmail] = useState('');
  const [ password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
   try{
    const res = await fetch("/api/auth/login",{
      method:"POST",
      headers:{"Content-type" : "application/json"},
      body:JSON.stringify({email, password})
    });

    const data = await res.json();

    if(res.ok){
      //redirect to dashboard
      router.push("/dashboard");
    } else {
      alert(data.error || "Login Failed");
    }
   } catch (err) {
      console.error("Login error:", err);
   }
  };
  return(
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 w-full max-w-md shadow-2xl">
        <h2 className="text-3xl font-bold text-blue-400 mb-6 text-center"> Sentinel Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
           <div>
            <label className="block text-sm text-gray-400 mb-1" >Email Address</label>
            <input 
             type="email" 
             className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg text-white focus:border-blue-500 outline-none"
             placeholder="admin@sentinel.com"
             value={email}
             onChange={(e) => setEmail(e.target.value)}
             />
           </div>
           <div>
             <label className="block text-sm text-gray-400 mb-1">Password</label>
             <input 
               type="password"
               className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg text-white focus:border-blue-500 outline-none"
               placeholder="••••••••"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               />
           </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold transition-all">
              Access Dashboard
            </button>

        </form> 
        <p className="mt-6 text-center text-gray-500 text-sm">
          Don't have an account? <Link href="/signup" className="text-blue-400 hover:underline">Sign Up</Link>
        </p>
      </div>

    </div>
  );
}