import { Navigate } from 'react-router-dom'
import { APP_ROUTES } from '@/shared/constant/routes.constants'
import { sessionStore } from '@/shared/store'
import { ParentLayout, StudentLayout, TeacherLayout } from './main'

export function RoleLayout() {
  const role = sessionStore((state) => state.currentUser?.user.userType)
  if (role === 'teacher') return <TeacherLayout />
  if (role === 'parent') return <ParentLayout />
  if (role === 'student' || role === 'admin') return <StudentLayout />
  return <Navigate to={APP_ROUTES.ONBOARDING} replace />
}
