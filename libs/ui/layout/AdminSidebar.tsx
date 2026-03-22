// libs/ui/layout/AdminSidebar.tsx
export const AdminSidebar = () => {
  return (
    <aside className="w-64 bg-black text-white p-4">
      <h2 className="text-lg font-bold mb-4">Admin</h2>

      <nav className="flex flex-col gap-2">
        <a href="/admin">Dashboard</a>
        <a href="/admin/users">Users</a>
        <a href="/admin/files">Files</a>
      </nav>
    </aside>
  );
};