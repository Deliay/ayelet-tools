import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/navbar";
import { Link } from "@heroui/link";

import { useTitle } from "@/util/title-provider";

export default function TopNavbar() {
  const { title } = useTitle();

  return (
    <Navbar>
      <NavbarBrand>
        <p className="font-bold text-inherit">{title}</p>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link color="foreground" href="/video-rating">
            视频从夯到拉
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="/lol-dice">
            LOL大乱斗骰子
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end" />
    </Navbar>
  );
}
