"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Wrench, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

// Definisi tipe data berdasarkan Response API
interface User {
  id_user: string;
  username: string;
  email: string;
  user_role: string;
  created_at: string;
  updated_at: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    expires_at: string;
    user: User;
    key_status: string;
  };
}

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8080/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      // Parsing response sesuai interface LoginResponse
      const result: LoginResponse = await response.json();

      // Cek status HTTP dan field 'success' dari API
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Login gagal");
      }

      // 1. Simpan Token (akses ke result.data.token)
      localStorage.setItem("token", result.data.token);

      // 2. Simpan Data User (akses ke result.data.user)
      localStorage.setItem("user", JSON.stringify(result.data.user));

      // Opsional: Simpan role atau key_status jika diperlukan untuk logic frontend
      localStorage.setItem("role", result.data.user.user_role);

      // Redirect ke dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute border border-white/20 rounded-lg"
                style={{
                  width: `${Math.random() * 100 + 50}px`,
                  height: `${Math.random() * 100 + 50}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  transform: `rotate(${Math.random() * 45}deg)`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Gradient Orbs */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Wrench className="w-8 h-8 text-slate-900" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Etenance</h1>
              <p className="text-slate-400 text-sm">Enterprise Maintenance</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold leading-tight mb-6">
            Kelola Aset &<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Maintenance
            </span>
            <br />
            dengan Mudah
          </h2>

          <p className="text-slate-400 text-lg mb-10 max-w-md">
            Platform CMMS terpadu untuk mengelola work order, aset, tim teknisi,
            dan preventive maintenance dalam satu sistem terintegrasi.
          </p>

          {/* Features */}
          <div className="space-y-4">
            {[
              { icon: Building2, text: "Multi-company & Multi-location" },
              { icon: Wrench, text: "Work Order Management" },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 text-slate-300">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <feature.icon className="w-5 h-5" />
                </div>
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-800">Etenance</span>
          </div>

          <Card className="border-0 shadow-xl shadow-slate-200/50">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-slate-800">
                Selamat Datang
              </CardTitle>
              <CardDescription className="text-slate-500">
                Masukkan kredensial untuk mengakses dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className="text-slate-700 font-medium"
                  >
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Masukkan username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="h-12 bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-slate-700 font-medium"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="h-12 bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 pr-12"
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={formData.rememberMe}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          rememberMe: checked as boolean,
                        })
                      }
                      className="border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                    />
                    <Label
                      htmlFor="remember"
                      className="text-sm text-slate-600 cursor-pointer"
                    >
                      Ingat saya
                    </Label>
                  </div>
                  <a
                    href="/forgot-password"
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                  >
                    Lupa password?
                  </a>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Masuk"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-slate-500 mt-6">
            © 2024 Etenance. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
