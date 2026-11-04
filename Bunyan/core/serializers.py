from rest_framework import serializers
from .models import Project, Material, MaterialRequest, ConsumptionLog


class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = '__all__'


class MaterialRequestSerializer(serializers.ModelSerializer):
    material_name = serializers.ReadOnlyField(source='material.name')
    material_unit = serializers.ReadOnlyField(source='material.unit')
    material_price = serializers.ReadOnlyField(source='material.unit_price')  # أضفنا سعر الوحدة لسهولة الحساب

    class Meta:
        model = MaterialRequest
        fields = '__all__'


class ConsumptionLogSerializer(serializers.ModelSerializer):
    material_name = serializers.ReadOnlyField(source='material.name')

    class Meta:
        model = ConsumptionLog
        fields = '__all__'


class ProjectSerializer(serializers.ModelSerializer):
    requests = MaterialRequestSerializer(many=True, read_only=True)
    consumptions = ConsumptionLogSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = '__all__'