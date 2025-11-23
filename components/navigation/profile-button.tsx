"use client";

import { useUser } from "@/contexts/user-context";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function ProfileButton() {
  const { user, isLoading } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (isLoading) {
    return (
      <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
    );
  }

  if (!user?.data) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-full"
        aria-label="Profile menu"
      >
        <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-purple-500 ring-offset-2 ring-offset-white">
          <Image
            src={user.data.pfp_url || "/images/icon.png"}
            alt={user.data.display_name || "Profile"}
            width={40}
            height={40}
            className="object-cover"
          />
        </div>
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-12 right-0 z-50 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 animate-in fade-in slide-in-from-top-2 duration-200"
        >
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={user.data.pfp_url || "/images/icon.png"}
                    alt={user.data.display_name || "Profile"}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {user.data.display_name}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    @{user.data.username}
                  </p>
                </div>
              </div>
            </div>
            <div className="py-2">
              <Link
                href="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                View Profile
              </Link>
              <Link
                href="/my-entries"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                My Entries
              </Link>
            </div>
          </div>
      )}
    </div>
  );
}

