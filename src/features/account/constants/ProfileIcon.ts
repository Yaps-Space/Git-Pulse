import { Github, Mail, Calendar } from "lucide-react";

export const INFO_ITEMS = (username: string, email: string, createdAt: string) => [
  { icon: Github,   label: "Username",        value: username  },
  { icon: Mail,     label: "Email",           value: email     },
  { icon: Calendar, label: "Bergabung sejak", value: createdAt },
];
