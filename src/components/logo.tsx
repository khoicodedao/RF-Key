import darkLogo from "@/assets/logos/logo.png";
import logo from "@/assets/logos/logo.png";
import Image from "next/image";

export function Logo() {
  return (
    <div className="relative h-10">
      <Image
        src={logo}
        fill
        className="dark:hidden"
        alt="NextAdmin logo"
        role="presentation"
        quality={100}
      />
      <Image
        src={darkLogo}
        fill
        className="hidden dark:block"
        alt="NextAdmin logo"
        role="presentation"
        quality={100}
      />
    </div>
  );
}
