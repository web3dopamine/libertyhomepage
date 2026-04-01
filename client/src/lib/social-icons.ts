import {
  SiX, SiDiscord, SiGithub, SiTelegram, SiYoutube,
  SiMedium, SiLinkedin, SiReddit, SiInstagram, SiTiktok,
  SiFarcaster,
} from "react-icons/si";
import type { IconType } from "react-icons";

export const SOCIAL_ICON_MAP: Record<string, IconType> = {
  SiX,
  SiDiscord,
  SiGithub,
  SiTelegram,
  SiYoutube,
  SiMedium,
  SiLinkedin,
  SiReddit,
  SiInstagram,
  SiTiktok,
  SiFarcaster,
};

export const SOCIAL_ICON_OPTIONS = [
  { value: "SiX", label: "X / Twitter" },
  { value: "SiDiscord", label: "Discord" },
  { value: "SiGithub", label: "GitHub" },
  { value: "SiTelegram", label: "Telegram" },
  { value: "SiYoutube", label: "YouTube" },
  { value: "SiMedium", label: "Medium" },
  { value: "SiLinkedin", label: "LinkedIn" },
  { value: "SiReddit", label: "Reddit" },
  { value: "SiInstagram", label: "Instagram" },
  { value: "SiTiktok", label: "TikTok" },
  { value: "SiFarcaster", label: "Farcaster" },
];
