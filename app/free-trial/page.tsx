"use client";

import Link from "next/link";
import { useState } from "react";

export default function FreeTrialPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    clinicName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Trial signup:", formData);
    alert("تم التسجيل بنجاح! سيتم إعادة توجيهك إلى لوحة التحكم");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
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
          </div>
        </div>
      </nav>

      {/* Form Container */}
      <section className="max-w-md mx-auto px-4 py-20">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            تجربة مجانية
          </h1>
          <p className="text-gray-600 text-center mb-8">
            14 يوم مجاني بدون بطاقة ائتمان
          </p>

          {/* Progress */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full transition ${
                  s <= step ? "bg-blue-500" : "bg-gray-200"
                }`}
              ></div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Clinic Info */}
            {step === 1 && (
              <>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    اسم العيادة
                  </label>
                  <input
                    type="text"
                    name="clinicName"
                    value={formData.clinicName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="أدخل اسم عيادتك"
                  />
                </div>
              </>
            )}

            {/* Step 2: Contact Info */}
            {step === 2 && (
              <>
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
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="أدخل رقم هاتفك"
                  />
                </div>
              </>
            )}

            {/* Step 3: Password */}
            {step === 3 && (
              <>
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
                    placeholder="أدخل كلمة مرور قوية"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    تأكيد كلمة المرور
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="أعد إدخال كلمة المرور"
                  />
                </div>
              </>
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex-1 border-2 border-blue-500 text-blue-500 py-2 rounded-lg hover:bg-blue-50 font-semibold"
                >
                  السابق
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 font-semibold"
                >
                  التالي
                </button>
              ) : (
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 font-semibold"
                >
                  إنشاء حساب
                </button>
              )}
            </div>
          </form>

          {/* Login Link */}
          <p className="text-center text-gray-600 mt-6">
            هل لديك حساب بالفعل؟{" "}
            <Link href="/login" className="text-blue-500 hover:text-blue-600 font-semibold">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
