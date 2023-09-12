import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { FiMoon } from "react-icons/fi";
import { BsSun } from "react-icons/bs";


const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="mt-5">
      {theme === "dark" ? (
        <BsSun className="text-2xl sm:text-3xl text-slate-50" cursor="pointer" onClick={() => setTheme("light")} />
      ) : (
        <FiMoon className="text-2xl sm:text-3xl" cursor="pointer" onClick={() => setTheme("dark")} />
      )}
    </div>
  );
};

export default ThemeSwitcher;