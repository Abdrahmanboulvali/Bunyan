import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api/';

function App() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [materials, setMaterials] = useState([]);

  const [materialId, setMaterialId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [requestDate, setRequestDate] = useState(getFormattedDateTime());

  const [showEditRequestModal, setShowEditRequestModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [editMaterialId, setEditMaterialId] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editRequestDate, setEditRequestDate] = useState('');

  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectLocation, setNewProjectLocation] = useState('');
  const [newProjectBudget, setNewProjectBudget] = useState('');

  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [newMaterialName, setNewMaterialName] = useState('');
  const [newMaterialUnit, setNewMaterialUnit] = useState('');
  const [newMaterialPrice, setNewMaterialPrice] = useState('');

  const [filterPeriod, setFilterPeriod] = useState('all');
  const [customDate, setCustomDate] = useState('');
  const [customMonth, setCustomMonth] = useState('');

  function getFormattedDateTime(dateString = null) {
    const now = dateString ? new Date(dateString) : new Date();
    if (isNaN(now.getTime())) return '';
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  useEffect(() => {
    fetchProjects();
    fetchMaterials();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API_BASE}projects/`);
      setProjects(res.data);
      if (res.data.length > 0) {
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

  const handleSaveProject = async (e) => {
    e.preventDefault();
    try {
      if (editingProjectId) {
        const res = await axios.put(`${API_BASE}projects/${editingProjectId}/`, {
          project_name: newProjectName,
          location: newProjectLocation,
          budget: newProjectBudget
        });
        setProjects(projects.map(p => p.id === editingProjectId ? res.data : p));
        if (selectedProject?.id === editingProjectId) setSelectedProject(res.data);
        alert('تم تعديل المشروع بنجاح!');
      } else {
        const res = await axios.post(`${API_BASE}projects/`, {
          project_name: newProjectName,
          location: newProjectLocation,
          budget: newProjectBudget
        });
        setProjects([res.data, ...projects]);
        setSelectedProject(res.data);
        alert('تم إنشاء المشروع بنجاح!');
      }
      closeProjectModal();
    } catch (err) {
      console.error("Error saving project", err);
    }
  };

  const openAddProjectModal = () => {
    setEditingProjectId(null);
    setNewProjectName('');
    setNewProjectLocation('');
    setNewProjectBudget('');
    setShowAddProjectModal(true);
  };

  const openEditProjectModal = (proj, e) => {
    e.stopPropagation();
    setEditingProjectId(proj.id);
    setNewProjectName(proj.project_name);
    setNewProjectLocation(proj.location);
    setNewProjectBudget(proj.budget);
    setShowAddProjectModal(true);
  };

  const closeProjectModal = () => {
    setShowAddProjectModal(false);
    setEditingProjectId(null);
  };

  const handleDeleteProject = async (projectId, e) => {
    e.stopPropagation();
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا المشروع نهائياً؟')) return;

    try {
      await axios.delete(`${API_BASE}projects/${projectId}/`);
      setProjects(projects.filter(p => p.id !== projectId));
      if (selectedProject?.id === projectId) setSelectedProject(null);
      alert('تم حذف المشروع بنجاح.');
    } catch (err) {
      console.error("Error deleting project", err);
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
      // إرسال التاريخ والوقت كـ String مباشر لتفادي مشاكل التحويل الزمني للمتصفح
      await axios.post(`${API_BASE}requests/`, {
        project: selectedProject.id,
        material: materialId,
        quantity: quantity,
        status: 'PENDING',
        created_at: requestDate ? requestDate.replace('T', ' ') + ':00' : null
      });
      setQuantity('');
      setMaterialId('');
      setRequestDate(getFormattedDateTime());

      const res = await axios.get(`${API_BASE}projects/${selectedProject.id}/`);
      setSelectedProject(res.data);
      alert('تم إرسال طلب المادة بنجاح!');
    } catch (err) {
      console.error("Error creating request", err);
    }
  };

  const openEditRequestModal = (req) => {
    setEditingRequest(req);
    setEditMaterialId(req.material);
    setEditQuantity(req.quantity);

    let formattedDate = getFormattedDateTime();
    if (req.created_at) {
      // استخراج تاريخ ووقت الطلب الحالي بدقة لتعبئة الحقل
      const cleanDate = req.created_at.replace('Z', '').replace('T', ' ');
      const parts = cleanDate.split(' ');
      if (parts.length >= 2) {
        formattedDate = `${parts[0]}T${parts[1].substring(0, 5)}`;
      }
    }
    setEditRequestDate(formattedDate);
    setShowEditRequestModal(true);
  };

  const handleUpdateRequestedItem = async (e) => {
    e.preventDefault();
    if (!editingRequest) return;

    try {
      // إرسال التاريخ المعدل بشكل نصي دقيق يتطابق تماماً مع ما اخترته في الحقل
      const formattedForBackend = editRequestDate ? editRequestDate.replace('T', ' ') + ':00' : null;

      await axios.patch(`${API_BASE}requests/${editingRequest.id}/`, {
        material: editMaterialId,
        quantity: editQuantity,
        created_at: formattedForBackend
      });

      setShowEditRequestModal(false);
      setEditingRequest(null);

      const res = await axios.get(`${API_BASE}projects/${selectedProject.id}/`);
      setSelectedProject(res.data);
      alert('تم تحديث الطلب بنجاح!');
    } catch (err) {
      console.error("Error updating request", err);
      alert('حدث خطأ أثناء محاولة تعديل الطلب.');
    }
  };

  const handleMarkAsDelivered = async (requestId) => {
    try {
      await axios.patch(`${API_BASE}requests/${requestId}/`, {
        status: 'DELIVERED'
      });

      const res = await axios.get(`${API_BASE}projects/${selectedProject.id}/`);
      setSelectedProject(res.data);
      alert('تم تأكيد وصول المادة لمكان البناء!');
    } catch (err) {
      console.error("Error updating request status", err);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا الطلب؟')) return;

    try {
      await axios.delete(`${API_BASE}requests/${requestId}/`);
      const res = await axios.get(`${API_BASE}projects/${selectedProject.id}/`);
      setSelectedProject(res.data);
      alert('تم حذف الطلب بنجاح.');
    } catch (err) {
      console.error("Error deleting request", err);
    }
  };

  const getFilteredRequests = () => {
    if (!selectedProject || !selectedProject.requests) return [];

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    return selectedProject.requests.filter(req => {
      if (!req.created_at) return filterPeriod === 'all';
      const reqDatePart = req.created_at.split('T')[0];

      if (filterPeriod === 'today') return reqDatePart === todayStr;
      if (filterPeriod === 'yesterday') return reqDatePart === yesterdayStr;
      if (filterPeriod === 'customDate' && customDate) return reqDatePart === customDate;
      if (filterPeriod === 'customMonth' && customMonth) return reqDatePart.startsWith(customMonth);
      return true;
    });
  };

  const filteredRequests = getFilteredRequests();

  const exportToExcel = () => {
    if (!selectedProject || filteredRequests.length === 0) {
      alert('لا توجد بيانات للتصدير بناءً على الفلتر الحالي.');
      return;
    }

    let csvContent = "\uFEFFاسم المادة,الكمية,الوحدة,التكلفة الإجمالية (أوقية),التاريخ والوقت,الحالة\n";

    filteredRequests.forEach(req => {
      const mat = materials.find(m => m.id === req.material);
      const price = mat ? parseFloat(mat.unit_price) : 0;
      const totalCost = (parseFloat(req.quantity) * price).toFixed(2);
      const statusText = req.status === 'DELIVERED' ? 'تم التسليم' : 'قيد الانتظار';
      const dateStr = req.created_at ? new Date(req.created_at).toLocaleString() : '';

      csvContent += `"${req.material_name}","${req.quantity}","${req.material_unit || ''}","${totalCost}","${dateStr}","${statusText}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `تقرير_مشروع_${selectedProject.project_name}_${filterPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- دالة الفاتورة بتنسيق مرتب وخالٍ من أي تداخل ---
  const generatePDFInvoice = () => {
    if (!selectedProject) return;

    let rowsHTML = '';
    let grandTotal = 0;

    filteredRequests.forEach((req, index) => {
      const mat = materials.find(m => m.id === req.material);
      const price = mat ? parseFloat(mat.unit_price) : 0;
      const totalCost = parseFloat(req.quantity) * price;
      grandTotal += totalCost;
      const dateStr = req.created_at ? new Date(req.created_at).toLocaleString() : '-';
      const statusBadge = req.status === 'DELIVERED'
        ? '<span style="background: #dcfce7; color: #166534; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; white-space: nowrap; display: inline-block;">تم التسليم</span>'
        : '<span style="background: #fef9c3; color: #854d0e; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; white-space: nowrap; display: inline-block;">قيد الانتظار</span>';

      const rowBg = index % 2 === 0 ? '#ffffff' : '#f8fafc';

      rowsHTML += `
        <tr style="background-color: ${rowBg};">
          <td style="padding: 10px 6px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #64748b; font-weight: 500; font-size: 13px;">${index + 1}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #1e293b; font-size: 13px;">${req.material_name}</td>
          <td style="padding: 10px 6px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #334155; white-space: nowrap; font-size: 13px;">${req.quantity} ${req.material_unit || ''}</td>
          <td style="padding: 10px 6px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #475569; white-space: nowrap; font-size: 13px;">${price.toLocaleString()} أوقية</td>
          <td style="padding: 10px 6px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #1d4ed8; font-weight: 700; white-space: nowrap; font-size: 13px;">${totalCost.toLocaleString()} أوقية</td>
          <td style="padding: 10px 6px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b; white-space: nowrap;">${dateStr}</td>
          <td style="padding: 10px 6px; border-bottom: 1px solid #e2e8f0; text-align: center;">${statusBadge}</td>
        </tr>
      `;
    });

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title>فاتورة مشتريات - ${selectedProject.project_name}</title>
          <style>
            @page { size: A4; margin: 10mm; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #ffffff; color: #1e293b; margin: 0; padding: 10px; direction: rtl; }
            .invoice-container { background: #ffffff; max-width: 100%; margin: auto; padding: 20px; }
            
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1e3a8a; padding-bottom: 15px; margin-bottom: 20px; }
            .brand h1 { margin: 0 0 3px 0; color: #1e3a8a; font-size: 20px; font-weight: 800; }
            .brand p { margin: 0; color: #64748b; font-size: 12px; }
            
            .invoice-meta { text-align: left; }
            .invoice-meta h2 { margin: 0 0 3px 0; color: #0f172a; font-size: 18px; text-transform: uppercase; }
            .invoice-meta p { margin: 1px 0; color: #64748b; font-size: 12px; }

            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 20px; }
            .details-box h3 { margin: 0 0 6px 0; font-size: 13px; color: #1e3a8a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
            .details-box p { margin: 4px 0; font-size: 13px; color: #334155; }
            .details-box strong { color: #0f172a; }

            table { width: 100%; border-collapse: collapse; margin-top: 5px; margin-bottom: 15px; table-layout: fixed; }
            th { background: #1e3a8a; color: white; padding: 10px 6px; font-size: 12px; text-align: center; font-weight: 600; border: 1px solid #1e3a8a; white-space: nowrap; }
            
            .summary-card { margin-top: 15px; background: #eff6ff; border: 1px solid #bfdbfe; padding: 12px 15px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; }
            .summary-title { font-size: 14px; color: #1e40af; font-weight: 600; }
            .summary-value { font-size: 18px; color: #1d4ed8; font-weight: 800; white-space: nowrap; }

            .footer { margin-top: 25px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            
            <div class="header">
              <div class="brand">
                <h1>نظام بنيان للمقاولات</h1>
                <p>إدارة المشاريع والمتابعة المالية واللوجستية</p>
              </div>
              <div class="invoice-meta">
                <h2>فاتورة مشتريات</h2>
                <p><strong>تاريخ الإصدار:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>الوقت:</strong> ${new Date().toLocaleTimeString()}</p>
              </div>
            </div>

            <div class="details-grid">
              <div class="details-box">
                <h3>معلومات المشروع</h3>
                <p><strong>اسم المشروع:</strong> ${selectedProject.project_name}</p>
                <p><strong>الموقع / محل البناء:</strong> ${selectedProject.location}</p>
              </div>
              <div class="details-box" style="text-align: left;">
                <h3>الوضع المالي</h3>
                <p><strong>الميزانية الإجمالية:</strong> ${parseFloat(selectedProject.budget).toLocaleString()} أوقية</p>
                <p><strong>حالة المستند:</strong> معتمد وموثق</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="width: 6%;">#</th>
                  <th style="width: 26%;">اسم المادة</th>
                  <th style="width: 15%;">الكمية</th>
                  <th style="width: 16%;">سعر الوحدة</th>
                  <th style="width: 17%;">الإجمالي</th>
                  <th style="width: 14%;">التاريخ والوقت</th>
                  <th style="width: 12%;">الحالة</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHTML}
              </tbody>
            </table>

            <div class="summary-card">
              <span class="summary-title">الإجمالي العام لتكاليف المشتريات المعروضة:</span>
              <span class="summary-value">${grandTotal.toLocaleString()} أوقية</span>
            </div>

            <div class="footer">
              تم استخراج هذه الفاتورة آلياً عبر نظام "بنيان" لإدارة المقاولات والمشتريات. جميع الحقوق محفوظة © 2026.
            </div>

          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

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

      <header style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', color: 'white', padding: '25px 20px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700' }}>نظام إدارة ومراقبة المقاولات (بنيان)</h1>
        <p style={{ margin: 0, fontSize: '15px', opacity: 0.9 }}>لوحة التحكم الذكية - إدارة المشاريع، طلبات المواد، والمتابعة المالية بالأوقية الجديدة</p>
      </header>

      <div style={{ maxWidth: '1400px', margin: '30px auto', padding: '0 20px' }}>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginBottom: '25px' }}>
          <button
            onClick={openAddProjectModal}
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

          {/* القائمة الجانبية للمشاريع */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginTop: 0, fontSize: '18px', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', color: '#0f172a' }}>
              المشاريع المسجلة ({projects.length})
            </h2>

            {projects.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '30px 0', fontSize: '14px' }}>لا توجد مشاريع مسجلة حالياً.</p>
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
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#1e293b' }}>{proj.project_name}</h3>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={(e) => openEditProjectModal(proj, e)}
                          title="تعديل المشروع"
                          style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '14px', padding: 0 }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => handleDeleteProject(proj.id, e)}
                          title="حذف المشروع"
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px', padding: 0 }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748b' }}>📍 الموقع: {proj.location}</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#059669', fontWeight: '600' }}>💰 الميزانية: {proj.budget} أوقية</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* تفاصيل المشروع */}
          <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)' }}>
            {selectedProject ? (
              <div>
                <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h2 style={{ margin: '0 0 6px 0', color: '#1e3a8a', fontSize: '22px' }}>{selectedProject.project_name}</h2>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>📍 <strong>الموقع:</strong> {selectedProject.location}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={exportToExcel}
                      style={{ padding: '8px 14px', background: '#107c41', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      📊 تصدير Excel
                    </button>
                    <button
                      onClick={generatePDFInvoice}
                      style={{ padding: '8px 14px', background: '#b91c1c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      📄 تحميل كفاتورة PDF
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
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

                <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '10px', marginBottom: '25px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#334155' }}>📦 طلب مادة جديدة للمشروع</h3>
                  <form onSubmit={handleCreateRequest} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <select
                      value={materialId}
                      onChange={(e) => setMaterialId(e.target.value)}
                      required
                      style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', flex: 2, fontSize: '14px', backgroundColor: 'white' }}
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
                      style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '90px', fontSize: '14px', backgroundColor: 'white' }}
                    />

                    <input
                      type="datetime-local"
                      value={requestDate}
                      onChange={(e) => setRequestDate(e.target.value)}
                      required
                      style={{ padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: 'white' }}
                    />

                    <button type="submit" style={{ padding: '10px 18px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                      إرسال الطلب
                    </button>
                  </form>
                </div>

                <div style={{ background: '#eff6ff', padding: '15px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #bfdbfe', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontWeight: '600', fontSize: '14px', color: '#1e40af' }}>🔍 تصفية سجل الطلبات للتقرير:</span>

                  <select
                    value={filterPeriod}
                    onChange={(e) => setFilterPeriod(e.target.value)}
                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid #93c5fd', fontSize: '13px', backgroundColor: 'white' }}
                  >
                    <option value="all">عرض الجميع (كل الفترات)</option>
                    <option value="today">اليوم فقط</option>
                    <option value="yesterday">أمس فقط</option>
                    <option value="customDate">يوم معين</option>
                    <option value="customMonth">شهر معين</option>
                  </select>

                  {filterPeriod === 'customDate' && (
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      style={{ padding: '7px', borderRadius: '6px', border: '1px solid #93c5fd', fontSize: '13px', backgroundColor: 'white' }}
                    />
                  )}

                  {filterPeriod === 'customMonth' && (
                    <input
                      type="month"
                      value={customMonth}
                      onChange={(e) => setCustomMonth(e.target.value)}
                      style={{ padding: '7px', borderRadius: '6px', border: '1px solid #93c5fd', fontSize: '13px', backgroundColor: 'white' }}
                    />
                  )}
                </div>

                <div style={{ marginBottom: '30px' }}>
                  <h3 style={{ fontSize: '16px', color: '#334155', marginBottom: '12px' }}>📋 جدول المواد والطلبات بتواريخها</h3>
                  {filteredRequests.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '14px' }}>
                        <thead>
                          <tr style={{ background: '#f1f5f9', color: '#475569' }}>
                            <th style={{ padding: '12px' }}>المادة</th>
                            <th style={{ padding: '12px' }}>الكمية</th>
                            <th style={{ padding: '12px' }}>التكلفة الإجمالية</th>
                            <th style={{ padding: '12px' }}>التاريخ والوقت</th>
                            <th style={{ padding: '12px' }}>الحالة</th>
                            <th style={{ padding: '12px' }}>إدارة</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRequests.map(req => {
                            const mat = materials.find(m => m.id === req.material);
                            const price = mat ? parseFloat(mat.unit_price) : 0;
                            const totalCost = parseFloat(req.quantity) * price;

                            return (
                              <tr key={req.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '12px', fontWeight: '500' }}>{req.material_name}</td>
                                <td style={{ padding: '12px' }}>{req.quantity} {req.material_unit}</td>
                                <td style={{ padding: '12px', color: '#2563eb', fontWeight: '600' }}>{totalCost.toFixed(2)} أوقية</td>
                                <td style={{ padding: '12px', fontSize: '13px', color: '#64748b' }}>{req.created_at ? new Date(req.created_at).toLocaleString() : 'غير متوفر'}</td>
                                <td style={{ padding: '12px' }}>
                                  {req.status === 'PENDING' ? (
                                    <button
                                      onClick={() => handleMarkAsDelivered(req.id)}
                                      style={{ padding: '6px 14px', background: '#059669', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                                    >
                                      تأكيد الوصول ✅
                                    </button>
                                  ) : (
                                    <span style={{ padding: '5px 10px', borderRadius: '6px', fontSize: '12px', backgroundColor: '#dcfce7', color: '#166534', fontWeight: '600' }}>
                                      تم التسليم ✅
                                    </span>
                                  )}
                                </td>
                                <td style={{ padding: '12px' }}>
                                  <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                      onClick={() => openEditRequestModal(req)}
                                      title="تعديل الطلب"
                                      style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '16px' }}
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={() => handleDeleteRequest(req.id)}
                                      title="حذف الطلب"
                                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px' }}
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p style={{ color: '#64748b', fontSize: '14px', fontStyle: 'italic' }}>لا توجد طلبات مواد مطابقة لخيارات التصفية المحددة.</p>
                  )}
                </div>

              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
                <p style={{ fontSize: '16px' }}>الرجاء اختيار مشروع من القائمة الجانبية لعرض تفاصيله.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {showEditRequestModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '420px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginTop: 0, color: '#1e3a8a', fontSize: '20px', marginBottom: '20px' }}>تعديل طلب المادة</h2>
            <form onSubmit={handleUpdateRequestedItem}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>المادة:</label>
                <select
                  value={editMaterialId}
                  onChange={(e) => setEditMaterialId(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: 'white' }}
                >
                  <option value="">اختر المادة...</option>
                  {materials.map(mat => (
                    <option key={mat.id} value={mat.id}>{mat.name} ({mat.unit}) - {mat.unit_price} أوقية</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>الكمية:</label>
                <input
                  type="number"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px' }}
                />
              </div>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>التاريخ والوقت:</label>
                <input
                  type="datetime-local"
                  value={editRequestDate}
                  onChange={(e) => setEditRequestDate(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowEditRequestModal(false)}
                  style={{ padding: '10px 20px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddProjectModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '420px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginTop: 0, color: '#1e3a8a', fontSize: '20px', marginBottom: '20px' }}>
              {editingProjectId ? 'تعديل بيانات المشروع' : 'إضافة مشروع جديد'}
            </h2>
            <form onSubmit={handleSaveProject}>
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
                  onClick={closeProjectModal}
                  style={{ padding: '10px 20px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', background: '#059669', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  {editingProjectId ? 'تحديث البيانات' : 'حفظ المشروع'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>وحدة القياس:</label>
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