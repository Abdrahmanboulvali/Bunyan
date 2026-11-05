import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api/';

function App() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null); // null تعني عرض الكل
  const [materials, setMaterials] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [projectRequests, setProjectRequests] = useState([]);
  const [laborExpenses, setLaborExpenses] = useState([]);

  const [materialId, setMaterialId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [requestDate, setRequestDate] = useState(getFormattedDateTime());

  // حالات العمال داخل المشروع
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [paymentType, setPaymentType] = useState('DAILY');
  const [daysWorked, setDaysWorked] = useState('');
  const [contractTotalAmount, setContractTotalAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [laborNotes, setLaborNotes] = useState('');

  // حالات التصفية والتحكم في العرض
  const [projectSearch, setProjectSearch] = useState('');
  const [projectLimit, setProjectLimit] = useState(3);

  const [materialSearch, setMaterialSearch] = useState('');
  const [materialLimit, setMaterialLimit] = useState(3);

  const [supplierSearch, setSupplierSearch] = useState('');
  const [supplierLimit, setSupplierLimit] = useState(3);

  const [workerSearch, setWorkerSearch] = useState('');
  const [workerLimit, setWorkerLimit] = useState(3);

  // مودال العمال
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [editingWorkerId, setEditingWorkerId] = useState(null);
  const [newWorkerProjectId, setNewWorkerProjectId] = useState('');
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerRole, setNewWorkerRole] = useState('BUILDER');
  const [newWorkerWage, setNewWorkerWage] = useState('');
  const [newWorkerPhone, setNewWorkerPhone] = useState('');

  // مودال الموردين
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState(null);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');
  const [newSupplierAddress, setNewSupplierAddress] = useState('');

  // مودال المواد
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState(null);
  const [newMaterialName, setNewMaterialName] = useState('');
  const [newMaterialUnit, setNewMaterialUnit] = useState('');
  const [newMaterialPrice, setNewMaterialPrice] = useState('');

  // مودال تعديل الطلب
  const [showEditRequestModal, setShowEditRequestModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [editMaterialId, setEditMaterialId] = useState('');
  const [editSupplierId, setEditSupplierId] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editRequestDate, setEditRequestDate] = useState('');

  // مودال المشاريع
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectLocation, setNewProjectLocation] = useState('');
  const [newProjectBudget, setNewProjectBudget] = useState('');

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
    fetchSuppliers();
    fetchWorkers();
    fetchRequests();
    fetchLaborExpenses();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE}requests/`);
      setProjectRequests(res.data);
    } catch (err) {
      console.error("Error fetching requests", err);
    }
  };

  const fetchLaborExpenses = async () => {
    try {
      const res = await axios.get(`${API_BASE}labor-expenses/`);
      setLaborExpenses(res.data);
    } catch (err) {
      console.error("Error fetching labor expenses", err);
    }
  };

  const fetchWorkers = async () => {
    try {
      const res = await axios.get(`${API_BASE}workers/`);
      setWorkers(res.data);
    } catch (err) {
      console.error("Error fetching workers", err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API_BASE}projects/`);
      setProjects(res.data);
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

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`${API_BASE}suppliers/`);
      setSuppliers(res.data);
    } catch (err) {
      console.error("Error fetching suppliers", err);
    }
  };

  const handleSaveSupplier = async (e) => {
    e.preventDefault();
    try {
      if (editingSupplierId) {
        const res = await axios.put(`${API_BASE}suppliers/${editingSupplierId}/`, {
          name: newSupplierName,
          phone: newSupplierPhone,
          address: newSupplierAddress
        });
        setSuppliers(suppliers.map(s => s.id === editingSupplierId ? res.data : s));
        alert('تم تعديل المورد بنجاح!');
      } else {
        const res = await axios.post(`${API_BASE}suppliers/`, {
          name: newSupplierName,
          phone: newSupplierPhone,
          address: newSupplierAddress
        });
        setSuppliers([...suppliers, res.data]);
        alert('تم إضافة المورد بنجاح!');
      }
      closeSupplierModal();
    } catch (err) {
      alert('حدث خطأ أثناء حفظ المورد.');
    }
  };

  const openAddSupplierModal = () => {
    setEditingSupplierId(null);
    setNewSupplierName('');
    setNewSupplierPhone('');
    setNewSupplierAddress('');
    setShowAddSupplierModal(true);
  };

  const openEditSupplierModal = (sup) => {
    setEditingSupplierId(sup.id);
    setNewSupplierName(sup.name);
    setNewSupplierPhone(sup.phone || '');
    setNewSupplierAddress(sup.address || '');
    setShowAddSupplierModal(true);
  };

  const closeSupplierModal = () => {
    setShowAddSupplierModal(false);
    setEditingSupplierId(null);
  };

  const handleDeleteSupplier = async (supplierId) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا المورد؟')) return;
    try {
      await axios.delete(`${API_BASE}suppliers/${supplierId}/`);
      setSuppliers(suppliers.filter(s => s.id !== supplierId));
      alert('تم حذف المورد بنجاح.');
    } catch (err) {
      alert('تعذر حذف المورد.');
    }
  };

  const handleSaveWorker = async (e) => {
    e.preventDefault();
    const projId = newWorkerProjectId || (selectedProject ? selectedProject.id : (projects.length > 0 ? projects[0].id : null));
    if (!projId) {
      alert('الرجاء اختيار المشروع التابع له العامل.');
      return;
    }

    try {
      const payload = {
        project: projId,
        name: newWorkerName,
        role: newWorkerRole,
        daily_wage: newWorkerWage || 0,
        phone: newWorkerPhone
      };

      if (editingWorkerId) {
        await axios.put(`${API_BASE}workers/${editingWorkerId}/`, payload);
        alert('تم تعديل بيانات العامل بنجاح!');
      } else {
        await axios.post(`${API_BASE}workers/`, payload);
        alert('تم إضافة العامل أو الحارس بنجاح!');
      }
      setShowAddWorkerModal(false);
      setEditingWorkerId(null);
      setNewWorkerName('');
      setNewWorkerWage('');
      setNewWorkerPhone('');
      fetchWorkers();
    } catch (err) {
      alert('حدث خطأ أثناء حفظ بيانات العامل.');
    }
  };

  const openEditWorkerModal = (w) => {
    setEditingWorkerId(w.id);
    setNewWorkerProjectId(w.project);
    setNewWorkerName(w.name);
    setNewWorkerRole(w.role || 'BUILDER');
    setNewWorkerWage(w.daily_wage);
    setNewWorkerPhone(w.phone || '');
    setShowAddWorkerModal(true);
  };

  const handleDeleteWorker = async (workerId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العامل؟')) return;
    try {
      await axios.delete(`${API_BASE}workers/${workerId}/`);
      fetchWorkers();
      alert('تم حذف العامل بنجاح.');
    } catch (err) {
      alert('تعذر حذف العامل.');
    }
  };

  const handleAddLaborExpense = async (e) => {
    e.preventDefault();
    const targetProjId = selectedProject ? selectedProject.id : (projects.length > 0 ? projects[0].id : null);
    if (!targetProjId || !selectedWorkerId) {
      alert('الرجاء اختيار مشروع وعامل أولاً لتسجيل الدفعة.');
      return;
    }

    let totalAmount = 0;
    let notesFormatted = laborNotes;

    if (paymentType === 'DAILY') {
      if (!daysWorked) return;
      const worker = workers.find(w => w.id === Number(selectedWorkerId));
      totalAmount = parseFloat(daysWorked) * parseFloat(worker.daily_wage);
      notesFormatted = `أجر يومي (${daysWorked} يوم) - ${laborNotes}`;
    } else {
      if (!contractTotalAmount || !paidAmount) return;
      totalAmount = parseFloat(paidAmount);
      notesFormatted = `عقد إجمالي: ${contractTotalAmount} أوقية | الدفعة المسددة: ${paidAmount} أوقية - ${laborNotes}`;
    }

    try {
      await axios.post(`${API_BASE}labor-expenses/`, {
        project: targetProjId,
        worker: selectedWorkerId,
        days_worked: paymentType === 'DAILY' ? daysWorked : 0,
        total_amount: totalAmount,
        notes: notesFormatted
      });
      setSelectedWorkerId('');
      setDaysWorked('');
      setContractTotalAmount('');
      setPaidAmount('');
      setLaborNotes('');
      fetchLaborExpenses();
      alert('تم تسجيل الدفعة / الأجر بنجاح!');
    } catch (err) {
      alert('حدث خطأ أثناء التسجيل.');
    }
  };

  const handleDeleteLaborExpense = async (expenseId) => {
    if (!window.confirm('هل تريد حذف سجل الدفعة هذا؟')) return;
    try {
      await axios.delete(`${API_BASE}labor-expenses/${expenseId}/`);
      fetchLaborExpenses();
    } catch (err) {
      alert('تعذر حذف السجل.');
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
    if (e) e.stopPropagation();
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
    if (e) e.stopPropagation();
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا المشروع نهائياً؟')) return;

    try {
      await axios.delete(`${API_BASE}projects/${projectId}/`);
      setProjects(projects.filter(p => p.id !== projectId));
      if (selectedProject?.id === projectId) setSelectedProject(null);
      fetchRequests();
      fetchLaborExpenses();
      alert('تم حذف المشروع بنجاح.');
    } catch (err) {
      console.error("Error deleting project", err);
    }
  };

  const handleSaveMaterial = async (e) => {
    e.preventDefault();
    try {
      if (editingMaterialId) {
        const res = await axios.put(`${API_BASE}materials/${editingMaterialId}/`, {
          name: newMaterialName,
          unit: newMaterialUnit,
          unit_price: newMaterialPrice || 0
        });
        setMaterials(materials.map(m => m.id === editingMaterialId ? res.data : m));
        alert('تم تعديل المادة بنجاح!');
      } else {
        const res = await axios.post(`${API_BASE}materials/`, {
          name: newMaterialName,
          unit: newMaterialUnit,
          unit_price: newMaterialPrice || 0
        });
        setMaterials([...materials, res.data]);
        alert('تم إضافة المادة بنجاح!');
      }
      closeMaterialModal();
    } catch (err) {
      console.error("Error saving material", err);
    }
  };

  const openAddMaterialModal = () => {
    setEditingMaterialId(null);
    setNewMaterialName('');
    setNewMaterialUnit('');
    setNewMaterialPrice('');
    setShowAddMaterialModal(true);
  };

  const openEditMaterialModal = (mat) => {
    setEditingMaterialId(mat.id);
    setNewMaterialName(mat.name);
    setNewMaterialUnit(mat.unit);
    setNewMaterialPrice(mat.unit_price);
    setShowAddMaterialModal(true);
  };

  const closeMaterialModal = () => {
    setShowAddMaterialModal(false);
    setEditingMaterialId(null);
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه المادة من المخزن؟')) return;
    try {
      await axios.delete(`${API_BASE}materials/${materialId}/`);
      setMaterials(materials.filter(m => m.id !== materialId));
      alert('تم حذف المادة بنجاح.');
    } catch (err) {
      alert('تعذر حذف المادة، قد تكون مرتبطة بطلبات قائمة.');
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    const targetProjId = selectedProject ? selectedProject.id : document.getElementById('targetProjectSelect')?.value;
    if (!targetProjId || !materialId || !quantity) {
      alert('الرجاء اختيار المشروع والمادة والكمية لإرسال الطلب.');
      return;
    }

    const chosenSupplier = supplierId ? Number(supplierId) : null;

    try {
      await axios.post(`${API_BASE}requests/`, {
        project: Number(targetProjId),
        material: Number(materialId),
        supplier: chosenSupplier,
        quantity: quantity,
        status: 'PENDING',
        created_at: requestDate ? requestDate.replace('T', ' ') + ':00' : null
      });
      setQuantity('');
      setMaterialId('');
      setSupplierId('');
      setRequestDate(getFormattedDateTime());

      await fetchRequests();
      alert('تم إرسال طلب المادة بنجاح!');
    } catch (err) {
      console.error("Error creating request", err);
      alert('حدث خطأ أثناء إرسال الطلب.');
    }
  };

  const openEditRequestModal = (req) => {
    setEditingRequest(req);
    setEditMaterialId(req.material);

    let supVal = '';
    if (req.supplier) {
      supVal = typeof req.supplier === 'object' ? req.supplier.id : req.supplier;
    } else if (req.supplier_id) {
      supVal = req.supplier_id;
    }
    setEditSupplierId(supVal);

    setEditQuantity(req.quantity);

    let formattedDate = getFormattedDateTime();
    if (req.created_at) {
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

    const chosenEditSupplier = editSupplierId ? Number(editSupplierId) : null;

    try {
      const formattedForBackend = editRequestDate ? editRequestDate.replace('T', ' ') + ':00' : null;

      await axios.patch(`${API_BASE}requests/${editingRequest.id}/`, {
        material: Number(editMaterialId),
        supplier: chosenEditSupplier,
        quantity: editQuantity,
        created_at: formattedForBackend
      });

      setShowEditRequestModal(false);
      setEditingRequest(null);
      await fetchRequests();
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
      await fetchRequests();
      alert('تم تأكيد وصول المادة لمكان البناء!');
    } catch (err) {
      console.error("Error updating request status", err);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا الطلب؟')) return;

    try {
      await axios.delete(`${API_BASE}requests/${requestId}/`);
      await fetchRequests();
      alert('تم حذف الطلب بنجاح.');
    } catch (err) {
      console.error("Error deleting request", err);
    }
  };

  const filteredProjects = projects.filter(proj =>
    proj.project_name.toLowerCase().includes(projectSearch.toLowerCase()) ||
    proj.location.toLowerCase().includes(projectSearch.toLowerCase())
  );
  const displayedProjects = filteredProjects.slice(0, projectLimit);

  const filteredMaterials = materials.filter(mat =>
    mat.name.toLowerCase().includes(materialSearch.toLowerCase()) ||
    mat.unit.toLowerCase().includes(materialSearch.toLowerCase())
  );
  const displayedMaterials = filteredMaterials.slice(0, materialLimit);

  const filteredSuppliers = suppliers.filter(sup =>
    sup.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
    (sup.phone && sup.phone.toLowerCase().includes(supplierSearch.toLowerCase()))
  );
  const displayedSuppliers = filteredSuppliers.slice(0, supplierLimit);

  const projectWorkers = workers.filter(w => {
    if (!selectedProject) return true;
    const wProjId = typeof w.project === 'object' ? w.project?.id : w.project;
    return Number(wProjId) === Number(selectedProject.id);
  });

  const filteredWorkers = projectWorkers.filter(w =>
    w.name.toLowerCase().includes(workerSearch.toLowerCase()) ||
    w.role.toLowerCase().includes(workerSearch.toLowerCase()) ||
    (w.phone && w.phone.toLowerCase().includes(workerSearch.toLowerCase()))
  );
  const displayedWorkers = filteredWorkers.slice(0, workerLimit);

  const getFilteredRequests = () => {
    let targetRequests = projectRequests;

    if (selectedProject) {
      targetRequests = projectRequests.filter(req => {
        const reqProjId = typeof req.project === 'object' ? req.project?.id : req.project;
        return Number(reqProjId) === Number(selectedProject.id);
      });
    }

    if (filterPeriod === 'all') {
      return targetRequests;
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    return targetRequests.filter(req => {
      if (!req.created_at) return false;
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
    if (filteredRequests.length === 0) {
      alert('لا توجد بيانات للتصدير بناءً على الفلتر الحالي.');
      return;
    }

    let csvContent = "\uFEFFاسم المشروع,اسم المادة,المورد,الكمية,الوحدة,التكلفة الإجمالية (أوقية),التاريخ والوقت,الحالة\n";

    filteredRequests.forEach(req => {
      const mat = materials.find(m => m.id === req.material);

      const supObj = suppliers.find(s => Number(s.id) === Number(req.supplier?.id || req.supplier || req.supplier_id));
      const supplierName = req.supplier_name || (supObj ? supObj.name : 'غير محدد');

      const projObj = projects.find(p => Number(p.id) === Number(req.project?.id || req.project));
      const projectName = projObj ? projObj.project_name : 'مشروع عام';

      const price = mat ? parseFloat(mat.unit_price) : 0;
      const totalCost = (parseFloat(req.quantity) * price).toFixed(2);
      const statusText = req.status === 'DELIVERED' ? 'تم التسليم' : 'قيد الانتظار';
      const dateStr = req.created_at ? new Date(req.created_at).toLocaleString() : '';
      const materialName = mat ? mat.name : (req.material_name || 'مادة');
      const materialUnit = mat ? mat.unit : (req.material_unit || '');

      csvContent += `"${projectName}","${materialName}","${supplierName}","${req.quantity}","${materialUnit}","${totalCost}","${dateStr}","${statusText}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `تقرير_المشاريع_${filterPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePDFInvoice = () => {
    let targetLabor = laborExpenses;
    if (selectedProject) {
      targetLabor = laborExpenses.filter(lab => {
        const labProjId = typeof lab.project === 'object' ? lab.project?.id : lab.project;
        return Number(labProjId) === Number(selectedProject.id);
      });
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const filteredLaborExpenses = targetLabor.filter(lab => {
      if (filterPeriod === 'all') return true;
      if (!lab.created_at) return false;
      const labDatePart = lab.created_at.split('T')[0];
      if (filterPeriod === 'today') return labDatePart === todayStr;
      if (filterPeriod === 'yesterday') return labDatePart === yesterdayStr;
      if (filterPeriod === 'customDate' && customDate) return labDatePart === customDate;
      if (filterPeriod === 'customMonth' && customMonth) return labDatePart.startsWith(customMonth);
      return true;
    });

    let rowsHTML = '';
    let materialsTotal = 0;

    filteredRequests.forEach((req, index) => {
      const mat = materials.find(m => m.id === req.material);
      const supObj = suppliers.find(s => Number(s.id) === Number(req.supplier?.id || req.supplier || req.supplier_id));
      const supplierName = req.supplier_name || (supObj ? supObj.name : 'غير محدد');
      const projObj = projects.find(p => Number(p.id) === Number(req.project?.id || req.project));
      const projectName = projObj ? projObj.project_name : 'مشروع عام';

      const price = mat ? parseFloat(mat.unit_price) : 0;
      const totalCost = parseFloat(req.quantity) * price;
      materialsTotal += totalCost;
      const dateStr = req.created_at ? new Date(req.created_at).toLocaleString() : '-';
      const materialName = mat ? mat.name : (req.material_name || 'مادة');
      const materialUnit = mat ? mat.unit : (req.material_unit || '');

      const statusBadge = req.status === 'DELIVERED'
        ? '<span style="background: #dcfce7; color: #166534; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; white-space: nowrap; display: inline-block;">تم التسليم</span>'
        : '<span style="background: #fef9c3; color: #854d0e; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; white-space: nowrap; display: inline-block;">قيد الانتظار</span>';

      const rowBg = index % 2 === 0 ? '#ffffff' : '#f8fafc';

      rowsHTML += `
        <tr style="background-color: ${rowBg};">
          <td style="padding: 10px 6px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #64748b; font-weight: 500; font-size: 13px;">${index + 1}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #1e293b; font-size: 13px;">${projectName}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #1e293b; font-size: 13px;">${materialName}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; color: #475569; font-size: 13px;">${supplierName}</td>
          <td style="padding: 10px 6px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #334155; white-space: nowrap; font-size: 13px;">${req.quantity} ${materialUnit}</td>
          <td style="padding: 10px 6px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #475569; white-space: nowrap; font-size: 13px;">${price.toLocaleString()} أوقية</td>
          <td style="padding: 10px 6px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #1d4ed8; font-weight: 700; white-space: nowrap; font-size: 13px;">${totalCost.toLocaleString()} أوقية</td>
          <td style="padding: 10px 6px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b; white-space: nowrap;">${dateStr}</td>
          <td style="padding: 10px 6px; border-bottom: 1px solid #e2e8f0; text-align: center;">${statusBadge}</td>
        </tr>
      `;
    });

    let laborRowsHTML = '';
    let laborTotal = 0;

    filteredLaborExpenses.forEach((lab, index) => {
      const worker = workers.find(w => w.id === Number(lab.worker));
      const projObj = projects.find(p => Number(p.id) === Number(lab.project?.id || lab.project));
      const projectName = projObj ? projObj.project_name : '-';
      const workerName = worker ? worker.name : '-';
      const roleText = worker?.role === 'BUILDER' ? 'بناء' : worker?.role === 'GUARD' ? 'حارس' : 'أخرى';
      const amount = parseFloat(lab.total_amount) || 0;
      laborTotal += amount;
      const dateStr = lab.created_at ? new Date(lab.created_at).toLocaleString() : '-';
      const notes = lab.notes || '-';
      const rowBg = index % 2 === 0 ? '#ffffff' : '#f8fafc';

      laborRowsHTML += `
        <tr style="background-color: ${rowBg};">
          <td style="padding: 10px 6px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #64748b; font-weight: 500; font-size: 13px;">${index + 1}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #1e293b; font-size: 13px;">${projectName}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #1e293b; font-size: 13px;">${workerName}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; color: #7c3aed; font-weight: 600; font-size: 13px;">${roleText}</td>
          <td style="padding: 10px 6px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #7c3aed; font-weight: 700; white-space: nowrap; font-size: 13px;">${amount.toLocaleString()} أوقية</td>
          <td style="padding: 10px 6px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b; white-space: nowrap;">${dateStr}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; color: #475569; font-size: 13px;">${notes}</td>
        </tr>
      `;
    });

    const grandTotal = materialsTotal + laborTotal;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title>تقرير المشتريات وأجور العمال - نظام بنيان</title>
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

            h3.section-title { margin: 20px 0 10px 0; color: #1e3a8a; font-size: 15px; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; }

            table { width: 100%; border-collapse: collapse; margin-top: 5px; margin-bottom: 15px; table-layout: fixed; }
            th { background: #1e3a8a; color: white; padding: 10px 6px; font-size: 12px; text-align: center; font-weight: 600; border: 1px solid #1e3a8a; white-space: nowrap; }
            th.labor-th { background: #5b21b6; border-color: #5b21b6; }
            
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
                <h2>تقرير شامل (مشتريات وأجور)</h2>
                <p><strong>تاريخ الإصدار:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>الوقت:</strong> ${new Date().toLocaleTimeString()}</p>
              </div>
            </div>

            <h3 class="section-title">📦 أولاً: مشتريات المواد</h3>
            <table>
              <thead>
                <tr>
                  <th style="width: 5%;">#</th>
                  <th style="width: 18%;">المشروع</th>
                  <th style="width: 20%;">اسم المادة</th>
                  <th style="width: 17%;">المورد</th>
                  <th style="width: 10%;">الكمية</th>
                  <th style="width: 12%;">سعر الوحدة</th>
                  <th style="width: 13%;">الإجمالي</th>
                  <th style="width: 10%;">التاريخ</th>
                  <th style="width: 8%;">الحالة</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHTML.length > 0 ? rowsHTML : '<tr><td colspan="9" style="text-align:center; padding:10px; color:#64748b;">لا توجد مشتريات مطابقة</td></tr>'}
              </tbody>
            </table>

            <h3 class="section-title" style="color: #5b21b6;">👷 ثانياً: أجور ودفعات العمال والحراس</h3>
            <table>
              <thead>
                <tr>
                  <th class="labor-th" style="width: 6%;">#</th>
                  <th class="labor-th" style="width: 20%;">المشروع</th>
                  <th class="labor-th" style="width: 20%;">العامل / الحارس</th>
                  <th class="labor-th" style="width: 14%;">المهنة</th>
                  <th class="labor-th" style="width: 15%;">المبلغ المدفوع</th>
                  <th class="labor-th" style="width: 15%;">التاريخ</th>
                  <th class="labor-th" style="width: 10%;">الملاحظات</th>
                </tr>
              </thead>
              <tbody>
                ${laborRowsHTML.length > 0 ? laborRowsHTML : '<tr><td colspan="7" style="text-align:center; padding:10px; color:#64748b;">لا توجد أجور أو دفعات عمال مسجلة مطابقة</td></tr>'}
              </tbody>
            </table>

            <div class="summary-card">
              <span class="summary-title">الإجمالي العام الشامل (مشتريات + أجور العمال):</span>
              <span class="summary-value">${grandTotal.toLocaleString()} أوقية</span>
            </div>

            <div class="footer">
              تم استخراج هذا التقرير والشامل آلياً عبر نظام "بنيان" لإدارة المقاولات والمشتريات. جميع الحقوق محفوظة © 2026.
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
    if (!selectedProject) {
      let totalExpenses = 0;
      projectRequests.forEach(req => {
        const mat = materials.find(m => m.id === req.material);
        const price = mat ? parseFloat(mat.unit_price) : (parseFloat(req.material_price) || 0);
        totalExpenses += parseFloat(req.quantity) * price;
      });
      laborExpenses.forEach(lab => {
        totalExpenses += parseFloat(lab.total_amount);
      });
      return { totalExpenses, remainingBudget: 0, materialsCost: 0, laborCost: 0 };
    }

    const currentProjectRequests = projectRequests.filter(req => {
      const reqProjId = typeof req.project === 'object' ? req.project?.id : req.project;
      return Number(reqProjId) === Number(selectedProject.id);
    });

    let materialsCost = 0;
    currentProjectRequests.forEach(req => {
      const mat = materials.find(m => m.id === req.material);
      const price = mat ? parseFloat(mat.unit_price) : (parseFloat(req.material_price) || 0);
      materialsCost += parseFloat(req.quantity) * price;
    });

    const currentProjectLabor = laborExpenses.filter(lab => {
      const labProjId = typeof lab.project === 'object' ? lab.project?.id : lab.project;
      return Number(labProjId) === Number(selectedProject.id);
    });

    let laborCost = 0;
    currentProjectLabor.forEach(lab => {
      laborCost += parseFloat(lab.total_amount);
    });

    const totalExpenses = materialsCost + laborCost;
    const budget = parseFloat(selectedProject.budget) || 0;
    const remainingBudget = budget - totalExpenses;

    return { totalExpenses, remainingBudget, materialsCost, laborCost };
  };

  const financials = calculateFinancials();
  const currentProjectLabor = laborExpenses.filter(lab => {
    if (!selectedProject) return true;
    const labProjId = typeof lab.project === 'object' ? lab.project?.id : lab.project;
    return Number(labProjId) === Number(selectedProject.id);
  });

  return (
    <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', direction: 'rtl', backgroundColor: '#f8fafc', minHeight: '100vh', color: '#1e293b' }}>

      <header style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', color: 'white', padding: '25px 20px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700' }}>نظام إدارة ومراقبة المقاولات (بنيان)</h1>
        <p style={{ margin: 0, fontSize: '15px', opacity: 0.9 }}>لوحة التحكم الذكية - إدارة المشاريع، المشتريات، وأجور العمال والحراس بالأوقية الجديدة</p>
      </header>

      <div style={{ maxWidth: '1400px', margin: '30px auto', padding: '0 20px' }}>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
          <button
            onClick={openAddProjectModal}
            style={{ padding: '12px 20px', background: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
          >
            + إضافة مشروع جديد
          </button>
          <button
            onClick={openAddMaterialModal}
            style={{ padding: '12px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
          >
            + إضافة مادة جديدة
          </button>
          <button
            onClick={openAddSupplierModal}
            style={{ padding: '12px 20px', background: '#d97706', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
          >
            + إضافة مورد جديد
          </button>
          <button
            onClick={() => {
              setEditingWorkerId(null);
              setNewWorkerProjectId(selectedProject ? selectedProject.id : (projects.length > 0 ? projects[0].id : ''));
              setNewWorkerName('');
              setNewWorkerRole('BUILDER');
              setNewWorkerWage('');
              setNewWorkerPhone('');
              setShowAddWorkerModal(true);
            }}
            style={{ padding: '12px 20px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
          >
            + إضافة عامل أو حارس
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', alignItems: 'start', marginBottom: '30px' }}>

          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', marginBottom: '12px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>
                المشاريع المسجلة ({filteredProjects.length})
              </h2>
              <button
                onClick={() => setSelectedProject(null)}
                style={{ padding: '6px 12px', background: selectedProject === null ? '#1e3a8a' : '#e2e8f0', color: selectedProject === null ? 'white' : '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
              >
                📁 عرض الكل (كل المشاريع)
              </button>
            </div>

            <div style={{ margin: '12px 0' }}>
              <input
                type="text"
                placeholder="🔍 ابحث عن مشروع أو موقع..."
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            {filteredProjects.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '20px 0', fontSize: '14px' }}>لا توجد مشاريع مطابقة للبحث.</p>
            ) : (
              <div>
                <div style={{ overflowX: 'auto', marginBottom: '12px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', color: '#475569' }}>
                        <th style={{ padding: '8px' }}>المشروع</th>
                        <th style={{ padding: '8px' }}>الموقع</th>
                        <th style={{ padding: '8px' }}>الميزانية</th>
                        <th style={{ padding: '8px', textAlign: 'center' }}>إدارة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedProjects.map(proj => (
                        <tr
                          key={proj.id}
                          onClick={() => setSelectedProject(proj)}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            cursor: 'pointer',
                            backgroundColor: selectedProject?.id === proj.id ? '#eff6ff' : 'transparent'
                          }}
                        >
                          <td style={{ padding: '10px 8px', fontWeight: '600', color: '#1e293b' }}>{proj.project_name}</td>
                          <td style={{ padding: '10px 8px', color: '#64748b' }}>{proj.location}</td>
                          <td style={{ padding: '10px 8px', color: '#059669', fontWeight: '600', whiteSpace: 'nowrap' }}>{parseFloat(proj.budget).toLocaleString()} أوقية</td>
                          <td style={{ padding: '10px 8px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                              <button
                                onClick={(e) => openEditProjectModal(proj, e)}
                                title="تعديل المشروع"
                                style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '13px', padding: 0 }}
                              >
                                ✏️
                              </button>
                              <button
                                onClick={(e) => handleDeleteProject(proj.id, e)}
                                title="حذف المشروع"
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px', padding: 0 }}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  {projectLimit < filteredProjects.length && (
                    <button
                      onClick={() => setProjectLimit(prev => prev + 3)}
                      style={{ background: '#2563eb', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                    >
                      عرض المزيد ({filteredProjects.length - projectLimit} متبقي)
                    </button>
                  )}
                  {projectLimit > 3 && (
                    <button
                      onClick={() => setProjectLimit(3)}
                      style={{ background: '#64748b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                    >
                      إخفاء / عرض أقل
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginTop: 0, fontSize: '18px', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', color: '#0f172a' }}>
              المواد المتاحة في المخزن ({filteredMaterials.length})
            </h2>

            <div style={{ margin: '12px 0' }}>
              <input
                type="text"
                placeholder="🔍 ابحث عن مادة أو وحدة قياس..."
                value={materialSearch}
                onChange={(e) => setMaterialSearch(e.target.value)}
                style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            {filteredMaterials.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '20px 0', fontSize: '14px' }}>لا توجد مواد مطابقة للبحث.</p>
            ) : (
              <div>
                <div style={{ overflowX: 'auto', marginBottom: '12px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', color: '#475569' }}>
                        <th style={{ padding: '8px' }}>المادة</th>
                        <th style={{ padding: '8px' }}>الوحدة</th>
                        <th style={{ padding: '8px' }}>سعر الوحدة</th>
                        <th style={{ padding: '8px', textAlign: 'center' }}>إدارة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedMaterials.map(mat => (
                        <tr key={mat.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 8px', fontWeight: '600', color: '#1e293b' }}>{mat.name}</td>
                          <td style={{ padding: '10px 8px', color: '#64748b' }}>{mat.unit}</td>
                          <td style={{ padding: '10px 8px', color: '#2563eb', fontWeight: '600', whiteSpace: 'nowrap' }}>{parseFloat(mat.unit_price).toLocaleString()} أوقية</td>
                          <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                              <button
                                onClick={() => openEditMaterialModal(mat)}
                                title="تعديل المادة"
                                style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '13px', padding: 0 }}
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteMaterial(mat.id)}
                                title="حذف المادة"
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px', padding: 0 }}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  {materialLimit < filteredMaterials.length && (
                    <button
                      onClick={() => setMaterialLimit(prev => prev + 3)}
                      style={{ background: '#2563eb', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                    >
                      عرض المزيد ({filteredMaterials.length - materialLimit} متبقي)
                    </button>
                  )}
                  {materialLimit > 3 && (
                    <button
                      onClick={() => setMaterialLimit(3)}
                      style={{ background: '#64748b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                    >
                      إخفاء / عرض أقل
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', alignItems: 'start', marginBottom: '30px' }}>

          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginTop: 0, fontSize: '18px', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', color: '#0f172a' }}>
              قائمة الموردين ({filteredSuppliers.length})
            </h2>

            <div style={{ margin: '12px 0' }}>
              <input
                type="text"
                placeholder="🔍 ابحث عن مورد أو رقم هاتف..."
                value={supplierSearch}
                onChange={(e) => setSupplierSearch(e.target.value)}
                style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            {filteredSuppliers.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '20px 0', fontSize: '14px' }}>لا توجد موردين مطابقتين للبحث.</p>
            ) : (
              <div>
                <div style={{ overflowX: 'auto', marginBottom: '12px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', color: '#475569' }}>
                        <th style={{ padding: '8px' }}>#</th>
                        <th style={{ padding: '8px' }}>اسم المورد</th>
                        <th style={{ padding: '8px' }}>الهاتف</th>
                        <th style={{ padding: '8px', textAlign: 'center' }}>إدارة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedSuppliers.map((sup, idx) => (
                        <tr key={sup.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 8px', color: '#64748b' }}>{idx + 1}</td>
                          <td style={{ padding: '10px 8px', fontWeight: '600', color: '#1e293b' }}>{sup.name}</td>
                          <td style={{ padding: '10px 8px', color: '#2563eb' }}>{sup.phone || '-'}</td>
                          <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button
                                onClick={() => openEditSupplierModal(sup)}
                                title="تعديل المورد"
                                style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '13px', padding: 0 }}
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteSupplier(sup.id)}
                                title="حذف المورد"
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px', padding: 0 }}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  {supplierLimit < filteredSuppliers.length && (
                    <button
                      onClick={() => setSupplierLimit(prev => prev + 3)}
                      style={{ background: '#2563eb', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                    >
                      عرض المزيد ({filteredSuppliers.length - supplierLimit} متبقي)
                    </button>
                  )}
                  {supplierLimit > 3 && (
                    <button
                      onClick={() => setSupplierLimit(3)}
                      style={{ background: '#64748b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                    >
                      إخفاء / عرض أقل
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginTop: 0, fontSize: '18px', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', color: '#0f172a' }}>
              {selectedProject ? `عمال وحراس مشروع: ${selectedProject.project_name} (${filteredWorkers.length})` : `عمال وحراس كافة المشاريع (${filteredWorkers.length})`}
            </h2>

            <div style={{ margin: '12px 0' }}>
              <input
                type="text"
                placeholder="🔍 ابحث عن عامل أو مهنة..."
                value={workerSearch}
                onChange={(e) => setWorkerSearch(e.target.value)}
                style={{ width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            {filteredWorkers.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '20px 0', fontSize: '14px' }}>لا توجد عمال أو حراس مسجلين.</p>
            ) : (
              <div>
                <div style={{ overflowX: 'auto', marginBottom: '12px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', color: '#475569' }}>
                        <th style={{ padding: '8px' }}>الاسم</th>
                        <th style={{ padding: '8px' }}>المهنة</th>
                        <th style={{ padding: '8px' }}>الأجر اليومي</th>
                        <th style={{ padding: '8px', textAlign: 'center' }}>إدارة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedWorkers.map(w => (
                        <tr key={w.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 8px', fontWeight: '600', color: '#1e293b' }}>{w.name}</td>
                          <td style={{ padding: '10px 8px', color: '#7c3aed', fontWeight: '600' }}>{w.role === 'BUILDER' ? 'بناء' : w.role === 'GUARD' ? 'حارس' : 'أخرى'}</td>
                          <td style={{ padding: '10px 8px', color: '#059669', fontWeight: '600', whiteSpace: 'nowrap' }}>{w.daily_wage > 0 ? `${parseFloat(w.daily_wage).toLocaleString()} أوقية` : 'عقد إجمالي'}</td>
                          <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button
                                onClick={() => openEditWorkerModal(w)}
                                title="تعديل العامل"
                                style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '13px', padding: 0 }}
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteWorker(w.id)}
                                title="حذف العامل"
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px', padding: 0 }}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  {workerLimit < filteredWorkers.length && (
                    <button
                      onClick={() => setWorkerLimit(prev => prev + 3)}
                      style={{ background: '#7c3aed', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                    >
                      عرض المزيد ({filteredWorkers.length - workerLimit} متبقي)
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)' }}>
          <div>
            <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ margin: '0 0 6px 0', color: '#1e3a8a', fontSize: '22px' }}>
                  {selectedProject ? `مشروع: ${selectedProject.project_name}` : '📁 العرض الشامل - كافة المشاريع'}
                </h2>
                <span style={{ color: '#64748b', fontSize: '14px' }}>
                  {selectedProject ? `📍 الموقع: ${selectedProject.location}` : '📍 يتم عرض كافة البيانات والطلبات والمصاريف لكل المشاريع'}
                </span>
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

            <div style={{ display: 'grid', gridTemplateColumns: selectedProject ? 'repeat(3, 1fr)' : '1fr', gap: '15px', marginBottom: '20px' }}>
              {selectedProject && (
                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 5px 0', color: '#64748b', fontSize: '13px' }}>الميزانية الكلية</p>
                  <h3 style={{ margin: 0, color: '#1e3a8a', fontSize: '18px' }}>{parseFloat(selectedProject.budget).toLocaleString()} أوقية</h3>
                </div>
              )}
              <div style={{ background: '#eff6ff', padding: '15px', borderRadius: '10px', border: '1px solid #bfdbfe', textAlign: 'center' }}>
                <p style={{ margin: '0 0 5px 0', color: '#1e40af', fontSize: '13px' }}>إجمالي المصاريف (مشتريات وعمال)</p>
                <h3 style={{ margin: 0, color: '#2563eb', fontSize: '18px' }}>{financials.totalExpenses.toFixed(2)} أوقية</h3>
              </div>
              {selectedProject && (
                <div style={{ background: financials.remainingBudget >= 0 ? '#f0fdf4' : '#fef2f2', padding: '15px', borderRadius: '10px', border: '1px solid ' + (financials.remainingBudget >= 0 ? '#bbf7d0' : '#fecaca'), textAlign: 'center' }}>
                  <p style={{ margin: '0 0 5px 0', color: financials.remainingBudget >= 0 ? '#166534' : '#991b1b', fontSize: '13px' }}>المتبقي من الميزانية</p>
                  <h3 style={{ margin: 0, color: financials.remainingBudget >= 0 ? '#15803d' : '#dc2626', fontSize: '18px' }}>{financials.remainingBudget.toFixed(2)} أوقية</h3>
                </div>
              )}
            </div>

            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#334155' }}>📦 طلب مادة جديدة للمشروع</h3>
              <form onSubmit={handleCreateRequest} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>

                {!selectedProject && (
                  <select
                    id="targetProjectSelect"
                    required
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', flex: 1.5, fontSize: '14px', backgroundColor: 'white' }}
                  >
                    <option value="">اختر المشروع لإرسال الطلب إليه...</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.project_name}</option>
                    ))}
                  </select>
                )}

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

                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', flex: 1.5, fontSize: '14px', backgroundColor: 'white' }}
                >
                  <option value="">اختر المورد (اختياري)...</option>
                  {suppliers.map(sup => (
                    <option key={sup.id} value={sup.id}>{sup.name}</option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="الكمية"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '80px', fontSize: '14px', backgroundColor: 'white' }}
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

            <div style={{ background: '#f5f3ff', padding: '18px', borderRadius: '10px', marginBottom: '25px', border: '1px solid #ddd6fe' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#5b21b6' }}>👷 تسجيل أجور أو دفعات عمال البناء والحراس</h3>

              <div style={{ display: 'flex', gap: '15px', marginBottom: '12px', alignItems: 'center' }}>
                <label style={{ fontWeight: '600', fontSize: '14px', color: '#4c1d95' }}>طريقة الحساب:</label>
                <label style={{ cursor: 'pointer', fontSize: '14px' }}>
                  <input type="radio" name="paymentType" value="DAILY" checked={paymentType === 'DAILY'} onChange={() => setPaymentType('DAILY')} /> أجر يومي
                </label>
                <label style={{ cursor: 'pointer', fontSize: '14px' }}>
                  <input type="radio" name="paymentType" value="CONTRACT" checked={paymentType === 'CONTRACT'} onChange={() => setPaymentType('CONTRACT')} /> مبلغ إجمالي (دفعة / تسبيق)
                </label>
              </div>

              <form onSubmit={handleAddLaborExpense} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <select
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  required
                  style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', flex: 2, fontSize: '14px', backgroundColor: 'white' }}
                >
                  <option value="">اختر العامل أو الحارس...</option>
                  {workers.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.role === 'BUILDER' ? 'بناء' : 'حارس'}) {w.daily_wage > 0 ? `- يومية: ${w.daily_wage}` : ''}</option>
                  ))}
                </select>

                {paymentType === 'DAILY' ? (
                  <input
                    type="number"
                    step="0.5"
                    placeholder="عدد الأيام"
                    value={daysWorked}
                    onChange={(e) => setDaysWorked(e.target.value)}
                    required
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '120px', fontSize: '14px', backgroundColor: 'white' }}
                  />
                ) : (
                  <>
                    <input
                      type="number"
                      placeholder="المبلغ الإجمالي المتفق عليه"
                      value={contractTotalAmount}
                      onChange={(e) => setContractTotalAmount(e.target.value)}
                      required
                      style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '150px', fontSize: '14px', backgroundColor: 'white' }}
                    />
                    <input
                      type="number"
                      placeholder="المبلغ المدفوع الآن"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                      required
                      style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '140px', fontSize: '14px', backgroundColor: 'white' }}
                    />
                  </>
                )}

                <input
                  type="text"
                  placeholder="ملاحظات (مثلاً: الدفعة الأولى)"
                  value={laborNotes}
                  onChange={(e) => setLaborNotes(e.target.value)}
                  style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', flex: 1.5, fontSize: '14px', backgroundColor: 'white' }}
                />

                <button type="submit" style={{ padding: '10px 18px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                  تسجيل الدفعة / الأجر
                </button>
              </form>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ fontSize: '16px', color: '#334155', marginBottom: '12px' }}>📋 سجل أجور ودفعات العمال والحراس</h3>
              {currentProjectLabor.length > 0 ? (
                <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ background: '#f5f3ff', color: '#5b21b6' }}>
                        <th style={{ padding: '12px' }}>المشروع</th>
                        <th style={{ padding: '12px' }}>العامل / الحارس</th>
                        <th style={{ padding: '12px' }}>المهنة</th>
                        <th style={{ padding: '12px' }}>المبلغ المدفوع</th>
                        <th style={{ padding: '12px' }}>التفاصيل والملاحظات</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>إدارة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentProjectLabor.map(lab => {
                        const worker = workers.find(w => w.id === Number(lab.worker));
                        const projObj = projects.find(p => Number(p.id) === Number(lab.project?.id || lab.project));
                        return (
                          <tr key={lab.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px', fontWeight: '600', color: '#1e3a8a' }}>{projObj ? projObj.project_name : '-'}</td>
                            <td style={{ padding: '12px', fontWeight: '600' }}>{worker ? worker.name : '-'}</td>
                            <td style={{ padding: '12px', color: '#7c3aed' }}>{worker?.role === 'BUILDER' ? 'بناء' : 'حارس'}</td>
                            <td style={{ padding: '12px', color: '#7c3aed', fontWeight: '700' }}>{parseFloat(lab.total_amount).toLocaleString()} أوقية</td>
                            <td style={{ padding: '12px', color: '#64748b' }}>{lab.notes || '-'}</td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <button
                                onClick={() => handleDeleteLaborExpense(lab.id)}
                                title="حذف السجل"
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
                <p style={{ color: '#64748b', fontSize: '14px', fontStyle: 'italic', marginBottom: '20px' }}>لا توجد أجور أو دفعات عمال مسجلة.</p>
              )}
            </div>

            <div style={{ background: '#eff6ff', padding: '15px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #bfdbfe', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontWeight: '600', fontSize: '14px', color: '#1e40af' }}>🔍 تصفية سجل طلبات المواد للتقرير:</span>

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
              <h3 style={{ fontSize: '16px', color: '#334155', marginBottom: '12px' }}>📋 جدول المواد والطلبات بتواريخها ومورديها</h3>
              {filteredRequests.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', color: '#475569' }}>
                        <th style={{ padding: '12px' }}>المشروع</th>
                        <th style={{ padding: '12px' }}>المادة</th>
                        <th style={{ padding: '12px' }}>المورد</th>
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

                        const supObj = suppliers.find(s => Number(s.id) === Number(req.supplier?.id || req.supplier || req.supplier_id));
                        const supplierName = req.supplier_name || (supObj ? supObj.name : 'غير محدد');

                        const projObj = projects.find(p => Number(p.id) === Number(req.project?.id || req.project));

                        const price = mat ? parseFloat(mat.unit_price) : 0;
                        const totalCost = parseFloat(req.quantity) * price;
                        const materialName = mat ? mat.name : (req.material_name || 'مادة');
                        const materialUnit = mat ? mat.unit : (req.material_unit || '');

                        return (
                          <tr key={req.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px', fontWeight: '600', color: '#1e3a8a' }}>{projObj ? projObj.project_name : '-'}</td>
                            <td style={{ padding: '12px', fontWeight: '500' }}>{materialName}</td>
                            <td style={{ padding: '12px', color: '#475569', fontWeight: supplierName !== 'غير محدد' ? '600' : 'normal' }}>{supplierName}</td>
                            <td style={{ padding: '12px' }}>{req.quantity} {materialUnit}</td>
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
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>المورد:</label>
                <select
                  value={editSupplierId}
                  onChange={(e) => setEditSupplierId(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: 'white' }}
                >
                  <option value="">اختر المورد...</option>
                  {suppliers.map(sup => (
                    <option key={sup.id} value={sup.id}>{sup.name}</option>
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

      {showAddWorkerModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '420px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginTop: 0, color: '#1e3a8a', fontSize: '20px', marginBottom: '20px' }}>
              {editingWorkerId ? 'تعديل بيانات العامل' : 'إضافة عامل أو حارس جديد'}
            </h2>
            <form onSubmit={handleSaveWorker}>

              {!selectedProject && !editingWorkerId && (
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>المشروع التابع له:</label>
                  <select
                    value={newWorkerProjectId}
                    onChange={(e) => setNewWorkerProjectId(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: 'white' }}
                  >
                    <option value="">اختر المشروع...</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.project_name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>اسم العامل:</label>
                <input
                  type="text"
                  value={newWorkerName}
                  onChange={(e) => setNewWorkerName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>المهنة / الوظيفة:</label>
                <select
                  value={newWorkerRole}
                  onChange={(e) => setNewWorkerRole(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: 'white' }}
                >
                  <option value="BUILDER">بناء</option>
                  <option value="GUARD">حارس</option>
                  <option value="OTHER">أخرى</option>
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>الأجر اليومي (إن كان يتقاضى باليوم - أوقية):</label>
                <input
                  type="number"
                  step="0.01"
                  value={newWorkerWage}
                  onChange={(e) => setNewWorkerWage(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px' }}
                />
              </div>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>رقم الهاتف:</label>
                <input
                  type="text"
                  value={newWorkerPhone}
                  onChange={(e) => setNewWorkerPhone(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddWorkerModal(false)}
                  style={{ padding: '10px 20px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  {editingWorkerId ? 'تحديث العامل' : 'حفظ العامل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddSupplierModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '420px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginTop: 0, color: '#1e3a8a', fontSize: '20px', marginBottom: '20px' }}>
              {editingSupplierId ? 'تعديل بيانات المورد' : 'إضافة مورد جديد'}
            </h2>
            <form onSubmit={handleSaveSupplier}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>اسم المورد أو الشركة:</label>
                <input
                  type="text"
                  value={newSupplierName}
                  onChange={(e) => setNewSupplierName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>رقم الهاتف:</label>
                <input
                  type="text"
                  value={newSupplierPhone}
                  onChange={(e) => setNewSupplierPhone(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px' }}
                />
              </div>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>العنوان / الموقع:</label>
                <input
                  type="text"
                  value={newSupplierAddress}
                  onChange={(e) => setNewSupplierAddress(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={closeSupplierModal}
                  style={{ padding: '10px 20px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', background: '#d97706', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  {editingSupplierId ? 'تحديث المورد' : 'حفظ المورد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddProjectModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: '1000' }}>
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
            <h2 style={{ marginTop: 0, color: '#1e3a8a', fontSize: '20px', marginBottom: '20px' }}>
              {editingMaterialId ? 'تعديل بيانات المادة' : 'إضافة مادة جديدة للمخزن'}
            </h2>
            <form onSubmit={handleSaveMaterial}>
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
                  onClick={closeMaterialModal}
                  style={{ padding: '10px 20px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  {editingMaterialId ? 'تحديث المادة' : 'حفظ المادة'}
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