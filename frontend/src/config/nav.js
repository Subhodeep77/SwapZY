const getNavLinks = (authUser) => {
  const links = [
    { label: "Home", path: "/" },
    { label: "Browse", path: "/browse" },
  ];

  if (authUser) {
    links.push({ label: "Dashboard", path: "/dashboard" });

    // Check for admin role
    if (authUser.role === "ADMIN") {
      links.push({ label: "Admin Panel", path: "/admin" });
    }
  }

  links.push({ label: "FAQs", path: "/#faqs" });

  return links;
};

export default getNavLinks;
