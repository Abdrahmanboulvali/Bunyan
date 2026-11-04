from rest_framework import viewsets
from .models import Project, Material, MaterialRequest, ConsumptionLog
from .serializers import (
    ProjectSerializer,
    MaterialSerializer,
    MaterialRequestSerializer,
    ConsumptionLogSerializer
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

class ConsumptionLogViewSet(viewsets.ModelViewSet):
    queryset = ConsumptionLog.objects.all().order_by('-date_recorded')
    serializer_class = ConsumptionLogSerializer