"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useUser } from "@clerk/nextjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  approval_status: "pending" | "approved" | "rejected";
  created_at: string;
  role: string;
}

export default function AdminUsersPage() {
  const { user: currentUser } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching users:", error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAction = async (userId: string, action: "approve" | "reject") => {
    setProcessingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: "POST",
      });
      if (res.ok) {
        await fetchUsers();
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      alert("Failed to process request");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-gray-900">إدارة المستخدمين</h2>
        <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl font-bold">
          إجمالي المستخدمين: {users.length}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-bold text-gray-600">المستخدم</th>
              <th className="px-6 py-4 font-bold text-gray-600">البريد الإلكتروني</th>
              <th className="px-6 py-4 font-bold text-gray-600">الحالة</th>
              <th className="px-6 py-4 font-bold text-gray-600">تاريخ التسجيل</th>
              <th className="px-6 py-4 font-bold text-gray-600">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">{user.role}</div>
                </td>
                <td className="px-6 py-4 text-gray-600 font-medium">{user.email}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      user.approval_status === "approved"
                        ? "bg-green-100 text-green-700"
                        : user.approval_status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {user.approval_status === "approved"
                      ? "معتمد"
                      : user.approval_status === "rejected"
                      ? "مرفوض"
                      : "بانتظار الموافقة"}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-sm">
                  {new Date(user.created_at).toLocaleDateString("ar-EG")}
                </td>
                <td className="px-6 py-4">
                  {user.id !== currentUser?.id && (
                    <div className="flex gap-2">
                      {user.approval_status !== "approved" && (
                        <button
                          onClick={() => handleAction(user.id, "approve")}
                          disabled={processingId === user.id}
                          className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          اعتماد
                        </button>
                      )}
                      {user.approval_status !== "rejected" && (
                        <button
                          onClick={() => handleAction(user.id, "reject")}
                          disabled={processingId === user.id}
                          className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          رفض
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
