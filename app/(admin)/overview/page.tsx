import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

import { Badge } from "@/lib/ui/components/Badge";
import { Section } from "@/lib/ui/components/Section";
import { StatCard } from "@/lib/ui/components/StatCard";
import { Table } from "@/lib/ui/components/Table";
import { Users, FileText, FolderOpen, Activity, Folder as FolderIcon } from "lucide-react";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { File } from "@/lib/db/models/File";
import { Folder } from "@/lib/db/models/Folder";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function getStats() {
  await connectDB();
  const [totalUsers, totalFiles, totalFolders, recentUsers, recentFiles, recentFolders] = await Promise.all([
    User.countDocuments(),
    File.countDocuments({ isTrashed: { $ne: true } }),
    Folder.countDocuments({ isTrashed: { $ne: true } }),
    User.find().sort({ createdAt: -1 }).limit(5).select("-password"),
    File.find({ isTrashed: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "name email"),
    Folder.find({ isTrashed: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "name email"),
  ]);
  return {
    totalUsers,
    totalFiles,
    totalFolders,
    recentUsers: JSON.parse(JSON.stringify(recentUsers)),
    recentFiles: JSON.parse(JSON.stringify(recentFiles)),
    recentFolders: JSON.parse(JSON.stringify(recentFolders)),
  };
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const stats = await getStats();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={String(stats.totalUsers)}
          icon={<Users size={18} />}
          color="blue"
        />
        <StatCard
          title="Total Files"
          value={String(stats.totalFiles)}
          icon={<FileText size={18} />}
          color="green"
        />
        <StatCard
          title="Total Folders"
          value={String(stats.totalFolders)}
          icon={<FolderOpen size={18} />}
          color="purple"
        />
        <StatCard
          title="Logged In As"
          value={session?.user?.role === "admin" ? "Admin" : "User"}
          icon={<Activity size={18} />}
          color="orange"
        />
      </div>

      {/* Recent Users */}
      <Section title="Recent Users">
        <Table>
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Name</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Email</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Role</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {stats.recentUsers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">No users yet</td>
              </tr>
            )}
            {stats.recentUsers.map((user: any) => (
              <tr key={user._id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{user.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                <td className="px-4 py-3">
                  <Badge variant={user.role === "admin" ? "admin" : "user"}>{user.role}</Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Section>

      {/* Recent Files */}
      <Section title="Recent Files">
        <Table>
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">File Name</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Owner</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Size</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Uploaded</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {stats.recentFiles.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">No files yet</td>
              </tr>
            )}
            {stats.recentFiles.map((file: any) => (
              <tr key={file._id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground max-w-[200px] truncate">{file.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{file.userId?.name ?? "Unknown"}</td>
                <td className="px-4 py-3 text-muted-foreground">{file.size ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(file.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Section>

      {/* Recent Folders */}
      <Section title="Recent Folders">
        <Table>
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Folder Name</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Owner</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {stats.recentFolders.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">No folders yet</td>
              </tr>
            )}
            {stats.recentFolders.map((folder: any) => (
              <tr key={folder._id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-yellow-500/15 text-yellow-500 shrink-0">
                      <FolderIcon size={13} />
                    </div>
                    <span className="font-medium text-foreground truncate max-w-[180px]">{folder.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{folder.userId?.name ?? "Unknown"}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(folder.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Section>
    </div>
  );
}
