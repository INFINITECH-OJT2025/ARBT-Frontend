export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "ARBT",
  description: "Make beautiful websites regardless of your design experience.",
  navItems: [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Shop", href: "/shop" },
    { label: "Booking", href: "/booking" },
    { label: "Tracker", href: "/tracker" },
    { label: "Profile", href: "/profile" },
  ],
  adminSidebarItems: [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Orders", href: "/admin/orders" },
    { label: "Products", href: "/admin/products" },
    { label: "Users", href: "/admin/users" },
    { label: "Reports", href: "/admin/reports" },
    { label: "Settings", href: "/admin/settings" },
  ],
  links: {
    github: "https://github.com/heroui-inc/heroui",
    twitter: "https://twitter.com/hero_ui",
    docs: "https://heroui.com",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};
