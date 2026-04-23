import Link from 'next/link'
import { listUsers } from '@/lib/actions/admin-users'
import { formatDate } from '@/lib/utils/format'

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)

  const result = await listUsers(page)

  if (!result.success) {
    return (
      <div className="text-red-600 text-sm">
        Không thể tải danh sách người dùng. Vui lòng thử lại.
      </div>
    )
  }

  const { users, total, totalPages } = result

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Người dùng</h1>
        <span className="text-sm text-gray-500">{total} người dùng</span>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Họ tên</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Ngày tạo</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Trạng thái</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Chưa có người dùng nào.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-900">{user.email}</td>
                  <td className="px-4 py-3 text-gray-700">{user.fullName || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    {user.bannedUntil ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        Bị khoá
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Hoạt động
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-indigo-600 hover:underline text-xs font-medium"
                    >
                      Chi tiết
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/admin/users?page=${page - 1}`}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Trước
            </Link>
          )}
          <span className="text-sm text-gray-500">
            Trang {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/admin/users?page=${page + 1}`}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sau →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
