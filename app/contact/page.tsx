"use client";

import Link from "next/link";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("شكراً لك! سنتواصل معك قريباً");
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">OCP</span>
              </div>
              <span className="font-bold text-xl text-gray-900">Omar Clinic Pro</span>
            </Link>
            <div className="flex gap-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                تسجيل الدخول
              </Link>
              <Link
                href="/free-trial"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                تجربة مجانية
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">اتصل بنا</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            نحن هنا للإجابة على أسئلتك والمساعدة في نجاح عيادتك
          </p>
        </div>
      </section>

      {/* Contact Form */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Form */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">أرسل لنا رسالة</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">الاسم</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="أدخل اسمك"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">البريد الإلكتروني</label>
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
                <label className="block text-gray-700 font-semibold mb-2">رقم الهاتف</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="أدخل رقم هاتفك"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">الرسالة</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="أدخل رسالتك"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 font-semibold"
              >
                إرسال الرسالة
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">معلومات التواصل</h2>
            <div className="space-y-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">البريد الإلكتروني</h3>
                <p className="text-gray-600">support@omarclinicp.com</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">رقم الهاتف</h3>
                <p className="text-gray-600">+966 50 123 4567</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">ساعات العمل</h3>
                <p className="text-gray-600">السبت - الخميس: 9:00 - 18:00</p>
                <p className="text-gray-600">الجمعة: مغلق</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">الدعم الفني</h3>
                <p className="text-gray-600">متاح 24/7 للخطط المتقدمة والمؤسسية</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
