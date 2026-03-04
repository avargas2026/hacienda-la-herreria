import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import {
    Users,
    Search,
    Edit2,
    Trash2,
    Mail,
    Calendar,
    CheckCircle2,
    XCircle,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Save,
    X,
    Globe,
    Monitor,
    Shield,
    Download,
    CheckSquare,
    Square,
    Fingerprint,
    Plus,
    Moon,
    Sun,
    UserPlus,
    Lock
} from 'lucide-react';

interface SupabaseUser {
    id: string;
    email?: string;
    created_at: string;
    last_sign_in_at?: string;
    user_metadata?: {
        full_name?: string;
        readable_id?: string;
        registration_ip?: string;
        registration_geo?: string;
        registration_user_agent?: string;
    };
    email_confirmed_at?: string;
}

export default function UserManagement() {
    const [users, setUsers] = useState<SupabaseUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const { theme, toggleTheme } = useTheme();

    // Manual user creation state
    const [showAddForm, setShowAddForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/users');
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Error al cargar usuarios');
            setUsers(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const getDisplayId = (user: SupabaseUser) => {
        if (user.user_metadata?.readable_id) return user.user_metadata.readable_id;
        const date = new Date(user.created_at).toISOString().split('T')[0].replace(/-/g, '');
        const suffix = user.id.substring(0, 4).toUpperCase();
        return `${date}-${suffix}`;
    };

    const toggleSelectAll = () => {
        if (selectedUserIds.size === filteredUsers.length) {
            setSelectedUserIds(new Set());
        } else {
            setSelectedUserIds(new Set(filteredUsers.map(u => u.id)));
        }
    };

    const toggleSelectUser = (id: string) => {
        const newSelection = new Set(selectedUserIds);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedUserIds(newSelection);
    };

    const exportToCSV = () => {
        const usersToExport = users.filter(u => selectedUserIds.has(u.id));
        if (usersToExport.length === 0) {
            alert('Por favor selecciona al menos un usuario.');
            return;
        }

        const headers = ["ID Unico", "Nombre Completo", "Correo", "Estado", "Fecha Registro", "Ultima Conexion", "IP", "Ubicacion", "Dispositivo"];
        const rows = usersToExport.map(user => [
            getDisplayId(user),
            user.user_metadata?.full_name || 'N/A',
            user.email || 'N/A',
            user.email_confirmed_at ? 'Confirmado' : 'Pendiente',
            new Date(user.created_at).toLocaleString('es-CO'),
            user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('es-CO') : 'Nunca',
            user.user_metadata?.registration_ip || 'N/A',
            user.user_metadata?.registration_geo || 'N/A',
            user.user_metadata?.registration_user_agent || 'N/A'
        ]);

        const csvContent = [
            headers.join(';'),
            ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
        ].join('\n');

        const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `usuarios_la_herreria_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName, email: newEmail, password: newPassword })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Error al crear usuario');

            setUsers([data.user, ...users]);
            setShowAddForm(false);
            setNewName('');
            setNewEmail('');
            setNewPassword('');
            alert('Usuario administrativo creado con éxito');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsCreating(false);
        }
    };

    const handleEdit = (user: SupabaseUser) => {
        setEditingUserId(user.id);
        setEditName(user.user_metadata?.full_name || '');
    };

    const handleSaveEdit = async (userId: string) => {
        setActionLoading(userId);
        try {
            const response = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userId, name: editName })
            });
            if (!response.ok) throw new Error('Error al actualizar');
            setUsers(users.map(u => u.id === userId ? { ...u, user_metadata: { ...u.user_metadata, full_name: editName } } : u));
            setEditingUserId(null);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('¿Eliminar permanentemente?')) return;
        setActionLoading(userId);
        try {
            await fetch(`/api/admin/users?id=${userId}`, { method: 'DELETE' });
            setUsers(users.filter(u => u.id !== userId));
        } catch (err: any) {
            alert('Error al eliminar');
        } finally {
            setActionLoading(null);
        }
    };

    const filteredUsers = users.filter(user =>
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.user_metadata?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        getDisplayId(user).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const isDarkMode = theme === 'dark';
    const themeClass = isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-100';
    const textPrimary = isDarkMode ? 'text-stone-100' : 'text-stone-800';
    const textSecondary = isDarkMode ? 'text-stone-400' : 'text-stone-500';

    return (
        <div className={`space-y-6 ${isDarkMode ? 'dark' : ''} p-4 rounded-[2.5rem] transition-colors duration-300`}>
            {/* Header & Theme Toggle */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-96">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-stone-600' : 'text-stone-400'}`} />
                    <input
                        type="text"
                        placeholder="Buscar por ID, nombre o correo..."
                        className={`w-full pl-10 pr-4 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold ${isDarkMode ? 'bg-stone-900 border-stone-800 text-stone-100 placeholder-stone-700' : 'bg-stone-50 border-stone-200 text-stone-900'}`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleTheme}
                        className={`p-2.5 rounded-xl border transition-all ${isDarkMode ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-stone-100 border-stone-200 text-stone-600'}`}
                        title={isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
                    >
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                    {selectedUserIds.size > 0 && (
                        <button
                            onClick={exportToCSV}
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-black transition-all shadow-lg uppercase tracking-tighter"
                        >
                            <Download className="w-3.5 h-3.5" />
                            CSV ({selectedUserIds.size})
                        </button>
                    )}
                    <div className={`${isDarkMode ? 'bg-stone-900 border-stone-800 text-stone-500' : 'bg-stone-50 border-stone-100 text-stone-400'} text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border`}>
                        {filteredUsers.length} REGISTROS
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className={`${themeClass} rounded-[2rem] shadow-sm overflow-hidden`}>
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-emerald-500/20">
                    <table className="w-full text-left min-w-[900px] table-fixed">
                        <thead>
                            <tr className={`${isDarkMode ? 'bg-stone-900' : 'bg-stone-50'} border-b ${isDarkMode ? 'border-stone-800' : 'border-stone-100'}`}>
                                <th className="w-10 px-2 py-4">
                                    <button onClick={toggleSelectAll} className="text-stone-400 hover:text-emerald-600 transition-colors">
                                        {selectedUserIds.size === filteredUsers.length && filteredUsers.length > 0
                                            ? <CheckSquare className="w-4 h-4" />
                                            : <Square className="w-4 h-4" />}
                                    </button>
                                </th>
                                <th className={`px-2 py-4 text-[9px] font-black uppercase tracking-tighter w-24 ${isDarkMode ? 'text-stone-600' : 'text-stone-400'}`}>ID</th>
                                <th className={`px-2 py-4 text-[9px] font-black uppercase tracking-tighter w-36 ${isDarkMode ? 'text-stone-600' : 'text-stone-400'}`}>Nombre</th>
                                <th className={`px-2 py-4 text-[9px] font-black uppercase tracking-tighter w-48 ${isDarkMode ? 'text-stone-600' : 'text-stone-400'}`}>Correo</th>
                                <th className={`px-2 py-4 text-[9px] font-black uppercase tracking-tighter w-24 ${isDarkMode ? 'text-stone-600' : 'text-stone-400'}`}>IP</th>
                                <th className={`px-2 py-4 text-[9px] font-black uppercase tracking-tighter w-36 ${isDarkMode ? 'text-stone-600' : 'text-stone-400'}`}>Geo</th>
                                <th className={`px-2 py-4 text-[9px] font-black uppercase tracking-tighter w-12 text-center ${isDarkMode ? 'text-stone-600' : 'text-stone-400'}`}>OK</th>
                                <th className={`px-2 py-4 text-[9px] font-black uppercase tracking-tighter w-32 ${isDarkMode ? 'text-stone-600' : 'text-stone-400'}`}>Nav</th>
                                <th className={`px-2 py-4 text-[9px] font-black uppercase tracking-tighter w-32 text-right ${isDarkMode ? 'text-stone-600' : 'text-stone-400'}`}>Acc</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDarkMode ? 'divide-stone-800' : 'divide-stone-50'}`}>
                            {loading ? (
                                <tr><td colSpan={9} className="px-6 py-20 text-center text-stone-400 text-xs font-bold uppercase tracking-widest animate-pulse">Analizando registros...</td></tr>
                            ) : currentUsers.length === 0 ? (
                                <tr><td colSpan={9} className="px-6 py-20 text-center text-stone-400 text-xs font-black uppercase">Sin resultados en la nube</td></tr>
                            ) : (
                                currentUsers.map((user) => (
                                    <tr key={user.id} className={`${isDarkMode ? 'hover:bg-stone-800/20' : 'hover:bg-stone-50/50'} transition-colors group ${selectedUserIds.has(user.id) ? (isDarkMode ? 'bg-emerald-950/10' : 'bg-emerald-50/20') : ''}`}>
                                        <td className="px-2 py-3 text-center">
                                            <button onClick={() => toggleSelectUser(user.id)} className={`${selectedUserIds.has(user.id) ? 'text-emerald-500' : (isDarkMode ? 'text-stone-700' : 'text-stone-200')} hover:scale-110 transition-transform`}>
                                                {selectedUserIds.has(user.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                            </button>
                                        </td>
                                        <td className="px-2 py-3">
                                            <span className={`text-[9px] font-mono font-bold px-1 py-0.5 rounded uppercase tracking-tighter truncate block ${isDarkMode ? 'bg-stone-800 text-stone-300' : 'bg-stone-100 text-stone-600'}`}>
                                                {getDisplayId(user)}
                                            </span>
                                        </td>
                                        <td className="px-2 py-3">
                                            {editingUserId === user.id ? (
                                                <input className={`text-[10px] font-black outline-none border-b border-emerald-500 w-full bg-transparent ${isDarkMode ? 'text-stone-100' : 'text-stone-800'}`} value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus />
                                            ) : (
                                                <p className={`text-[10px] font-black uppercase truncate ${isDarkMode ? 'text-stone-100' : 'text-stone-900'}`} title={user.user_metadata?.full_name}>{user.user_metadata?.full_name || 'N/A'}</p>
                                            )}
                                        </td>
                                        <td className="px-2 py-3">
                                            <p className={`text-[9px] font-bold truncate ${isDarkMode ? 'text-stone-500' : 'text-stone-600'}`} title={user.email}>{user.email}</p>
                                        </td>
                                        <td className="px-2 py-3">
                                            <div className={`text-[9px] font-black w-fit px-1.5 py-0.5 rounded-full border truncate ${isDarkMode ? 'bg-emerald-900/20 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                                                {user.user_metadata?.registration_ip || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-2 py-3">
                                            <div className={`flex items-center gap-1 text-[9px] font-bold ${isDarkMode ? 'text-stone-400' : 'text-stone-800'}`}>
                                                <Globe className="w-2.5 h-2.5 text-stone-500 shrink-0" />
                                                <span className="truncate">{user.user_metadata?.registration_geo || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-2 py-3 text-center">
                                            {user.email_confirmed_at ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mx-auto" strokeWidth={3} /> : <XCircle className={`w-3.5 h-3.5 mx-auto ${isDarkMode ? 'text-stone-700' : 'text-stone-200'}`} />}
                                        </td>
                                        <td className="px-2 py-3">
                                            <p className={`text-[8px] font-mono truncate leading-tight italic ${isDarkMode ? 'text-stone-600' : 'text-stone-400'}`} title={user.user_metadata?.registration_user_agent}>
                                                {user.user_metadata?.registration_user_agent || 'N/A'}
                                            </p>
                                        </td>
                                        <td className="px-2 py-3 text-right">
                                            <div className="flex justify-end gap-1">
                                                {editingUserId === user.id ? (
                                                    <button onClick={() => handleSaveEdit(user.id)} className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"><Save className="w-3.5 h-3.5" /></button>
                                                ) : (
                                                    <button onClick={() => handleEdit(user)} className={`${isDarkMode ? 'text-stone-500 hover:text-emerald-400' : 'text-stone-700 hover:text-emerald-600'} p-1 hover:bg-emerald-500/10 rounded-lg transition-all`} title="Editar"><Edit2 className="w-3.5 h-3.5" /></button>
                                                )}
                                                <button onClick={() => handleDelete(user.id)} className={`${isDarkMode ? 'text-stone-500 hover:text-red-400' : 'text-stone-700 hover:text-red-600'} p-1 hover:bg-red-500/10 rounded-lg transition-all`} title="Eliminar"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination & Add User Form */}
            <div className="flex flex-col lg:flex-row gap-6 mt-10">
                {/* Pagination */}
                <div className={`flex-1 flex justify-center items-center gap-4 ${themeClass} p-4 rounded-[2rem] h-fit`}>
                    <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`w-8 h-8 flex items-center justify-center border rounded-xl disabled:opacity-20 transition-all ${isDarkMode ? 'border-stone-800 text-stone-500 hover:bg-stone-800' : 'border-stone-100 text-stone-400 hover:bg-stone-50'}`}><ChevronLeft className="w-4 h-4" /></button>
                    <div className="flex gap-1.5 text-[10px] font-black text-stone-500">
                        {currentPage} <span className="text-stone-700">/</span> {totalPages}
                    </div>
                    <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className={`w-8 h-8 flex items-center justify-center border rounded-xl disabled:opacity-20 transition-all ${isDarkMode ? 'border-stone-800 text-stone-500 hover:bg-stone-800' : 'border-stone-100 text-stone-400 hover:bg-stone-50'}`}><ChevronRight className="w-4 h-4" /></button>
                </div>

                {/* Add User Section */}
                <div className={`flex-[2] ${themeClass} p-6 rounded-[2rem]`}>
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <UserPlus className="w-4 h-4 text-emerald-500" />
                            <h3 className={`text-xs font-black uppercase tracking-widest ${textPrimary}`}>Nuevo Usuario Administrativo</h3>
                        </div>
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className={`text-[10px] font-black uppercase px-3 py-1 rounded-full transition-all ${showAddForm ? 'bg-stone-100 text-stone-600' : 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'}`}
                        >
                            {showAddForm ? 'Cerrar' : 'Agregar Usuario'}
                        </button>
                    </div>

                    {showAddForm && (
                        <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="relative">
                                <label className={`text-[8px] font-black uppercase mb-1 block ${textSecondary}`}>Nombre Completo</label>
                                <input
                                    type="text"
                                    required
                                    className={`w-full text-[10px] font-bold p-2.5 rounded-xl border outline-none focus:ring-1 focus:ring-emerald-500 ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-stone-50 border-stone-200'}`}
                                    placeholder="Ej: Administrador"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                />
                            </div>
                            <div className="relative">
                                <label className={`text-[8px] font-black uppercase mb-1 block ${textSecondary}`}>Correo Electrónico</label>
                                <Mail className="absolute right-3 bottom-2.5 w-3 h-3 text-stone-400" />
                                <input
                                    type="email"
                                    required
                                    className={`w-full text-[10px] font-bold p-2.5 rounded-xl border outline-none focus:ring-1 focus:ring-emerald-500 ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-stone-50 border-stone-200'}`}
                                    placeholder="email@laherreria.co"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                />
                            </div>
                            <div className="relative">
                                <label className={`text-[8px] font-black uppercase mb-1 block ${textSecondary}`}>Contraseña</label>
                                <Lock className="absolute right-3 bottom-2.5 w-3 h-3 text-stone-400" />
                                <input
                                    type="password"
                                    required
                                    className={`w-full text-[10px] font-bold p-2.5 rounded-xl border outline-none focus:ring-1 focus:ring-emerald-500 ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-stone-50 border-stone-200'}`}
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-3">
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 disabled:opacity-50"
                                >
                                    {isCreating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                                    Dar de alta en el sistema
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
