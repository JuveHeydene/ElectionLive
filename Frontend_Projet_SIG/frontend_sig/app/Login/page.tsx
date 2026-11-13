"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import "./login.scss";
import myImage from "../../public/Images/elections_237.png";
import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";
import Layout from "@/app/components/layout/Layout";

interface usersignin {
  email: string;
  password: string;
}

const LoginPage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<usersignin>({
    email: "",
    password: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const decodeBase64 = (base64: string) => {
    try {
      return JSON.parse(atob(base64));
    } catch (error) {
      console.error("Error decoding base64:", error);
      return null;
    }
  };

  const decodeToken = (token: string | null) => {
    if (!token) {
      console.log("No token provided or found");
      return;
    }
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.error("Invalid token format");
      return;
    }
    const header = decodeBase64(parts[0]);
    const payload = decodeBase64(parts[1]);
    return payload;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      //console.log("User to log in info :", formData);
      const response = await fetch("http://localhost:8000/users/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        //console.log("here is your response " + data.access);
        //console.log("here is your response " + data.user.role);
        const infotoken =decodeToken(data.access);
        console.log("info is",infotoken);
        const expiryTime=infotoken.exp*1000
        //console.log ("expiration time",expiryTime)
        //const now = new Date().getTime();
        //console.log("current time",now)
        localStorage.setItem("tokenExpiry", expiryTime.toString());
        localStorage.setItem("token", data.access);
        localStorage.setItem("roles", JSON.stringify(data.user.role));
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("User log in  succesfully");
        router.replace("/Interfaces/dashboard");
      } else {
        console.error("Error registring user ", response.statusText);
      }
    } catch (error) {
      console.error("Error registring user");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/HomePage"); // Redirect to home if logged in
    }
  }, [router]);

  return (
    <div className="login-page">
      <div className="grid-container">
        <section className="logo">
          <Image src={myImage} alt="Description de l'image" />
          <h1>Système de management des elections au Cameroun</h1>
        </section>
        <section className="login-form-contain">
          <form action="" onSubmit={handleSubmit} className="login-form">
            <span className="form-title">Connectez-vous</span>
            <div className="inputs">
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email"
              />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
              />
              <button type="submit" className="connexion">
                Sign In
              </button>
            </div>
            <div className="line"></div>
            <a href="/sigin" className="oublie">
              Mot de passe oublié?
            </a>
          </form>
        </section>
      </div>

      {/* <div className="flex flex-row w-full h-screen  justify-between">
        <div className="flex flex-col items-center mt-20  w-full gap-y-4 ">
          <div
            className=" text-gray-300 border "
            style={{ width: "clamp(50px, 20vw, 100px)" }}
          ></div>

          <h1 className="font-bold text-black text-3xl whitespace-nowrap text-[clamp(0rem,2vw,2rem)] mx-10">
            Enter your credentials
          </h1>
          
          <form className="  w-full max-w-[400px]" onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className=" block w-full max-w-[400px]  h-10 border bg-white border-gray-300 rounded-md p-2 "
              placeholder="Username"
            />

            <div className="w-full max-w-[400px]">
              <input
                type="text"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className=" block w-full max-w-[400px]  h-10 border bg-white border-gray-300 rounded-md p-2"
                placeholder="Password"
              />

              <div className="flex flex-row ">
                <p className="underline text-gray-500 ">Forgot Password?</p>
              </div>
            </div>

            <button
              type="submit"
              className="block w-full max-w-[400px]  h-10 border bg-black text-white rounded-md p-2"
            >
              Sign In
            </button>
          </form>

          
        </div>
      </div> */}
    </div>
  );
};

export default LoginPage;
