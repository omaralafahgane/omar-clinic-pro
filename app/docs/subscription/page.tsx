'use client';

export default function SubscriptionDocsPage() {
  return (
    <div style={{ direction: 'rtl', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

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

        .section {
          margin-bottom: 80px;
        }

        .section h2 {
          font-size: 2.5em;
          color: #333;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 4px solid #667eea;
        }

        .section h3 {
          font-size: 1.8em;
          color: #667eea;
          margin-top: 40px;
          margin-bottom: 20px;
        }

        .section p {
          font-size: 1.1em;
          line-height: 1.8;
          color: #555;
          margin-bottom: 20px;
        }

        .flow-diagram {
          background: #f8f9fa;
          border-radius: 15px;
          padding: 40px;
          margin: 30px 0;
          border-left: 5px solid #667eea;
        }

        .flow-step {
          display: flex;
          align-items: center;
          margin-bottom: 30px;
          gap: 20px;
        }

        .step-number {
          background: #667eea;
          color: white;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5em;
          font-weight: bold;
          flex-shrink: 0;
        }

        .step-content {
          flex: 1;
        }

        .step-content h4 {
          color: #333;
          font-size: 1.3em;
          margin-bottom: 10px;
        }

        .step-content p {
          color: #666;
          margin: 0;
        }

        .arrow {
          text-align: center;
          color: #667eea;
          font-size: 2em;
          margin: 10px 0;
        }

        .table-container {
          overflow-x: auto;
          margin: 30px 0;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        th {
          background: #667eea;
          color: white;
          padding: 15px;
          text-align: right;
          font-weight: bold;
        }

        td {
          padding: 15px;
          border-bottom: 1px solid #eee;
        }

        tr:hover {
          background: #f8f9fa;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          margin: 30px 0;
        }

        .feature-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 15px;
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
        }

        .feature-card h4 {
          font-size: 1.5em;
          margin-bottom: 15px;
        }

        .feature-card p {
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
        }

        .code-block {
          background: #2d2d2d;
          color: #f8f8f2;
          padding: 20px;
          border-radius: 10px;
          overflow-x: auto;
          margin: 20px 0;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
          line-height: 1.6;
        }

        .webhook-section {
          background: #fff3cd;
          border-left: 5px solid #ffc107;
          padding: 20px;
          border-radius: 10px;
          margin: 30px 0;
        }

        .webhook-section h4 {
          color: #856404;
          margin-bottom: 10px;
        }

        .webhook-section p {
          color: #856404;
          margin: 0;
        }

        .timeline {
          position: relative;
          padding: 20px 0;
        }

        .timeline-item {
          display: flex;
          gap: 30px;
          margin-bottom: 40px;
          position: relative;
        }

        .timeline-item::before {
          content: '';
          position: absolute;
          left: 24px;
          top: 60px;
          width: 2px;
          height: 40px;
          background: #667eea;
        }

        .timeline-item:last-child::before {
          display: none;
        }

        .timeline-dot {
          width: 50px;
          height: 50px;
          background: #667eea;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          flex-shrink: 0;
          font-size: 1.2em;
        }

        .timeline-content {
          flex: 1;
          padding-top: 5px;
        }

        .timeline-content h4 {
          color: #333;
          font-size: 1.3em;
          margin-bottom: 10px;
        }

        .timeline-content p {
          color: #666;
          margin: 5px 0;
        }

        .highlight {
          background: #fff3cd;
          padding: 2px 6px;
          border-radius: 3px;
          font-weight: bold;
        }

        .success-box {
          background: #d4edda;
          border-left: 5px solid #28a745;
          padding: 20px;
          border-radius: 10px;
          margin: 30px 0;
        }

        .success-box h4 {
          color: #155724;
          margin-bottom: 10px;
        }

        .success-box p {
          color: #155724;
          margin: 0;
        }

        .error-box {
          background: #f8d7da;
          border-left: 5px solid #dc3545;
          padding: 20px;
          border-radius: 10px;
          margin: 30px 0;
        }

        .error-box h4 {
          color: #721c24;
          margin-bottom: 10px;
        }

        .error-box p {
          color: #721c24;
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

        @media (max-width: 768px) {
          header h1 {
            font-size: 2em;
          }

          .content {
            padding: 30px 20px;
          }

          .section h2 {
            font-size: 1.8em;
          }

          .flow-step {
            flex-direction: column;
            align-items: flex-start;
          }

          .step-number {
            width: 40px;
            height: 40px;
            font-size: 1.2em;
          }
        }
      `}</style>

      <div className="container">
        <header>
          <h1>🔐 نظام إدارة الاشتراكات</h1>
          <p>التكامل الكامل بين Omar Clinic Pro و Shopify</p>
        </header>

        <div className="content">
          {/* المقدمة */}
          <section className="section">
            <h2>📖 نظرة عامة</h2>
            <p>
              يوفر نظام "Omar Clinic Pro" تكاملاً متقدماً مع Shopify لإدارة الاشتراكات بسهولة وأمان. 
              النظام يدعم ثلاث خطط مختلفة (أساسية، فضية، ذهبية) مع حدود مختلفة للمرضى والمواعيد والأطباء.
            </p>
            <p>
              عند اشتراك المستخدم في Shopify، يتم تفعيل الخطة تلقائياً في لوحة التحكم، 
              وعند إلغاء الاشتراك، يتم تخفيض الخطة إلى الخطة الأساسية تلقائياً.
            </p>
          </section>

          {/* الخطط المتاحة */}
          <section className="section">
            <h2>💎 الخطط المتاحة</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>الخطة</th>
                    <th>السعر الشهري</th>
                    <th>عدد المرضى</th>
                    <th>عدد المواعيد</th>
                    <th>عدد الأطباء</th>
                    <th>الميزات</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>أساسية</strong></td>
                    <td>0 ر.س</td>
                    <td>100</td>
                    <td>20</td>
                    <td>5</td>
                    <td>الميزات الأساسية</td>
                  </tr>
                  <tr>
                    <td><strong>فضية</strong></td>
                    <td>299 ر.س</td>
                    <td>300</td>
                    <td>100</td>
                    <td>20</td>
                    <td>جميع الميزات + التقارير</td>
                  </tr>
                  <tr>
                    <td><strong>ذهبية</strong></td>
                    <td>599 ر.س</td>
                    <td>غير محدود</td>
                    <td>غير محدود</td>
                    <td>غير محدود</td>
                    <td>جميع الميزات + الدعم الأولوي</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* آلية العمل */}
          <section className="section">
            <h2>⚙️ آلية العمل</h2>
            
            <h3>المسار التقني الكامل:</h3>
            
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-dot">1</div>
                <div className="timeline-content">
                  <h4>المستخدم يشتري الخطة من Shopify</h4>
                  <p>المستخدم يدخل إلى متجر Shopify ويختار الخطة المطلوبة ويكمل عملية الدفع.</p>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-dot">2</div>
                <div className="timeline-content">
                  <h4>Shopify يرسل Webhook</h4>
                  <p>عند إتمام الشراء، يرسل Shopify حدث <span className="highlight">order.created</span> إلى خادمنا.</p>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-dot">3</div>
                <div className="timeline-content">
                  <h4>معالجة البيانات</h4>
                  <p>يتم استقبال الـ Webhook ومعالجة البيانات لاستخراج معرف المستخدم والخطة المختارة.</p>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-dot">4</div>
                <div className="timeline-content">
                  <h4>ربط معرف Shopify</h4>
                  <p>يتم ربط معرف الاشتراك من Shopify بحساب المستخدم في قاعدة البيانات.</p>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-dot">5</div>
                <div className="timeline-content">
                  <h4>تحديث الخطة</h4>
                  <p>يتم تحديث خطة المستخدم في قاعدة البيانات إلى الخطة الجديدة.</p>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-dot">6</div>
                <div className="timeline-content">
                  <h4>تفعيل الميزات</h4>
                  <p>يتم تفعيل الميزات والحدود الجديدة فوراً في لوحة التحكم.</p>
                </div>
              </div>
            </div>
          </section>

          {/* الميزات الأمنية */}
          <section className="section">
            <h2>🔒 الميزات الأمنية</h2>
            
            <div className="feature-grid">
              <div className="feature-card">
                <h4>✓ التحقق من التوقيع</h4>
                <p>كل Webhook يتم التحقق منه باستخدام مفتاح Shopify السري.</p>
              </div>

              <div className="feature-card">
                <h4>✓ المصادقة</h4>
                <p>استخدام Clerk للمصادقة الآمنة والموثوقة.</p>
              </div>

              <div className="feature-card">
                <h4>✓ التشفير</h4>
                <p>جميع البيانات الحساسة مشفرة في قاعدة البيانات.</p>
              </div>

              <div className="feature-card">
                <h4>✓ التحقق من الملكية</h4>
                <p>التأكد من أن المستخدم يملك العيادة قبل أي عملية.</p>
              </div>

              <div className="feature-card">
                <h4>✓ السجلات</h4>
                <p>تسجيل جميع العمليات للتدقيق والمراجعة.</p>
              </div>

              <div className="feature-card">
                <h4>✓ معالجة الأخطاء</h4>
                <p>إعادة محاولة تلقائية عند فشل العملية.</p>
              </div>
            </div>
          </section>

          {/* الخلاصة */}
          <section className="section">
            <h2>✨ الخلاصة</h2>
            
            <div className="success-box">
              <h4>نظام متكامل وآمن</h4>
              <p>
                نظام إدارة الاشتراكات في Omar Clinic Pro يوفر تجربة سلسة وآمنة 
                للمستخدمين مع تكامل كامل مع Shopify. 
                جميع العمليات تتم تلقائياً وفوراً دون تدخل يدوي.
              </p>
            </div>

            <h3>المميزات الرئيسية:</h3>
            <ul style={{ marginLeft: '20px', color: '#555', lineHeight: '2' }}>
              <li>✅ تكامل كامل مع Shopify</li>
              <li>✅ ثلاث خطط مختلفة مع حدود مختلفة</li>
              <li>✅ تحديث تلقائي فوري للخطط</li>
              <li>✅ نظام أمني قوي مع التحقق من الـ Webhooks</li>
              <li>✅ إدارة سهلة من لوحة التحكم</li>
              <li>✅ سجل فواتير شامل</li>
              <li>✅ دعم الترقية والتخفيض</li>
              <li>✅ معالجة الأخطاء والإعادة التلقائية</li>
            </ul>
          </section>
        </div>

        <footer>
          <p>© 2026 Omar Clinic Pro - نظام إدارة العيادات المتقدم</p>
          <p style={{ marginTop: '10px', fontSize: '0.9em' }}>تم إنشاؤه بواسطة Manus AI</p>
        </footer>
      </div>
    </div>
  );
}
