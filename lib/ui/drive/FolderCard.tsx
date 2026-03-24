// lib/ui/drive/FolderCard.tsx

import Link from "next/link";
import { Folder } from "lucide-react";

type Props = {
  name: string;
  href: string;
};

export const FolderCard = ({ name, href }: Props) => {
  return (
    <Link href={href}>
      <div className="group flex items-center gap-3 p-3 border rounded-xl bg-white hover:shadow-md hover:border-yellow-400 transition-all cursor-pointer">
        {/* Icon */}
        <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
          <Folder size={18} />
        </div>

        {/* Name */}
        <p className="text-sm font-medium text-gray-800 truncate group-hover:text-yellow-600">
          {name}
        </p>
      </div>
    </Link>
  );
};