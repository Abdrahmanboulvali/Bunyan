from django.db import models


class Project(models.Model):
    project_name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    budget = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.project_name


class Material(models.Model):
    name = models.CharField(max_length=255)
    unit = models.CharField(max_length=50)  # وحدة القياس (مثل: طن، كيس، متر)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return self.name


class MaterialRequest(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'قيد الانتظار'),
        ('DELIVERED', 'تم التسليم'),
        ('CANCELLED', 'ملغي'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='requests')
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # التحقق مما إذا كان الطلب قديماً وتم تحديث حالته إلى "تم التسليم"
        is_new = self.pk is None
        old_status = None
        if not is_new:
            old_status = MaterialRequest.objects.get(pk=self.pk).status

        super().save(*args, **kwargs)

        # إذا أصبحت الحالة "تم التسليم"، يتم تسجيلها تلقائياً كمستهلكات في المشروع
        if self.status == 'DELIVERED' and (is_new or old_status != 'DELIVERED'):
            ConsumptionLog.objects.get_or_create(
                project=self.project,
                material=self.material,
                defaults={'quantity_consumed': self.quantity}
            )

    def __str__(self):
        return f"طلب {self.material.name} - {self.project.project_name} ({self.get_status_display()})"


class ConsumptionLog(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='consumptions')
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    quantity_consumed = models.DecimalField(max_digits=10, decimal_places=2)
    date_recorded = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"استهلاك {self.quantity_consumed} {self.material.unit} من {self.material.name} في {self.project.project_name}"