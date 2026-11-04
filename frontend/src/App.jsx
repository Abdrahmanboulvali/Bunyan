import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api/';

function App() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [materials, setMaterials] = useState([]);

  // حالات نموذج طلب مادة جديد
  const [materialId, setMaterialId] = useState('');
  const [quantity, setQuantity] = useState('');

  // حالات نافذة إضافة مشروع جديد
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectLocation, setNewProjectLocation] = useState('');
  const [newProjectBudget, setNewProjectBudget] = useState('');

  // حالات نافذة إضافة مادة جديدة
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [newMaterialName, setNewMaterialName] = useState('');
  const [newMaterialUnit, setNewMaterialUnit] = useState('');
  const [newMaterialPrice, setNewMaterialPrice] = useState('');

  useEffect(() => {
    fetchProjects();
    fetchMaterials();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API_BASE}projects/`);
      setProjects(res.data);
      if (res.data.length > 0) {
        // الحفاظ على المشروع المحدد إن وُجد، أو اختيار الأول
        setSelectedProject(prev => prev ? res.data.find(p => p.id === prev.id) || res.data[0] : res.data[0]);
      } else {
        setSelectedProject(null);
      }
    } catch (err) {
      console.error("Error fetching projects", err);
    }
  };

  const fetchMaterials = async () => {
    try {
      const res = await axios.get(`${API_BASE}materials/`);
      setMaterials(res.data);
    } catch (err) {
      console.error("Error fetching materials", err);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}projects/`, {
        project_name: newProjectName,
        location: newProjectLocation,
        budget: newProjectBudget
      });
      setProjects([res.data, ...projects]);
      setSelectedProject(res.data);
      setNewProjectName('');
      setNewProjectLocation('');
      setNewProjectBudget('');
      setShowAddProjectModal(false);
      alert('تم إنشاء المشروع بنجاح!');
    } catch (err) {
      console.error("Error creating project", err);
    }
  };

  // --- دالة حذف مشروع ---
  const handleDeleteProject = async (projectId, e) => {
    e.stopPropagation(); // منع تحديد المشروع عند الضغط على زر الحذف
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا المشروع نهائياً؟')) return;

    try {
      await axios.delete(`${API_BASE}projects/${projectId}/`);
      setProjects(projects.filter(p => p.id !== projectId));
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
      }
      alert('تم حذف المشروع بنجاح.');
    } catch (err) {
      console.error("Error deleting project", err);
      alert('حدث خطأ أثناء محاولة الحذف.');
    }
  };

  const handleCreateMaterial = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}materials/`, {
        name: newMaterialName,
        unit: newMaterialUnit,
        unit_price: newMaterialPrice || 0
      });
      setMaterials([...materials, res.data]);
      setNewMaterialName('');
      setNewMaterialUnit('');
      setNewMaterialPrice('');
      setShowAddMaterialModal(false);
      alert('تم إضافة المادة بنجاح!');
    } catch (err) {
      console.error("Error creating material", err);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!selectedProject || !materialId || !quantity) return;

    try {
      await axios.post(`${API_BASE}requests/`, {
        project: selectedProject.id,
        material: materialId,
        quantity: quantity,
        status: 'PENDING'
      });
      setQuantity('');
      setMaterialId('');

      const res = await axios.get(`${API_BASE}projects/${selectedProject.id}/`);
      setSelectedProject(res.data);
      alert('تم إرسال طلب المادة بنجاح وهو قيد الانتظار حالياً!');
    } catch (err) {
      console.error("Error creating request", err);
    }
  };

  const handleMarkAsDelivered = async (requestId) => {
    try {
      await axios.patch(`${API_BASE}requests/${requestId}/`, {
        status: 'DELIVERED'
      });

      const res = await axios.get(`${API_BASE}projects/${selectedProject.id}/`);
      setSelectedProject(res.data);
      alert('تم تأكيد وصول المادة لمكان البناء وتم تسجيلها في المستهلكات تلقائياً!');
    } catch (err) {
      console.error("Error updating request status", err);
    }
  };

  // --- دالة حذف طلب مادة ---
  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا الطلب؟')) return;

    try {
      await axios.delete(`${API_BASE}requests/${requestId}/`);

      // تحديث بيانات المشروع المعروض لتحديث الجداول
      const res = await axios.get(`${API_BASE}projects/${selectedProject.id}/`);
      setSelectedProject(res.data);
      alert('تم حذف الطلب بنجاح.');
    } catch (err) {
      console.error("Error deleting request", err);
      alert('حدث خطأ أثناء حذف الطلب.');
    }
  };

  // --- حسابات الإحصائيات المالية للأوقية الجديدة ---
  const calculateFinancials = () => {
    if (!selectedProject || !selectedProject.requests) {
      return { totalRequestedCost: 0, totalDeliveredCost: 0, remainingBudget: selectedProject?.budget || 0 };
    }

    let totalRequestedCost = 0;
    let totalDeliveredCost = 0;

    selectedProject.requests.forEach(req => {
      const mat = materials.find(m => m.id === req.material);
      const price = mat ? parseFloat(mat.unit_price) : (parseFloat(req.material_price) || 0);
      const cost = parseFloat(req.quantity) * price;

      totalRequestedCost += cost;

      if (req.status === 'DELIVERED') {
        totalDeliveredCost += cost;
      }
    });

    const budget = parseFloat(selectedProject.budget) || 0;
    const remainingBudget = budget - totalRequestedCost;

    return { totalRequestedCost, totalDeliveredCost, remainingBudget };
  };

  const financials = calculateFinancials();

  return (
    <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', direction: 'rtl', backgroundColor: '#f8fafc', minHeight: '100vh', color: '#1e293b' }}>

      {/* رأس الصفحة */}
      <header style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', color: 'white', padding: '25px 20px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700' }}>نظام إدارة ومراقبة المقاولات (بنيان)</h1>
        <p style={{ margin: 0, fontSize: '15px', opacity: 0.9 }}>لوحة التحكم الذكية - إدارة المشاريع، طلبات المواد، والمتابعة المالية بالأوقية الجديدة</p>
      </header>

      <div style={{ maxWidth: '1400px', margin: '30px auto', padding: '0 20px' }}>

        {/* شريط الأزرار العلوي */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginBottom: '25px' }}>
          <button
            onClick={() => setShowAddProjectModal(true)}
            style={{ padding: '12px 24px', background: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
          >
            + إضافة مشروع جديد
          </button>
          <button
            onClick={() => setShowAddMaterialModal(true)}
            style={{ padding: '12px 24px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
          >
            + إضافة مادة جديدة
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '25px', alignItems: 'start' }}>

          {/* قائمة المشاريع الجانبية */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginTop: 0, fontSize: '18px', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', color: '#0f172a' }}>
              المشاريع المسجلة ({projects.length})
            </h2>

            {projects.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '30px 0', fontSize: '14px' }}>
                لا توجد مشاريع مسجلة حالياً.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                {projects.map(proj => (
                  <div
                    key={proj.id}
                    onClick={() => setSelectedProject(proj)}
                    style={{
                      padding: '15px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: selectedProject?.id === proj.id ? '#eff6ff' : '#f8fafc',
                      border: selectedProject?.id === proj.id ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                      transition: 'all 0.2s',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#1e293b' }}>{proj.project_name}</h3>
                      <button
                        onClick={(e) => handleDeleteProject(proj.id, e)}
                        title="حذف المشروع"
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px', padding: '0' }}
                      >
                        🗑️
                      </button>
                    </div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748b' }}>📍 الموقع: {proj.location}</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#059669', fontWeight: '600' }}>💰 الميزانية: {proj.budget} أوقية</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* تفاصيل المشروع والمؤشرات المالية للأوقية */}
          <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)' }}>
            {selectedProject ? (
              <div>
                <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', marginBottom: '20px' }}>
                  <h2 style={{ margin: '0 0 10px 0', color: '#1e3a8a', fontSize: '22px' }}>
                    {selectedProject.project_name}
                  </h2>
                  <div style={{ display: 'flex', gap: '20px', color: '#64748b', fontSize: '14px' }}>
                    <span>📍 <strong>الموقع:</strong> {selectedProject.location}</span>
                  </div>
                </div>

                {/* --- لوحة الملخص المالي بالأوقية الجديدة --- */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '25px' }}>
                  <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 5px 0', color: '#64748b', fontSize: '13px' }}>الميزانية الكلية</p>
                    <h3 style={{ margin: 0, color: '#1e3a8a', fontSize: '18px' }}>{selectedProject.budget} أوقية</h3>
                  </div>
                  <div style={{ background: '#eff6ff', padding: '15px', borderRadius: '10px', border: '1px solid #bfdbfe', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 5px 0', color: '#1e40af', fontSize: '13px' }}>ما تم استعماله (مشتريات)</p>
                    <h3 style={{ margin: 0, color: '#2563eb', fontSize: '18px' }}>{financials.totalRequestedCost.toFixed(2)} أوقية</h3>
                  </div>
                  <div style={{ background: financials.remainingBudget >= 0 ? '#f0fdf4' : '#fef2f2', padding: '15px', borderRadius: '10px', border: '1px solid ' + (financials.remainingBudget >= 0 ? '#bbf7d0' : '#fecaca'), textAlign: 'center' }}>
                    <p style={{ margin: '0 0 5px 0', color: financials.remainingBudget >= 0 ? '#166534' : '#991b1b', fontSize: '13px' }}>المتبقي من الميزانية</p>
                    <h3 style={{ margin: 0, color: financials.remainingBudget >= 0 ? '#15803d' : '#dc2626', fontSize: '18px' }}>{financials.remainingBudget.toFixed(2)} أوقية</h3>
                  </div>
                </div>

                {/* مؤشر قيمة المواد المستلمة فعلياً بالأوقية */}
                <div style={{ background: '#f1f5f9', padding: '12px 18px', borderRadius: '8px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                  <span>📦 <strong>إجمالي قيمة المواد المستلمة فعلياً في الموقع (Delivered):</strong></span>
                  <span style={{ color: '#059669', fontWeight: 'bold', fontSize: '16px' }}>{financials.totalDeliveredCost.toFixed(2)} أوقية</span>
                </div>

                {/* نموذج طلب مادة جديدة */}
                <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '10px', marginBottom: '25px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#334155' }}>📦 طلب مادة جديدة للمشروع</h3>
                  <form onSubmit={handleCreateRequest} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <select
                      value={materialId}
                      onChange={(e) => setMaterialId(e.target.value)}
                      required
                      style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', flex: 1, fontSize: '14px', backgroundColor: 'white' }}
                    >
                      <option value="">اختر المادة المطلوبة...</option>
                      {materials.map(mat => (
                        <option key={mat.id} value={mat.id}>{mat.name} ({mat.unit}) - {mat.unit_price} أوقية</option>
                      ))}
                    </select>

                    <input
                      type="number"
                      placeholder="الكمية"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                      style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '110px', fontSize: '14px', backgroundColor: 'white' }}
                    />

                    <button type="submit" style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                      إرسال الطلب
                    </button>
                  </form>
                </div>

                {/* جدول طلبات المواد والمشتريات */}
                <div style={{ marginBottom: '30px' }}>
                  <h3 style={{ fontSize: '16px', color: '#334155', marginBottom: '12px' }}>📋 جدول المواد المشتراة والطلبات</h3>
                  {selectedProject.requests && selectedProject.requests.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '14px' }}>
                        <thead>
                          <tr style={{ background: '#f1f5f9', color: '#475569' }}>
                            <th style={{ padding: '12px' }}>المادة</th>
                            <th style={{ padding: '12px' }}>الكمية</th>
                            <th style={{ padding: '12px' }}>التكلفة الإجمالية</th>
                            <th style={{ padding: '12px' }}>الحالة والإجراء</th>
                            <th style={{ padding: '12px' }}>حذف</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedProject.requests.map(req => {
                            const mat = materials.find(m => m.id === req.material);
                            const price = mat ? parseFloat(mat.unit_price) : 0;
                            const totalCost = parseFloat(req.quantity) * price;

                            return (
                              <tr key={req.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '12px', fontWeight: '500' }}>{req.material_name}</td>
                                <td style={{ padding: '12px' }}>{req.quantity} {req.material_unit}</td>
                                <td style={{ padding: '12px', color: '#2563eb', fontWeight: '600' }}>{totalCost.toFixed(2)} أوقية</td>
                                <td style={{ padding: '12px' }}>
                                  {req.status === 'PENDING' ? (
                                    <button
                                      onClick={() => handleMarkAsDelivered(req.id)}
                                      style={{ padding: '6px 14px', background: '#059669', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                                    >
                                      تأكيد وصوله للموقع ✅
                                    </button>
                                  ) : (
                                    <span style={{ padding: '5px 10px', borderRadius: '6px', fontSize: '12px', backgroundColor: '#dcfce7', color: '#166534', fontWeight: '600' }}>
                                      تم التسليم ✅
                                    </span>
                                  )}
                                </td>
                                <td style={{ padding: '12px' }}>
                                  <button
                                    onClick={() => handleDeleteRequest(req.id)}
                                    title="حذف الطلب"
                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px' }}
                                  >
                                    🗑️
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p style={{ color: '#64748b', fontSize: '14px', fontStyle: 'italic' }}>لا توجد طلبات مواد لهذا المشروع حتى الآن.</p>
                  )}
                </div>

                {/* سجل الاستهلاك الفعلي */}
                <div>
                  <h3 style={{ fontSize: '16px', color: '#334155', marginBottom: '12px' }}>⚙️ سجل الاستهلاك الفعلي في الموقع</h3>
                  {selectedProject.consumptions && selectedProject.consumptions.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '14px' }}>
                        <thead>
                          <tr style={{ background: '#ecfdf5', color: '#065f46' }}>
                            <th style={{ padding: '12px' }}>المادة</th>
                            <th style={{ padding: '12px' }}>الكمية المستهلكة</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedProject.consumptions.map(cons => (
                            <tr key={cons.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '12px', fontWeight: '500' }}>{cons.material_name}</td>
                              <td style={{ padding: '12px', color: '#059669', fontWeight: '600' }}>{cons.quantity_consumed}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p style={{ color: '#64748b', fontSize: '14px', fontStyle: 'italic' }}>لم يتم تسليم أي مواد بعد لتسجيلها كمستهلكات في الموقع.</p>
                  )}
                </div>

              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
                <p style={{ fontSize: '16px' }}>الرجاء اختيار مشروع من القائمة الجانبية لعرض تفاصيله وإدارته.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* نافذة إضافة مشروع جديد */}
      {showAddProjectModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '420px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginTop: 0, color: '#1e3a8a', fontSize: '20px', marginBottom: '20px' }}>إضافة مشروع جديد</h2>
            <form onSubmit={handleCreateProject}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>اسم المشروع:</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>الموقع:</label>
                <input
                  type="text"
                  value={newProjectLocation}
                  onChange={(e) => setNewProjectLocation(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px' }}
                />
              </div>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>الميزانية (أوقية):</label>
                <input
                  type="number"
                  step="0.01"
                  value={newProjectBudget}
                  onChange={(e) => setNewProjectBudget(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(false)}
                  style={{ padding: '10px 20px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', background: '#059669', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  حفظ المشروع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة إضافة مادة جديدة */}
      {showAddMaterialModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '420px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginTop: 0, color: '#1e3a8a', fontSize: '20px', marginBottom: '20px' }}>إضافة مادة جديدة للمخزن</h2>
            <form onSubmit={handleCreateMaterial}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>اسم المادة:</label>
                <input
                  type="text"
                  value={newMaterialName}
                  onChange={(e) => setNewMaterialName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>وحدة القياس (طن، كيس...):</label>
                <input
                  type="text"
                  value={newMaterialUnit}
                  onChange={(e) => setNewMaterialUnit(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px' }}
                />
              </div>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>سعر الوحدة (بالأوقية):</label>
                <input
                  type="number"
                  step="0.01"
                  value={newMaterialPrice}
                  onChange={(e) => setNewMaterialPrice(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddMaterialModal(false)}
                  style={{ padding: '10px 20px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  حفظ المادة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;