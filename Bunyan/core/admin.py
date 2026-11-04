from django.contrib import admin
from .models import Project, Material, MaterialRequest, ConsumptionLog

admin.site.register(Project)
admin.site.register(Material)
admin.site.register(MaterialRequest)
admin.site.register(ConsumptionLog)