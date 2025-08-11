"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">PS</span>
            </div>
            <span className="font-bold text-xl text-gray-900">Prop Shop AI</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/products" className="text-sm font-medium text-gray-700 transition-colors hover:text-gray-900">
            Products
          </Link>
          <Link href="/solutions" className="text-sm font-medium text-gray-700 transition-colors hover:text-gray-900">
            Solutions
          </Link>
          <Link href="/customers" className="text-sm font-medium text-gray-700 transition-colors hover:text-gray-900">
            Customers
          </Link>
          <Link href="/resources" className="text-sm font-medium text-gray-700 transition-colors hover:text-gray-900">
            Resources
          </Link>
          <Link href="/company" className="text-sm font-medium text-gray-700 transition-colors hover:text-gray-900">
            Company
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="text-sm font-medium">
            Contact Us
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm font-medium">
            Book a Demo →
          </Button>
        </div>
      </div>
    </header>
  )
}
