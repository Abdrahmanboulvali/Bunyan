from rest_framework import viewsets
from .models import Project, Material, MaterialRequest, ConsumptionLog, Supplier, Worker, ProjectLaborExpense
from .serializers import (
    ProjectSerializer,
    MaterialSerializer,
    MaterialRequestSerializer,
    ConsumptionLogSerializer,
    SupplierSerializer,
    WorkerSerializer,
    ProjectLaborExpenseSerializer
)

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().order_by('-created_at')
    serializer_class = ProjectSerializer

class MaterialViewSet(viewsets.ModelViewSet):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer

class MaterialRequestViewSet(viewsets.ModelViewSet):
    queryset = MaterialRequest.objects.all().order_by('-created_at')
    serializer_class = MaterialRequestSerializer

    def perform_create(self, serializer):
        # اعتماد الآلية القياسية لـ DRF لحفظ البيانات الواردة مباشرة دون تعقيد
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()

class ConsumptionLogViewSet(viewsets.ModelViewSet):
    queryset = ConsumptionLog.objects.all().order_by('-date_recorded')
    serializer_class = ConsumptionLogSerializer

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer

class WorkerViewSet(viewsets.ModelViewSet):
    queryset = Worker.objects.all()
    serializer_class = WorkerSerializer

class ProjectLaborExpenseViewSet(viewsets.ModelViewSet):
    queryset = ProjectLaborExpense.objects.all()
    serializer_class = ProjectLaborExpenseSerializer