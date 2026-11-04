from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, MaterialViewSet, MaterialRequestViewSet, ConsumptionLogViewSet

router = DefaultRouter()
router.register(r'projects', ProjectViewSet)
router.register(r'materials', MaterialViewSet)
router.register(r'requests', MaterialRequestViewSet)
router.register(r'consumptions', ConsumptionLogViewSet)

urlpatterns = [
    path('', include(router.urls)),
]