import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getUserById } from '@/lib/actions/admin-users'
import { formatDate } from '@/lib/utils/format'
import BanToggleButton from './BanToggleButton'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminUserDetailPage({ params }: Props) {
  const { id } = await params
  const result = await getUserById(id)

  if (!result.success) {
    if (result.error === 'NOT_FOUND') notFound()
    return (
      <div className="text-red-600 text-sm">
        Không thể tải thông tin người dùng. Vui lòng thử lại.
      </div>
    )
  }

  const { user } = result

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/users" className="text-sm text-indigo-600 hover:underline">
          ← Danh sách người dùng
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900">Chi tiết người dùng</h1>

      <div className="bg-white border rounded-xl p-6 space-y-4">
        <dl className="grid grid-cols-3 gap-y-3 text-sm">
          <dt className="text-gray-500 font-medium">ID</dt>
          <dd className="col-span-2 text-gray-900 font-mono text-xs break-all">{user.id}</dd>

          <dt className="text-gray-500 font-medium">Email</dt>
          <dd className="col-span-2 text-gray-900">{user.email}</dd>

          <dt className="text-gray-500 font-medium">Họ tên</dt>
          <dd className="col-span-2 text-gray-900">{user.fullName || '—'}</dd>

          <dt className="text-gray-500 font-medium">Ngày đăng ký</dt>
          <dd className="col-span-2 text-gray-900">{formatDate(user.createdAt)}</dd>

          <dt className="text-gray-500 font-medium">Đăng nhập cuối</dt>
          <dd className="col-span-2 text-gray-900">
            {user.lastSignInAt ? formatDate(user.lastSignInAt) : '—'}
          </dd>

          <dt className="text-gray-500 font-medium">Trạng thái</dt>
          <dd className="col-span-2">
            {user.bannedUntil ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                Bị khoá
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                Hoạt động
              </span>
            )}
          </dd>
        </dl>
      </div>

      <div className="flex gap-3">
        <BanToggleButton userId={user.id} isBanned={!!user.bannedUntil} />
      </div>
    </div>
  )
}
