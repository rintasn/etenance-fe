"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Jika tidak ada token dan bukan di halaman login, redirect ke login
    if (!token && pathname !== "/login") {
      setAuthorized(false);
      router.push("/login");
    } else {
      // Jika ada token atau sedang di halaman login, izinkan akses
      // Optional: Tambahkan validasi token lebih lanjut di sini jika perlu
      setAuthorized(true);
    }
  }, [pathname, router]);

  // Tampilkan loading atau null sebentar saat pengecekan dilakukan
  // untuk mencegah flash content yang tidak seharusnya dilihat
  if (!authorized && pathname !== "/login") {
    return null;
  }

  return <>{children}</>;
}
