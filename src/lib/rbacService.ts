import { supabase } from './supabase'
import type { Role } from '@/types/workflow'

export async function getUserRoles(userId: string): Promise<Role[]> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('roles(*)')
      .eq('user_id', userId)

    if (error) throw error
    return data?.map(ur => ur.roles).flat() || []
  } catch (error) {
    console.error('Error fetching user roles:', error)
    return []
  }
}

export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  try {
    const roles = await getUserRoles(userId)
    return roles.some(role => role.permissions.includes(permission))
  } catch (error) {
    console.error('Error checking permission:', error)
    return false
  }
}

export async function getUsersByRole(roleId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role_id', roleId)

    if (error) throw error
    return data?.map(ur => ur.user_id) || []
  } catch (error) {
    console.error('Error fetching users by role:', error)
    return []
  }
}
// Remove unused import
// import { UserRole } from "../types/workflow";