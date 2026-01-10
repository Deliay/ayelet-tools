import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/navbar";
import { Link } from "@heroui/link";
import { useTheme } from "@heroui/use-theme";
import { RiMoonLine, RiSunFill } from "@remixicon/react";

import { useTitle } from "@/util/title-provider";

export default function TopNavbar() {
  const { title } = useTitle();
  const { theme, setTheme } = useTheme();

  return (
    <Navbar>
      <NavbarBrand>
        <p className="font-bold text-inherit">{title}</p>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link color="foreground" href="/rating">
            从夯到拉
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="/lol-dice">
            LOL大乱斗骰子
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <Link onPress={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <RiMoonLine /> : <RiSunFill />}{" "}
        </Link>
      </NavbarContent>
    </Navbar>
  );
}
