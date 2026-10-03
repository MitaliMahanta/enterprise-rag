import {
  Activity,
  Bot,
  FileText,
  MessageSquare,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";
import { SiGithub, SiJira } from "react-icons/si";
import SlackLogo from "@/components/slack-logo";

export const navigation = [
  {
    section: "Workspace",
    items: [
      { label: "Assistant", href: "/assistant", icon: MessageSquare },
      { label: "Chat", href: "/assistant/chat", icon: MessageSquareText },
      { label: "Knowledge", href: "/knowledge", icon: FileText },
      { label: "Agents", href: "/agents", icon: Bot },
    ],
  },
  {
    section: "Intelligence",
    items: [
      { label: "Evaluation", href: "/evaluation", icon: ShieldCheck },
      { label: "Analytics", href: "/analytics", icon: Activity },
    ],
  },
  {
    section: "Connectors",
    items: [
      { label: "Jira", href: "/connectors/jira", icon: SiJira },
      { label: "GitHub", href: "/connectors/github", icon: SiGithub },
      { label: "Slack", href: "/connectors/slack", icon: SlackLogo },
    ],
  },
] as const;