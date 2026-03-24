// lib/ui/drive/FileCard.tsx

import { getFileIcon } from "@/lib/utils/fileIcon";
import Link from "next/link";

type Props = {
  name: string;
  href: string;
};

export const FileCard = ({ name, href }: Props) => {
  const Icon = getFileIcon(name);

  return (
    <Link href={href} target="_blank">
      <div className="group flex items-center gap-3 p-3 border rounded-xl bg-white hover:shadow-md hover:border-blue-400 transition-all cursor-pointer">
        {/* Icon */}
        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
          <Icon size={18} />
        </div>

        {/* Name */}
        <p className="text-sm font-medium text-gray-800 truncate group-hover:text-blue-600">
          {name}
        </p>
      </div>
    </Link>
  );
};