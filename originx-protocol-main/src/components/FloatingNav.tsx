import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, LayoutDashboard, UserPlus, Stamp, ScanSearch, Lock, LogIn, ShieldCheck, Activity } from "lucide-react";

const OriginXLogo = () => (
  <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_8px_hsl(152,100%,50%,0.5)]">
    <path d="M18 2L32 10V26L18 34L4 26V10L18 2Z" stroke="hsl(152, 100%, 50%)" strokeWidth="1.5" fill="none" opacity="0.6" />
    <path d="M18 6L28 12V24L18 30L8 24V12L18 6Z" stroke="hsl(152, 100%, 50%)" strokeWidth="1" fill="hsl(152, 100%, 50%, 0.08)" />
    <path d="M13 13L23 23M23 13L13 23" stroke="hsl(152, 100%, 50%)" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="18" cy="18" r="2" fill="hsl(152, 100%, 50%)" />
  </svg>
);

const baseNavItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/register", label: "Register", icon: UserPlus },
];

const userNavItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/dashboard", label: "Dash", icon: LayoutDashboard },
  { path: "/watermark", label: "Mark", icon: Stamp },
  { path: "/analyze", label: "Analyze", icon: ScanSearch },
];

const adminNavItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/admin-dashboard", label: "Governance", icon: ShieldCheck },
  { path: "/admin-health", label: "Health", icon: Activity },
];

const FloatingNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = sessionStorage.getItem("originx_token");
  const user = JSON.parse(sessionStorage.getItem("originx_user") || "null");

  const getActiveNavItems = () => {
    if (!token) return baseNavItems;
    if (user?.is_admin) return adminNavItems;
    return userNavItems;
  };

  const filteredNavItems = getActiveNavItems();

  const handleLogout = () => {
    sessionStorage.removeItem("originx_token");
    sessionStorage.removeItem("originx_user");
    navigate("/login");
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
      className="fixed top-0 left-0 right-0 z-50 w-full"
    >
      <div className="bg-[rgba(10,20,15,0.35)] backdrop-blur-[10px] border border-[rgba(0,255,150,0.15)] px-6 py-2.5 grid grid-cols-3 items-center w-full">

        {/* Left: Logo */}
        <div className="flex justify-start">
          <Link to="/" className="flex items-center pl-2 gap-3 group">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <OriginXLogo />
            </motion.div>
            <div className="hidden xl:flex flex-col">
              <span className="font-display text-[14px] font-bold tracking-[0.2em] text-foreground leading-none">
                Origin<span className="text-gradient-neon">X</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Nav Items */}
        <div className="flex items-center gap-1 justify-center w-max mx-auto overflow-x-auto no-scrollbar max-w-full">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-300 text-[11px] font-medium justify-center whitespace-nowrap ${isActive
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 gradient-neon rounded-xl neon-glow opacity-80"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon size={12} />
                  <span className="hidden lg:inline font-body font-semibold">{item.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: CTA Button */}
        <div className="flex justify-end pr-2 gap-2">
          {token ? (
            <div className="flex items-center gap-3">
              <span className="hidden md:block text-[10px] font-mono text-primary truncate max-w-[100px]">@{user?.handle}</span>
              {user?.is_admin && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => navigate("/admin-dashboard")}
                  className="hidden xl:flex items-center gap-2 px-3 py-2 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 font-mono text-[9px] uppercase tracking-widest"
                >
                  <ShieldCheck size={10} />
                  <span>Admin Portal</span>
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="glass border-destructive/20 text-destructive px-4 py-2 rounded-xl font-display text-[11px] font-bold tracking-wider flex items-center gap-2"
              >
                <span>Logout</span>
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0px 0px 15px rgba(0, 255, 150, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/login")}
              className="group gradient-neon text-primary-foreground px-5 py-2 rounded-xl font-display text-[11px] font-bold tracking-wider neon-glow flex items-center gap-2"
            >
              <LogIn size={12} />
              <span>Login</span>
            </motion.button>
          )}
        </div>

      </div>
    </motion.nav>
  );
};

export default FloatingNav;
