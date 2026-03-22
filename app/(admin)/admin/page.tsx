import { Badge } from "@/lib/ui/components/Badge";
import { Section } from "@/lib/ui/components/Section";
import { StatCard } from "@/lib/ui/components/StatCard";
import { Table } from "@/lib/ui/components/Table";
import {
  Users,
  FileText,
  HardDrive,
  Activity,
} from "lucide-react";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      {/* Title */}
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value="120"
          icon={<Users size={18} />}
          color="blue"
        />
        <StatCard
          title="Total Files"
          value="540"
          icon={<FileText size={18} />}
          color="green"
        />
        <StatCard
          title="Storage Used"
          value="120 GB"
          icon={<HardDrive size={18} />}
          color="purple"
        />
        <StatCard
          title="Active Users"
          value="35"
          icon={<Activity size={18} />}
          color="orange"
        />
      </div>

      {/* Recent Users */}
      <Section title="Recent Users">
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Harsh</td>
              <td>harsh@mail.com</td>
              <td>
                <Badge variant="user">User</Badge>
              </td>
            </tr>

            <tr>
              <td>Admin</td>
              <td>admin@mail.com</td>
              <td>
                <Badge variant="admin">Admin</Badge>
              </td>
            </tr>
          </tbody>
        </Table>
      </Section>

      {/* Recent Files */}
      <Section title="Recent Files">
        <Table>
          <thead>
            <tr>
              <th>File Name</th>
              <th>Owner</th>
              <th>Size</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Resume.pdf</td>
              <td>Harsh</td>
              <td>2 MB</td>
            </tr>

            <tr>
              <td>Image.png</td>
              <td>Admin</td>
              <td>1.5 MB</td>
            </tr>
          </tbody>
        </Table>
      </Section>
    </div>
  );
}