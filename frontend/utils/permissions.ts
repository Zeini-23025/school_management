/**
 * Permission Utilities
 * نظام الصلاحيات - جاهز للتوسع المستقبلي
 * 
 * حالياً: جميع الصلاحيات مفتوحة (كل المستخدمين لديهم جميع الصلاحيات)
 * 
 * للتفعيل لاحقاً:
 * 1. حدّث الدوال لتتحقق من user.role
 * 2. أضف Role-based permissions حسب الحاجة
 */

import { User } from '../types';

export type Role = 'admin' | 'teacher' | 'secretary';

export interface PermissionCheck {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

/**
 * الحصول على صلاحيات المستخدم حسب Role
 * حالياً: جميع الصلاحيات مفتوحة للجميع
 */
export const getUserPermissions = (user: User | null): PermissionCheck => {
  // حالياً: كل الصلاحيات مفتوحة
  // TODO: عند التفعيل، قم بإرجاع الصلاحيات حسب Role
  /*
  if (!user) {
    return { canView: false, canCreate: false, canUpdate: false, canDelete: false };
  }
  
  switch (user.role) {
    case 'admin':
      return { canView: true, canCreate: true, canUpdate: true, canDelete: true };
    case 'teacher':
      return { canView: true, canCreate: true, canUpdate: true, canDelete: false };
    case 'secretary':
      return { canView: true, canCreate: true, canUpdate: true, canDelete: false };
    default:
      return { canView: false, canCreate: false, canUpdate: false, canDelete: false };
  }
  */
  
  return { 
    canView: true, 
    canCreate: true, 
    canUpdate: true, 
    canDelete: true 
  };
};

/**
 * فحص صلاحية محددة
 */
export const canViewStudents = (user: User | null): boolean => {
  return getUserPermissions(user).canView;
};

export const canCreateStudents = (user: User | null): boolean => {
  return getUserPermissions(user).canCreate;
};

export const canUpdateStudents = (user: User | null): boolean => {
  return getUserPermissions(user).canUpdate;
};

export const canDeleteStudents = (user: User | null): boolean => {
  return getUserPermissions(user).canDelete;
};

export const canViewClasses = (user: User | null): boolean => {
  return getUserPermissions(user).canView;
};

export const canManageClasses = (user: User | null): boolean => {
  // TODO: يمكنك تحديد أن فقط Admin يمكنه إدارة الأقسام
  return getUserPermissions(user).canCreate;
};

export const canViewResults = (user: User | null): boolean => {
  return getUserPermissions(user).canView;
};

export const canManageResults = (user: User | null): boolean => {
  // TODO: يمكنك تحديد أن المعلمون يمكنهم إدارة النتائج
  return getUserPermissions(user).canCreate;
};

export const canViewStatistics = (user: User | null): boolean => {
  return getUserPermissions(user).canView;
};

export const canManageSubjects = (user: User | null): boolean => {
  // TODO: يمكنك تحديد الصلاحيات حسب الحاجة
  return getUserPermissions(user).canCreate;
};

/**
 * فحص إذا كان المستخدم Admin
 */
export const isAdmin = (user: User | null): boolean => {
  if (!user) return false;
  return user.role === 'admin';
};

/**
 * فحص إذا كان المستخدم معلم
 */
export const isTeacher = (user: User | null): boolean => {
  if (!user) return false;
  return user.role === 'teacher';
};

/**
 * فحص إذا كان المستخدم سكرتير
 */
export const isSecretary = (user: User | null): boolean => {
  if (!user) return false;
  return user.role === 'secretary';
};

/**
 * الحصول على Role name بالعربية
 */
export const getRoleName = (role: Role): string => {
  const roleNames: Record<Role, string> = {
    admin: 'المدير العام',
    teacher: 'معلم',
    secretary: 'سكرتير'
  };
  return roleNames[role] || role;
};
