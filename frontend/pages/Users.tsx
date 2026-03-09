
import React, { useState } from 'react';
import { UserCircleIcon, PlusIcon, ShieldCheckIcon, EnvelopeIcon, CheckCircleIcon, XCircleIcon, TrashIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useSchoolContext } from '../context/SchoolContext';
import { User } from '../types';
import Input from '../components/Input';

const Users: React.FC = () => {
  const { t, language } = useSchoolContext();
  
  // بيانات تجريبية للمستخدمين (بانتظار ربطها بالـ Context/API)
  const [users, setUsers] = useState<User[]>([
    { id: 'u1', username: 'admin', fullName: 'أحمد محمد', role: 'admin', status: 'active', email: 'admin@madrasati.edu' },
    { id: 'u2', username: 'teacher_ali', fullName: 'علي بن صالح', role: 'teacher', status: 'active', email: 'ali@madrasati.edu' },
    { id: 'u3', username: 'sec_fatima', fullName: 'فاطمة الزهراء', role: 'secretary', status: 'active', email: 'fatima@madrasati.edu' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    fullName: '', username: '', role: 'teacher', email: '', status: 'active'
  });

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'admin': return <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-black border border-purple-100 uppercase tracking-widest">{t('role_admin')}</span>;
      case 'teacher': return <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black border border-blue-100 uppercase tracking-widest">{t('role_teacher')}</span>;
      case 'secretary': return <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black border border-orange-100 uppercase tracking-widest">{t('role_secretary')}</span>;
      default: return null;
    }
  };

  const handleAddUser = () => {
    if (!formData.fullName || !formData.username) return;
    const newUser: User = {
      id: 'u' + Math.random().toString(36).substr(2, 9),
      fullName: formData.fullName,
      username: formData.username,
      role: formData.role as any,
      email: formData.email,
      status: 'active'
    };
    setUsers([...users, newUser]);
    setShowModal(false);
    setFormData({ fullName: '', username: '', role: 'teacher', email: '', status: 'active' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
             <div className="p-2 bg-indigo-600 text-white rounded-2xl shadow-lg">
               <UserCircleIcon className="w-8 h-8" />
             </div>
             {t('staff_title')}
          </h2>
          <p className="text-slate-500 font-medium mt-1">{t('staff_desc')}</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
        >
          <PlusIcon className="w-5 h-5" />
          <span>{t('add_user')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div key={user.id} className="bg-white p-8 rounded-[32px] shadow-soft border border-slate-100 hover:shadow-soft-xl transition-all group relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
             
             <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                   <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-2xl shadow-inner border border-indigo-200/50">
                      {user.fullName.charAt(0)}
                   </div>
                   <div className="flex flex-col items-end gap-2">
                      {getRoleBadge(user.role)}
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
                        <CheckCircleIcon className="w-3 h-3" />
                        {t('active')}
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <div>
                      <h4 className="font-black text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{user.fullName}</h4>
                      <p className="text-slate-400 text-xs font-bold">@{user.username}</p>
                   </div>
                   
                   <div className="flex items-center gap-3 text-slate-500">
                      <EnvelopeIcon className="w-4 h-4" />
                      <span className="text-xs font-medium">{user.email || 'لا يوجد بريد'}</span>
                   </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                   <div className="flex gap-2">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><PencilIcon className="w-5 h-5" /></button>
                      <button 
                        onClick={() => setUsers(users.filter(u => u.id !== user.id))}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      ><TrashIcon className="w-5 h-5" /></button>
                   </div>
                   <div className="p-2 bg-slate-50 rounded-xl text-slate-300">
                      <ShieldCheckIcon className="w-5 h-5" />
                   </div>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Modal: إضافة مستخدم */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
           <div className="bg-white rounded-[40px] shadow-soft-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                   <h3 className="text-2xl font-black text-slate-800">{t('add_user')}</h3>
                   <p className="text-xs text-slate-400 font-bold uppercase mt-1 tracking-widest">صلاحيات النظام</p>
                </div>
                <button onClick={() => setShowModal(false)} className="w-12 h-12 flex items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"><XMarkIcon className="w-7 h-7" /></button>
              </div>
              <div className="p-10 space-y-6">
                 <Input 
                   label="الاسم الكامل" 
                   value={formData.fullName} 
                   onChange={e => setFormData({...formData, fullName: e.target.value})} 
                   placeholder="الاسم الثلاثي"
                 />
                 <Input 
                   label="اسم المستخدم (Username)" 
                   value={formData.username} 
                   onChange={e => setFormData({...formData, username: e.target.value})} 
                   placeholder="مثال: ali_2024"
                 />
                 <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">رتبة المستخدم</label>
                    <select 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[20px] font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value as any})}
                    >
                      <option value="admin">{t('role_admin')}</option>
                      <option value="teacher">{t('role_teacher')}</option>
                      <option value="secretary">{t('role_secretary')}</option>
                    </select>
                 </div>
                 <Input 
                   label="البريد الإلكتروني" 
                   value={formData.email} 
                   onChange={e => setFormData({...formData, email: e.target.value})} 
                   placeholder="user@madrasati.edu"
                 />
              </div>
              <div className="p-10 border-t border-slate-100 flex justify-end gap-4 bg-slate-50/30">
                 <button onClick={() => setShowModal(false)} className="px-8 py-4 text-slate-500 font-black hover:bg-slate-200 rounded-2xl transition-all">إلغاء</button>
                 <button 
                   onClick={handleAddUser}
                   className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
                 >حفظ المستخدم</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Users;
