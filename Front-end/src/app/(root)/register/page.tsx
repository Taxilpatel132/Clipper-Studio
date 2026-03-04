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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [level, setLevel] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { signup } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password !== confirmPassword) {
      setError("Passwords do not match!")
      return
    }
    setIsLoading(true)
    try {
      await signup({ name: username, email, password, level })
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0f24] px-4">
      <Card className="w-full max-w-sm border-[#5adaff]/20 bg-[#0f1629] shadow-[0_0_30px_rgba(90,218,255,0.08)]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-[#5adaff]">Register</CardTitle>
          <CardDescription className="text-[#5adaff]/60">
            Create your account to get started
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="flex flex-col gap-4">
            {error && (
              <div className="rounded-md bg-red-500/10 border border-red-500/30 px-3 py-2 text-sm text-red-400">
                {error}
              </div>
            )}
            {/* Username field */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="username" className="text-[#5adaff]/80">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="border-[#5adaff]/20 bg-[#0a0f24] text-white placeholder:text-[#5adaff]/30 focus-visible:border-[#5adaff]/50 focus-visible:ring-[#5adaff]/20"
              />
            </div>

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

            {/* Password field */}
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

            {/* Confirm Password field */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirm-password" className="text-[#5adaff]/80">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pr-10 border-[#5adaff]/20 bg-[#0a0f24] text-white placeholder:text-[#5adaff]/30 focus-visible:border-[#5adaff]/50 focus-visible:ring-[#5adaff]/20"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-[#5adaff]/50 hover:text-[#5adaff] hover:bg-[#5adaff]/10"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
              </div>
            </div>

            {/* Level dropdown */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="level" className="text-[#5adaff]/80">Level</Label>
              <Select value={level} onValueChange={setLevel} required>
                <SelectTrigger className="w-full border-[#5adaff]/20 bg-[#0a0f24] text-white data-placeholder:text-[#5adaff]/30 focus-visible:border-[#5adaff]/50 focus-visible:ring-[#5adaff]/20">
                  <SelectValue placeholder="Select your level" />
                </SelectTrigger>
                <SelectContent className="border-[#5adaff]/20 bg-[#0f1629]">
                  <SelectItem value="beginner" className="text-white focus:bg-[#5adaff]/10 focus:text-[#5adaff]">
                    Beginner
                  </SelectItem>
                  <SelectItem value="intermediate" className="text-white focus:bg-[#5adaff]/10 focus:text-[#5adaff]">
                    Intermediate
                  </SelectItem>
                  <SelectItem value="expert" className="text-white focus:bg-[#5adaff]/10 focus:text-[#5adaff]">
                    Expert
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#5adaff] text-[#0a0f24] font-semibold hover:bg-[#5adaff]/80 hover:shadow-[0_0_20px_rgba(90,218,255,0.3)] mt-4"
            >
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Sign Up"}
            </Button>
            <p className="text-sm text-[#5adaff]/50">
              Already have an account?{" "}
              <Link href="/login" className="text-[#5adaff] hover:underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
