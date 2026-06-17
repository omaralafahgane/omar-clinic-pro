'use client';

import Link from 'next/link';

export default function DocsPage() {
  return (
    <div style={{ direction: 'rtl', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <style>{`
        body {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 20px;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          overflow: hidden;
        }

        header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 60px 40px;
          text-align: center;
        }

        header h1 {
          font-size: 3em;
          margin-bottom: 10px;
          font-weight: 900;
        }

        header p {
          font-size: 1.3em;
          opacity: 0.9;
        }

        .content {
          padding: 60px 40px;
        }

        .docs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          margin: 30px 0;
        }

        .doc-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px;
          border-radius: 15px;
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
          transition: transform 0.3s ease;
          text-decoration: none;
          display: block;
        }

        .doc-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.5);
        }

        .doc-card h3 {
          font-size: 1.8em;
          margin-bottom: 15px;
        }

        .doc-card p {
          font-size: 1.1em;
          opacity: 0.9;
          margin: 0;
        }

        footer {
          background: #f8f9fa;
          padding: 40px;
          text-align: center;
          border-top: 1px solid #eee;
        }

        footer p {
          color: #666;
          margin: 0;
        }
      `}</style>

      <div className="container">
        <header>
          <h1>📚 التوثيق</h1>
          <p>شرح شامل لجميع ميزات Omar Clinic Pro</p>
        </header>

        <div className="content">
          <h2 style={{ fontSize: '2.5em', color: '#333', marginBottom: '30px', paddingBottom: '15px', borderBottom: '4px solid #667eea' }}>
            الأقسام المتاحة
          </h2>

          <div className="docs-grid">
            <Link href="/docs/subscription" className="doc-card">
              <h3>🔐 نظام الاشتراكات</h3>
              <p>شرح شامل لكيفية عمل نظام إدارة الاشتراكات والتكامل مع Shopify</p>
            </Link>

            <Link href="/docs/subscription" className="doc-card" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
              <h3>📊 التقارير</h3>
              <p>قريباً: شرح نظام التقارير والإحصائيات</p>
            </Link>

            <Link href="/docs/subscription" className="doc-card" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
              <h3>👥 إدارة المرضى</h3>
              <p>قريباً: شرح نظام إدارة بيانات المرضى</p>
            </Link>
          </div>
        </div>

        <footer>
          <p>© 2026 Omar Clinic Pro - نظام إدارة العيادات المتقدم</p>
          <p style={{ marginTop: '10px', fontSize: '0.9em' }}>تم إنشاؤه بواسطة Manus AI</p>
        </footer>
      </div>
    </div>
  );
}
