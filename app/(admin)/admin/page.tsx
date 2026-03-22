// app/(admin)/admin/page.tsx

export default function AdminPage() {
  return (
    <div className="space-y-6">
      {/* Title */}
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">Total Users</p>
          <h2 className="text-xl font-bold">120</h2>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">Total Files</p>
          <h2 className="text-xl font-bold">540</h2>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">Storage Used</p>
          <h2 className="text-xl font-bold">120 GB</h2>
        </div>

        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">Active Users</p>
          <h2 className="text-xl font-bold">35</h2>
        </div>
      </div>

      {/* Recent Users */}
      <section>
        <h2 className="text-lg font-medium mb-3">Recent Users</h2>

        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-t">
                <td className="p-3">Harsh</td>
                <td className="p-3">harsh@mail.com</td>
                <td className="p-3">User</td>
              </tr>

              <tr className="border-t">
                <td className="p-3">Admin</td>
                <td className="p-3">admin@mail.com</td>
                <td className="p-3">Admin</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent Files */}
      <section>
        <h2 className="text-lg font-medium mb-3">Recent Files</h2>

        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">File Name</th>
                <th className="p-3">Owner</th>
                <th className="p-3">Size</th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-t">
                <td className="p-3">Resume.pdf</td>
                <td className="p-3">Harsh</td>
                <td className="p-3">2 MB</td>
              </tr>

              <tr className="border-t">
                <td className="p-3">Image.png</td>
                <td className="p-3">Admin</td>
                <td className="p-3">1.5 MB</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}