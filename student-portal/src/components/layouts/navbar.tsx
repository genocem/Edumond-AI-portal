"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X, User, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";
import logo from "@/assets/logo.png";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 left-0 right-0 z-50 flex justify-center pt-2 sm:pt-6 pointer-events-none">
        <nav
          className={cn(
            "pointer-events-auto border flex items-center justify-between",
            "rounded-full w-[95%] sm:w-[90%] md:w-[80%] lg:w-[1000px] h-14 sm:h-16 px-4 sm:px-6 bg-background/70 backdrop-blur-xl border-border/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] supports-[backdrop-filter]:bg-background/40 shadow-[0_0_15px_-3px_rgba(var(--accent),0.1)] border-accent/20",
          )}
        >
          <div className="flex w-full items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src={logo}
                alt="Application Logo"
                width={400}
                className="w-10 h-10"
              />
              <span className="font-bold text-foreground tracking-tight hidden sm:inline group-hover:text-accent transition-all duration-300 text-base">
                EduBud
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/questionnaire"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group py-2"
              >
                Questionnaire
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100" />
              </Link>
              {session?.user && (
                <Link
                  href="/profile"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group py-2"
                >
                  Profile
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100" />
                </Link>
              )}
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(session?.user as any)?.role === "ADMIN" && (
                <Link
                  href="/admin/dashboard"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group py-2"
                >
                  Admin
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100" />
                </Link>
              )}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="scale-90">
                <ThemeToggle />
              </div>

              {session?.user ? (
                <div className="hidden md:flex items-center gap-3">
                  <Link href="/profile">
                    <Button
                      variant="ghost"
                      size="md"
                      className="rounded-full hover:bg-accent/10 hover:text-accent transition-all duration-300"
                    >
                      <User className="h-4 w-4 mr-2" />
                      {session.user.name || "Profile"}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="rounded-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all duration-300"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-3">
                  <Link href="/auth/login">
                    <Button
                      variant="ghost"
                      size="md"
                      className="font-medium rounded-full hover:bg-accent/10 hover:text-accent transition-all duration-300"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button
                      size="md"
                      className="rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 font-medium bg-gradient-to-r from-accent to-accent/90 hover:scale-105"
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden relative z-50 rounded-full hover:bg-accent/10"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed right-0 top-0 bottom-0 w-full xs:w-80 bg-background border-l border-border z-40 md:hidden shadow-2xl p-6 pt-24"
            >
              <div className="flex flex-col space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground px-2">
                    Navigation
                  </h3>
                  <Link
                    href="/questionnaire"
                    className="flex items-center justify-between px-4 py-3 text-base font-medium text-foreground hover:bg-accent/10 hover:text-accent rounded-xl transition-all"
                    onClick={() => setMobileOpen(false)}
                  >
                    Questionnaire{" "}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                  {session?.user && (
                    <Link
                      href="/profile"
                      className="flex items-center justify-between px-4 py-3 text-base font-medium text-foreground hover:bg-accent/10 hover:text-accent rounded-xl transition-all"
                      onClick={() => setMobileOpen(false)}
                    >
                      Profile{" "}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  )}
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(session?.user as any)?.role === "ADMIN" && (
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center justify-between px-4 py-3 text-base font-medium text-foreground hover:bg-accent/10 hover:text-accent rounded-xl transition-all"
                      onClick={() => setMobileOpen(false)}
                    >
                      Admin Dashboard{" "}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  )}
                </div>

                <div className="space-y-2 pt-6 border-t border-border">
                  <h3 className="text-sm font-medium text-muted-foreground px-2">
                    Account
                  </h3>
                  {session?.user ? (
                    <div className="space-y-3 px-2">
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                        <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                          {session.user.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-medium">{session.user.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                            {session.user.email}
                          </p>
                        </div>
                      </div>
                      <button
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-xl transition-colors border border-destructive/20"
                        onClick={() => {
                          setMobileOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-3 px-2">
                      <Link
                        href="/auth/login"
                        className="flex items-center justify-center px-4 py-3 text-sm font-medium border border-border rounded-xl hover:bg-muted transition-colors"
                        onClick={() => setMobileOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/auth/register"
                        className="flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-xl shadow-lg shadow-accent/20 transition-all"
                        onClick={() => setMobileOpen(false)}
                      >
                        Get Started
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
