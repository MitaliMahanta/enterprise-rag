import { BiLogoSlack } from "react-icons/bi";

export default function SlackLogo({
  size = 20,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const baseStyle = { position: "absolute" as const, inset: 0 };

  return (
    <span aria-hidden="true" className={`relative inline-block shrink-0 ${className ?? ""}`} style={{ width: size, height: size }}>
      <BiLogoSlack size={size} color="#E01E5A" style={{ ...baseStyle, clipPath: "inset(0 50% 50% 0)" }} />
      <BiLogoSlack size={size} color="#2EB67D" style={{ ...baseStyle, clipPath: "inset(0 0 50% 50%)" }} />
      <BiLogoSlack size={size} color="#36C5F0" style={{ ...baseStyle, clipPath: "inset(50% 50% 0 0)" }} />
      <BiLogoSlack size={size} color="#ECB22E" style={{ ...baseStyle, clipPath: "inset(50% 0 0 50%)" }} />
    </span>
  );
}
