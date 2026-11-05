from rest_framework import serializers
from .models import Project, Material, MaterialRequest, ConsumptionLog, Supplier, Worker, ProjectLaborExpense


class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = '__all__'


class MaterialRequestSerializer(serializers.ModelSerializer):
    material_name = serializers.ReadOnlyField(source='material.name')
    material_unit = serializers.ReadOnlyField(source='material.unit')
    material_price = serializers.ReadOnlyField(source='material.unit_price')
    supplier_name = serializers.CharField(source='supplier.name', read_only=True, allow_null=True, default='غير محدد')

    class Meta:
        model = MaterialRequest
        fields = '__all__'

class ConsumptionLogSerializer(serializers.ModelSerializer):
    material_name = serializers.ReadOnlyField(source='material.name')
    supplier_name = serializers.CharField(source='supplier.name', read_only=True, allow_null=True, default='غير محدد')
    class Meta:
        model = ConsumptionLog
        fields = '__all__'


class ProjectSerializer(serializers.ModelSerializer):
    requests = MaterialRequestSerializer(many=True, read_only=True)
    consumptions = ConsumptionLogSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = '__all__'

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'

class WorkerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Worker
        fields = '__all__'

class ProjectLaborExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectLaborExpense
        fields = '__all__'