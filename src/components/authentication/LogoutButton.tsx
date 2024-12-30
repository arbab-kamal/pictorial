"use client";

import { logout } from "@/app/actions/auth";

export function LogoutButton() {
  async function handleLogout() {
    await logout();
  }
  return (
    <span onClick={handleLogout} className="inline-block w-full cursor-pointer">
      Logout
    </span>
  );
}
