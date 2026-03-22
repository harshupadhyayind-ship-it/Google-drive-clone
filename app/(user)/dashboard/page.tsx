import { FolderCard } from "@/lib/ui/drive/FolderCard";
import { FileCard } from "@/lib/ui/drive/FileCard";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">My Drive</h1>

      <section>
        <h2 className="mb-3">Folders</h2>
        <div className="grid grid-cols-4 gap-4">
          <FolderCard name="Projects" />
          <FolderCard name="Docs" />
        </div>
      </section>

      <section>
        <h2 className="mb-3">Files</h2>
        <div className="grid grid-cols-4 gap-4">
          <FileCard name="Resume.pdf" />
        </div>
      </section>
    </div>
  );
}