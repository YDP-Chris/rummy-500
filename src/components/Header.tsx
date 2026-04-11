"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { LoginModal } from "./LoginModal";

export function Header() {
  const { auth, logout } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <header className="border-b border-border px-4 py-3 flex justify-between items-center">
        <a href="/" className="text-xl font-bold tracking-tight">
          Rummy 500
        </a>
        <div className="text-sm">
          {auth ? (
            <div className="flex items-center gap-2">
              <span className="font-medium">{auth.displayName}</span>
              <span className="text-foreground/40">·</span>
              <button
                onClick={logout}
                className="text-accent font-medium"
              >
                Log Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setLoginOpen(true)}
              className="text-accent font-medium"
            >
              Log In
            </button>
          )}
        </div>
      </header>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
