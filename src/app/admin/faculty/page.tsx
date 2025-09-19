import AdminLayout from '@/components/admin/admin-layout'
import FacultyManager from '@/components/admin/faculty-manager'

export default function AdminFacultyPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Faculty Management</h1>
          <p className="text-gray-600">
            Manage faculty members, their photos, and information displayed on the Faculty page.
          </p>
        </div>
        
        <FacultyManager />
      </div>
    </AdminLayout>
  )
}
