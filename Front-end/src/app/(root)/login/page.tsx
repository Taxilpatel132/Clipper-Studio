"use client"

import { useState } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      await login(email, password)
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0f24] px-4">
      <Card className="w-full max-w-sm border-[#5adaff]/20 bg-[#0f1629] shadow-[0_0_30px_rgba(90,218,255,0.08)]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-[#5adaff]">Login</CardTitle>
          <CardDescription className="text-[#5adaff]/60">
            Enter your email and password to sign in
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="flex flex-col gap-4">
            {error && (
              <div className="rounded-md bg-red-500/10 border border-red-500/30 px-3 py-2 text-sm text-red-400">
                {error}
              </div>
            )}
            {/* Email field */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-[#5adaff]/80">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-[#5adaff]/20 bg-[#0a0f24] text-white placeholder:text-[#5adaff]/30 focus-visible:border-[#5adaff]/50 focus-visible:ring-[#5adaff]/20"
              />
            </div>

            {/* Password field with visibility toggle */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-[#5adaff]/80">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10 border-[#5adaff]/20 bg-[#0a0f24] text-white placeholder:text-[#5adaff]/30 focus-visible:border-[#5adaff]/50 focus-visible:ring-[#5adaff]/20"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-[#5adaff]/50 hover:text-[#5adaff] hover:bg-[#5adaff]/10"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#5adaff] text-[#0a0f24] font-semibold hover:bg-[#5adaff]/80 hover:shadow-[0_0_20px_rgba(90,218,255,0.3)] mt-4"
            >
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Sign In"}
            </Button>
            <p className="text-sm text-[#5adaff]/50">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-[#5adaff] hover:underline">
                Register
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
