import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, UserMinus, UserCheck, Trash2, Search, Activity, Users, AlertTriangle } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import ResultPanel from "@/components/ResultPanel";
import { getUsers, updateUserStatus, deleteUser } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface AdminUser {
    id: string;
    user_handle: string;
    is_admin: boolean;
    is_active: boolean;
    registered_at: string;
    media_count: number;
    public_key_hash: string;
}

const AdminDashboard = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const token = sessionStorage.getItem("originx_token");
    const currentUser = JSON.parse(sessionStorage.getItem("originx_user") || "null");

    useEffect(() => {
        if (!token || !currentUser?.is_admin) {
            navigate("/admin-login");
            return;
        }
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await getUsers(token!);
            setUsers(res.data);
        } catch (err) {
            toast.error("Failed to fetch system registry.");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (handle: string, currentStatus: boolean) => {
        try {
            await updateUserStatus(handle, !currentStatus, token!);
            toast.success(`User @${handle} ${!currentStatus ? 'activated' : 'deactivated'}.`);
            fetchUsers();
        } catch (err: any) {
            toast.error(err.response?.data?.detail || "Action failed.");
        }
    };

    const handleDelete = async (handle: string) => {
        if (!confirm(`CRITICAL: Are you sure you want to permanently delete @${handle}? This action cannot be undone.`)) return;

        const toastId = toast.loading(`Deleting @${handle} from registry...`);
        try {
            await deleteUser(handle, token!);
            toast.success(`User @${handle} removed from registry.`, { id: toastId });
            fetchUsers();
        } catch (err: any) {
            console.error("Deletion error:", err);
            toast.error(err.response?.data?.detail || "Deletion failed. Contact systems administrator.", { id: toastId });
        }
    };

    const filteredUsers = users.filter(u => u.user_handle.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="min-h-screen pt-24 pb-32">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h1 className="font-display text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                            <ShieldCheck className="text-destructive w-8 h-8" />
                            Identity <span className="text-gradient-neon">Governance</span>
                        </h1>
                        <p className="text-muted-foreground font-body">Manage platform integrity and user accountability.</p>
                    </motion.div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search handles..."
                                className="w-full bg-input border border-border rounded-xl py-2.5 px-10 text-sm font-body focus:outline-none focus:border-primary transition-all"
                            />
                        </div>
                        <button onClick={fetchUsers} className="p-2.5 glass rounded-xl hover:text-primary transition-colors">
                            <Activity className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <GlassCard hover={false}>
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                <Users size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-mono uppercase text-muted-foreground tracking-widest">Total Users</p>
                                <p className="text-2xl font-display font-bold">{users.length}</p>
                            </div>
                        </div>
                    </GlassCard>
                    <GlassCard hover={false}>
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-destructive/10 text-destructive">
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-mono uppercase text-muted-foreground tracking-widest">Inactive</p>
                                <p className="text-2xl font-display font-bold">{users.filter(u => !u.is_active).length}</p>
                            </div>
                        </div>
                    </GlassCard>
                    <GlassCard hover={false}>
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-mono uppercase text-muted-foreground tracking-widest">System Admins</p>
                                <p className="text-2xl font-display font-bold">{users.filter(u => u.is_admin).length}</p>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                <ResultPanel title="Identity Governance Manifest">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border/50">
                                    <th className="text-left py-4 px-4 text-xs font-mono uppercase text-muted-foreground tracking-wider">User</th>
                                    <th className="text-left py-4 px-4 text-xs font-mono uppercase text-muted-foreground tracking-wider font-semibold">Status</th>
                                    <th className="text-left py-4 px-4 text-xs font-mono uppercase text-muted-foreground tracking-wider">Registry ID (Masked)</th>
                                    <th className="text-left py-4 px-4 text-xs font-mono uppercase text-muted-foreground tracking-wider">Registered</th>
                                    <th className="text-right py-4 px-4 text-xs font-mono uppercase text-muted-foreground tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence mode="popLayout">
                                    {filteredUsers.map((u, i) => (
                                        <motion.tr
                                            key={u.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="border-b border-border/20 hover:bg-white/5 transition-colors group"
                                        >
                                            <td className="py-4 px-4">
                                                <div className="flex flex-col">
                                                    <span className="font-display font-bold text-foreground">@{u.user_handle}</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase font-mono">{u.is_admin ? 'Admin' : 'User'} // {u.media_count} Assets</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest ${u.is_active ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                                                    {u.is_active ? 'Active' : 'Locked'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 font-mono text-[10px] text-muted-foreground">{u.public_key_hash}</td>
                                            <td className="py-4 px-4 font-mono text-[10px] text-muted-foreground">{new Date(u.registered_at).toLocaleDateString()}</td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center justify-end gap-2 text-muted-foreground">
                                                    <button
                                                        onClick={() => handleToggleStatus(u.user_handle, u.is_active)}
                                                        className={`p-2 rounded-lg transition-colors ${u.is_active ? 'hover:bg-destructive/10 hover:text-destructive' : 'hover:bg-primary/10 hover:text-primary'}`}
                                                        title={u.is_active ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {u.is_active ? <UserMinus size={16} /> : <UserCheck size={16} />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(u.user_handle)}
                                                        className="p-2 rounded-lg hover:bg-destructive/20 hover:text-destructive transition-colors"
                                                        title="Delete Permanently"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                                {filteredUsers.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-muted-foreground font-mono text-sm uppercase tracking-widest">No matching identities found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </ResultPanel>
            </div>
        </div>
    );
};

export default AdminDashboard;
