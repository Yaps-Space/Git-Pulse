import { Mail, Calendar, AtSign } from "lucide-react";

export const INFO_ITEMS = (username: string, email: string, createdAt: string) => [
  { icon: AtSign,   label: "Username",        value: username  },
  { icon: Mail,     label: "Email",           value: email     },
  { icon: Calendar, label: "Bergabung sejak", value: createdAt },
];
