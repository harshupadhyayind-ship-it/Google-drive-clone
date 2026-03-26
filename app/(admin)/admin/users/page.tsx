import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { File } from "@/lib/db/models/File";
import { UsersContent } from "@/lib/ui/admin/UsersContent";

const LIMIT = 20;

async function getInitialUsers() {
  await connectDB();

  const [users, total] = await Promise.all([
    User.find().sort({ createdAt: -1 }).limit(LIMIT).select("-password"),
    User.countDocuments(),
  ]);

  const userIds = users.map((u: any) => u._id);
  const fileCounts = await File.aggregate([
    { $match: { userId: { $in: userIds }, isTrashed: { $ne: true } } },
    { $group: { _id: "$userId", count: { $sum: 1 } } },
  ]);
  const fileCountMap: Record<string, number> = {};
  fileCounts.forEach((fc: any) => {
    fileCountMap[fc._id.toString()] = fc.count;
  });

  const usersWithCounts = JSON.parse(JSON.stringify(users)).map((u: any) => ({
    ...u,
    fileCount: fileCountMap[u._id] ?? 0,
  }));

  return { users: usersWithCounts, total };
}

export default async function UsersPage() {
  const { users, total } = await getInitialUsers();
  return <UsersContent initialUsers={users} initialTotal={total} />;
}
