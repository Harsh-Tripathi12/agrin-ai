import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { LogOut, Globe } from "lucide-react";

const navConfig = [
  { path: "/dashboard", emoji: "🏠", key: "dashboard", fallback: "Dashboard" },
  { path: "/farm-setup", emoji: "🌱", key: "myFarm", fallback: "My Farm" },
  { path: "/assistant", emoji: "🤖", key: "farmerAssistant", fallback: "AI Assistant" },
  { path: "/crop-doctor", emoji: "🩺", key: "cropDoctor", fallback: "Crop Doctor" },
  { path: "/risk", emoji: "⚠️", key: "farmRisk", fallback: "Farm Risk" },
  { path: "/improve", emoji: "🌿", key: "improveFarm", fallback: "Improve Farm" },
];

function DesktopNavItem({ item, label }) {
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all ${
          isActive
            ? "bg-green-50 text-green-800 shadow-sm"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`
      }
    >
      <span className="text-xl">{item.emoji}</span>
      <span>{label}</span>
    </NavLink>
  );
}

function MobileNavItem({ item, label }) {
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `flex min-w-[50px] flex-col items-center gap-1 rounded-xl px-1.5 py-1 text-[10px] font-semibold transition ${
          isActive
            ? "bg-green-50 text-green-800 font-bold"
            : "text-gray-500 hover:text-gray-800"
        }`
      }
    >
      <span className="text-lg">{item.emoji}</span>
      <span className="truncate max-w-[55px] text-center">{label}</span>
    </NavLink>
  );
}

export default function AppShell({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  // Hide sidebar/shell navigation ONLY on public auth landing pages
  const isAuthPage =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/signup";

  if (isAuthPage) {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const displayName = user?.displayName || user?.email?.split("@")[0] || t("farmer", "Farmer");

  return (
    <div className="min-h-screen bg-[#fbfcf8]">

      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[250px] border-r border-gray-200 bg-white lg:flex lg:flex-col justify-between">

        <div>
          {/* LOGO */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
            <NavLink to="/dashboard" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100 text-2xl shadow-sm">
                🌱
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-green-900 tracking-tight">
                  {t("appName", "AgriN")}
                </h1>
                <p className="text-[11px] font-medium text-gray-400">
                  {t("smartFarming", "Smart Farming")}
                </p>
              </div>
            </NavLink>
          </div>

          {/* NAVIGATION */}
          <nav className="space-y-1 px-4 py-5">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              {t("mainMenu", "Main Menu")}
            </p>
            {navConfig.map((item) => (
              <DesktopNavItem
                key={item.path}
                item={item}
                label={t(item.key, item.fallback)}
              />
            ))}
          </nav>
        </div>

        {/* BOTTOM SECTION: LANGUAGE + PROFILE + LOGOUT */}
        <div className="border-t border-gray-100 p-4 space-y-2">
          {/* Language toggle */}
          <div className="flex items-center justify-between rounded-xl bg-gray-50 p-2 text-xs font-semibold text-gray-600">
            <span className="flex items-center gap-1.5 pl-1">
              <Globe className="w-3.5 h-3.5 text-green-600" /> {t("language", "Language")}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-2.5 py-0.5 rounded-md transition ${
                  language === "en" ? "bg-white text-green-800 shadow-sm font-bold" : "text-gray-400 hover:text-gray-700"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage("hi")}
                className={`px-2.5 py-0.5 rounded-md transition ${
                  language === "hi" ? "bg-white text-green-800 shadow-sm font-bold" : "text-gray-400 hover:text-gray-700"
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>

          {/* Profile Card */}
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl p-2.5 transition ${
                isActive
                  ? "bg-green-50 text-green-800 font-semibold"
                  : "hover:bg-gray-50 text-gray-700"
              }`
            }
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-lg shadow-sm">
              👨‍🌾
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-gray-900">
                {displayName}
              </p>
              <p className="text-[10px] text-gray-400">
                {t("profileSettings", "Profile & Settings")}
              </p>
            </div>
          </NavLink>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200/60 bg-white p-2 text-xs font-semibold text-gray-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t("signOut", "Sign Out")}</span>
          </button>
        </div>

      </aside>

      {/* ================= MOBILE TOP BAR ================= */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur shadow-xs">
        <NavLink to="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-100 text-lg">
            🌱
          </div>
          <span className="text-base font-extrabold text-green-900">{t("appName", "AgriN")}</span>
        </NavLink>

        <div className="flex items-center gap-2">
          {/* Mobile Language Pill */}
          <button
            type="button"
            onClick={() => setLanguage(language === "hi" ? "en" : "hi")}
            className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-green-50 hover:text-green-800 transition"
          >
            {language === "hi" ? "English" : "हिन्दी"}
          </button>

          <NavLink
            to="/profile"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm"
            title={t("profile", "Profile")}
          >
            👨‍🌾
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:text-red-600"
            title={t("signOut", "Sign Out")}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <main className="min-h-screen lg:ml-[250px] pb-16 lg:pb-0">
        {children}
      </main>

      {/* ================= MOBILE BOTTOM NAVIGATION ================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 px-2 py-1.5 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-around">
          {navConfig.map((item) => (
            <MobileNavItem
              key={item.path}
              item={item}
              label={t(item.key, item.fallback)}
            />
          ))}
        </div>
      </nav>

    </div>
  );
}