"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login:", formData);
    alert("سيتم إعادة توجيهك إلى لوحة التحكم");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
      {/* Form Container */}
      <div className="max-w-md w-full px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">OCP</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            تسجيل الدخول
          </h1>
          <p className="text-gray-600 text-center mb-8">
            ادخل إلى لوحة تحكم عيادتك
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="أدخل بريدك الإلكتروني"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                كلمة المرور
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="أدخل كلمة المرور"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 border border-gray-300 rounded"
                />
                <span className="text-gray-700">تذكرني</span>
              </label>
              <Link href="#" className="text-blue-500 hover:text-blue-600 text-sm">
                هل نسيت كلمة المرور؟
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 font-semibold"
            >
              تسجيل الدخول
            </button>
          </form>

          {/* Signup Link */}
          <p className="text-center text-gray-600 mt-6">
            ليس لديك حساب؟{" "}
            <Link href="/free-trial" className="text-blue-500 hover:text-blue-600 font-semibold">
              ابدأ تجربة مجانية
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
