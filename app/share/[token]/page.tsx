import { connectDB } from "@/lib/db/connect";
import { Share } from "@/lib/db/models/Share";
import { FileText, Folder, Download, ExternalLink } from "lucide-react";
import Link from "next/link";

type Props = {
  params: Promise<{ token: string }>;
};

async function getShare(token: string) {
  await connectDB();
  const share = await Share.findOne({ token, shareType: "public" });
  return share ? JSON.parse(JSON.stringify(share)) : null;
}

export default async function SharePage({ params }: Props) {
  const { token } = await params;
  const share = await getShare(token);

  if (!share) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <FileText size={28} />
          </div>
          <h1 className="text-xl font-semibold text-gray-800">Link not found</h1>
          <p className="text-sm text-gray-500">This share link may have been revoked or never existed.</p>
          <Link href="/" className="inline-block text-sm text-blue-600 hover:underline">
            Go to Drive
          </Link>
        </div>
      </div>
    );
  }

  const isFile = share.itemType === "file";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white border rounded-2xl shadow-sm p-8 w-full space-y-6" style={{ maxWidth: "420px" }}>
        <div className="text-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isFile ? "bg-blue-100 text-blue-600" : "bg-yellow-100 text-yellow-600"}`}>
            {isFile ? <FileText size={30} /> : <Folder size={30} />}
          </div>
          <h1 className="text-xl font-semibold text-gray-800 break-all">{share.itemName}</h1>
          <p className="text-sm text-gray-400 mt-1 capitalize">{share.itemType} · Public link</p>
        </div>

        <div className="space-y-3">
          {isFile && share.url ? (
            <>
              <a
                href={share.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
              >
                <ExternalLink size={16} />
                Open File
              </a>
              <a
                href={share.url}
                download={share.itemName}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors text-gray-700"
              >
                <Download size={16} />
                Download
              </a>
            </>
          ) : (
            <div className="text-center text-sm text-gray-500 py-2">
              <p>This folder has been shared with you.</p>
              <p className="mt-1">Sign in to browse its contents.</p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400">
          Powered by{" "}
          <Link href="/" className="text-blue-500 hover:underline">
            Drive
          </Link>
        </p>
      </div>
    </div>
  );
}
