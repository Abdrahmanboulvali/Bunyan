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

class Supplier(models.Model):
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=50, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class MaterialRequest(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'قيد الانتظار'),
        ('DELIVERED', 'تم التسليم'),
        ('CANCELLED', 'ملغي'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='material_requests')
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(null=True, blank=True)
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="المورد")
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
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, blank=True)
    def __str__(self):
        return f"استهلاك {self.quantity_consumed} {self.material.unit} من {self.material.name} في {self.project.project_name}"



class ProjectRequest(models.Model):
    project = models.ForeignKey(Project, related_name='requests', on_delete=models.CASCADE, verbose_name="المشروع")
    material = models.ForeignKey(Material, on_delete=models.CASCADE, verbose_name="المادة")
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="المورد")
    quantity = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="الكمية")
    status = models.CharField(max_length=20, default='PENDING', verbose_name="الحالة")
    created_at = models.DateTimeField(blank=True, null=True, verbose_name="التاريخ والوقت")

    def __str__(self):
        return f"{self.material.name} - {self.quantity}"

from django.db import models

class Worker(models.Model):
    ROLE_CHOICES = [
        ('BUILDER', 'بناء'),
        ('GUARD', 'حارس'),
        ('OTHER', 'أخرى'),
    ]
    project = models.ForeignKey('Project', related_name='workers', on_delete=models.CASCADE, verbose_name="المشروع / مكان البناء")
    name = models.CharField(max_length=255, verbose_name="اسم العامل")
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='BUILDER', verbose_name="المهنة")
    daily_wage = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="الأجر اليومي (أوقية)")
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name="رقم الهاتف")

    def __str__(self):
        return f"{self.name} ({self.get_role_display()}) - {self.project.project_name}"


class ProjectLaborExpense(models.Model):
    project = models.ForeignKey('Project', related_name='labor_expenses', on_delete=models.CASCADE, verbose_name="المشروع")
    worker = models.ForeignKey(Worker, on_delete=models.CASCADE, verbose_name="العامل / الحارس")
    days_worked = models.DecimalField(max_digits=5, decimal_places=1, default=0, verbose_name="عدد الأيام")
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="المبلغ المدفوع (أوقية)")
    notes = models.TextField(blank=True, null=True, verbose_name="ملاحظات")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ التسجيل")

    def __str__(self):
        return f"{self.worker.name} - {self.total_amount} أوقية"