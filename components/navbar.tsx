"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation"; // ✅ Import usePathname
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import NextLink from "next/link";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { Logo } from "@/components/icons";
import { Bell, ShoppingCart } from "lucide-react";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname(); // ✅ Get current route
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cartCount, setCartCount] = useState(0); // ✅ Cart count state

  const notificationCount = 3; // Example: Replace with actual state or prop

  // Function to check authentication state
  const checkAuthStatus = () => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  };

  // ✅ Load Cart Count
  const loadCartCount = () => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      const cartItems = JSON.parse(savedCart);
      const totalQuantity = cartItems.reduce(
        (total: number, item: any) => total + (item.quantity || 1),
        0
      );
      setCartCount(totalQuantity);
    } else {
      setCartCount(0);
    }
  };

  useEffect(() => {
    checkAuthStatus(); // Check auth state on mount
    loadCartCount(); // Load cart count

    // Function to listen for login/logout events
    const handleAuthChange = () => {
      checkAuthStatus();
      loadCartCount(); // Update cart count
    };

    // ✅ Listen for custom "authChange" & "cartUpdate" events
    window.addEventListener("authChange", handleAuthChange);
    window.addEventListener("cartUpdate", loadCartCount);

    return () => {
      window.removeEventListener("authChange", handleAuthChange);
      window.removeEventListener("cartUpdate", loadCartCount);
    };
  }, []);

  // Logout Function
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    window.dispatchEvent(new Event("authChange"));

    // ✅ Show Toast Notification
    toast.success("Successfully logged out!", {
      position: "top-right",
      autoClose: 3000, // Auto close in 3 seconds
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });

    setTimeout(() => {
      router.push("/login"); // Redirect after toast
    }, 2000);
  };

  // ✅ Hide Navbar if on Login or Signup page
  if (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/admin" ||
    pathname === "/admin/client" ||
    pathname === "/admin/profile" ||
    pathname === "/admin/shop" ||
    pathname === "/admin/shop/archive" ||
    pathname === "/admin/orders" ||
    pathname === "/admin/aboutus" ||
    pathname === "/admin/aboutus/subscription" ||
    pathname === "/admin/aboutus/team" ||
    pathname === "/admin/aboutus/promotional" ||
    pathname === "/admin/aboutus/reports" ||
    pathname === "/admin/aboutus/feedback"
  ) {
    return null;
  }

  // ✅ Filtered navigation items (hide "Booking" & "Tracker" for non-users)
  const filteredNavItems = siteConfig.navItems.filter(
    (item) =>
      isAuthenticated ||
      !["/booking", "/tracker", "/profile"].includes(item.href)
  );

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
            <p className="font-bold text-inherit">ARBT</p>
          </NextLink>
        </NavbarBrand>

        <ToastContainer />
        <ul className="hidden lg:flex gap-4 justify-start ml-2">
          {filteredNavItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx("text-foreground hover:text-yellow-600 font-medium")}
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex basis-1/5 sm:basis-full" justify="end">
        {/* Theme Switch */}
        <NavbarItem>{/* <ThemeSwitch /> */}</NavbarItem>

        {isAuthenticated && (
          <NavbarItem>
            <button
              onClick={() => router.push("/notifications")}
              className="relative bg-yellow-500 hover:bg-yellow-600 p-3 rounded-full transition shadow-md"
              title="Notifications"
            >
              <Bell className="text-white" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shadow">
                  {notificationCount}
                </span>
              )}
            </button>
          </NavbarItem>
        )}

        {isAuthenticated && (
          <NavbarItem>
            <button
              onClick={() => router.push("/cart")}
              className="relative bg-yellow-400 hover:bg-yellow-500 p-3 rounded-full transition shadow-md"
              title="View Cart"
            >
              <ShoppingCart className="text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shadow">
                  {cartCount}
                </span>
              )}
            </button>
          </NavbarItem>
        )}

        <NavbarItem className="hidden sm:flex gap-2">
          {isAuthenticated ? (
            <Button
              onClick={handleLogout}
              className="text-sm font-medium bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
            >
              Logout
            </Button>
          ) : (
            <Button
              as={NextLink}
              href="/login"
              className="text-sm font-medium bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition"
            >
              Login
            </Button>
          )}
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <NavbarMenuToggle />
      </NavbarContent>

      {/* Mobile Navigation */}
      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {filteredNavItems.map((item, index) => (
            <NavbarMenuItem key={`${item.href}-${index}`}>
              <NextLink
                className="text-lg font-medium text-foreground hover:text-yellow-600"
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarMenuItem>
          ))}

          {isAuthenticated && (
            <NavbarMenuItem>
              <Button
                onClick={() => router.push("/cart")}
                className="w-full bg-yellow-500 text-white px-4 py-2 rounded-full hover:bg-yellow-600 flex items-center gap-2 transition"
              >
                🛒({cartCount})
              </Button>
            </NavbarMenuItem>
          )}

          {isAuthenticated ? (
            <NavbarMenuItem>
              <Button
                onClick={handleLogout}
                className="w-full text-white bg-red-600 px-4 py-2 rounded-md hover:bg-red-700 transition"
              >
                Logout
              </Button>
            </NavbarMenuItem>
          ) : (
            <NavbarMenuItem>
              <Button
                as={NextLink}
                href="/login"
                className="w-full bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition"
              >
                Login
              </Button>
            </NavbarMenuItem>
          )}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
