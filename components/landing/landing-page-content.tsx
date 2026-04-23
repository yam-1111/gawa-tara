"use client"

import * as React from "react"
import { DotLottiePlayer } from "@dotlottie/react-player"
import "@dotlottie/react-player/dist/index.css"
import { LoginForm } from "@/components/auth/login-form"

export function LandingPageContent() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden p-6">
      {/* Decorative background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px] animate-pulse" />

      <div className="container max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Side: Lottie + Text */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
          <div className="w-full max-w-lg aspect-square">
            <DotLottiePlayer
              src="/assets/svg/gawa_tara.lottie"
              autoplay
              loop
              className="w-full h-full"
            />
          </div>
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-heading font-bold text-primary tracking-tight">
              Gawa Tara?
            </h1>
            <p className="text-xl md:text-2xl font-body leading-relaxed text-muted-foreground max-w-xl italic">
              "Turn your to-do lists into a living, breathing schedule. Grounded warmth for your daily growth."
            </p>
          </div>
        </div>

        {/* Right Side: Login Section */}
        <div className="flex justify-center lg:justify-end">
          <LoginForm />
        </div>
      </div>
    </main>
  )
}
