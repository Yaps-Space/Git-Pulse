import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Separator } from "@/shared/components/ui/separator";
import { Github, Mail, Calendar, AtSign } from "lucide-react";
import { AccountProfileCardProps } from "../types";

const INFO_ITEMS = (username: string, email: string, createdAt: string) => [
  { icon: AtSign,    label: "Username",          value: username  },
  { icon: Mail,      label: "Email",             value: email     },
  { icon: Calendar,  label: "Bergabung sejak",   value: createdAt },
];

export function AccountProfileCard({
  name, username, email, avatar, createdAt,
}: AccountProfileCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      {/* Avatar & name */}
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="w-16 h-16 border-2 border-gray-100">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="bg-gray-900 text-white text-lg font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{name}</h2>
          <div className="flex items-center gap-1.5 mt-1">
            <Github className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-sm text-gray-500">@{username}</span>
          </div>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Info items */}
      <div className="space-y-4">
        {INFO_ITEMS(username, email, createdAt).map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-sm font-medium text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <Separator className="my-6" />

      {/* GitHub link */}
      <a
        href={`https://github.com/${username}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-gray-200 hover:border-gray-900 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
      >
        <Github className="w-4 h-4" />
        Lihat profil di GitHub
      </a>
    </div>
  );
}