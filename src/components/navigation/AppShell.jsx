import { NavLink, useLocation } from "react-router-dom";

const navigation = [
  {
    path: "/dashboard",
    emoji: "🏠",
    label: "Dashboard",
  },
  {
    path: "/farm-setup",
    emoji: "🌱",
    label: "My Farm",
  },
  {
    path: "/assistant",
    emoji: "🤖",
    label: "AI Assistant",
  },
  {
    path: "/crop-doctor",
    emoji: "🩺",
    label: "Crop Doctor",
  },
  {
    path: "/risk",
    emoji: "⚠️",
    label: "Farm Risk",
  },
  {
    path: "/improve",
    emoji: "🌿",
    label: "Improve Farm",
  },
];

function DesktopNavItem({ item }) {
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all ${
          isActive
            ? "bg-green-50 text-green-800"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
        }`
      }
    >
      <span className="text-xl">{item.emoji}</span>

      <span>{item.label}</span>
    </NavLink>
  );
}

function MobileNavItem({ item }) {
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `flex min-w-[58px] flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-semibold transition ${
          isActive
            ? "bg-green-50 text-green-800"
            : "text-gray-400"
        }`
      }
    >
      <span className="text-lg">{item.emoji}</span>

      <span>{item.label.split(" ")[0]}</span>
    </NavLink>
  );
}

export default function AppShell({ children }) {
  const location = useLocation();

  const isWelcome =
    location.pathname === "/" ||
    location.pathname === "/profile";

  if (isWelcome) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#fbfcf8]">

      {/* ================= DESKTOP SIDEBAR ================= */}

      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[245px] border-r border-gray-200 bg-white lg:block">

        <div className="flex h-full flex-col">

          {/* LOGO */}

          <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-6">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-2xl">
              🌱
            </div>

            <div>
              <h1 className="text-lg font-extrabold text-green-800">
                AgriN
              </h1>

              <p className="text-[11px] font-medium text-gray-400">
                Smart Farming
              </p>
            </div>

          </div>

          {/* NAVIGATION */}

          <nav className="flex-1 space-y-1 px-4 py-5">

            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Main Menu
            </p>

            {navigation.map((item) => (
              <DesktopNavItem
                key={item.path}
                item={item}
              />
            ))}

          </nav>

          {/* PROFILE */}

          <div className="border-t border-gray-100 p-4">

            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl p-3 transition ${
                  isActive
                    ? "bg-green-50"
                    : "hover:bg-gray-50"
                }`
              }
            >

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                👨‍🌾
              </div>

              <div className="min-w-0">

                <p className="truncate text-sm font-bold">
                  Farmer
                </p>

                <p className="text-xs text-gray-400">
                  My Profile
                </p>

              </div>

            </NavLink>

          </div>

        </div>

      </aside>

      {/* ================= MAIN CONTENT ================= */}

      <main className="min-h-screen lg:ml-[245px]">
        {children}
      </main>

      {/* ================= MOBILE NAVIGATION ================= */}

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 px-2 py-2 backdrop-blur lg:hidden">

        <div className="mx-auto flex max-w-xl items-center justify-around">

          {navigation.slice(0, 5).map((item) => (
            <MobileNavItem
              key={item.path}
              item={item}
            />
          ))}

        </div>

      </nav>

    </div>
  );
}