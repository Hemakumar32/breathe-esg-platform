from django.db import models

class DataSource(models.Model):
    SOURCE_CHOICES = [
        ('SAP', 'SAP Fuel/Procurement'),
        ('UTILITY', 'Utility Electricity'),
        ('TRAVEL', 'Corporate Travel'),
    ]
    source_type = models.CharField(max_length=20, choices=SOURCE_CHOICES)
    file_name = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)

class RawRecord(models.Model):
    datasource = models.ForeignKey(DataSource, on_delete=models.CASCADE, related_name='raw_records')
    raw_data = models.JSONField()
    status = models.CharField(max_length=50, default='PENDING') # PENDING, PROCESSED, FAILED

class EmissionRecord(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending Review'),
        ('APPROVED', 'Approved'),
        ('LOCKED', 'Locked'),
        ('REJECTED', 'Rejected'),
    ]
    raw_record = models.ForeignKey(RawRecord, on_delete=models.CASCADE, related_name='emission_records')
    source_type = models.CharField(max_length=50)
    activity_type = models.CharField(max_length=100)
    scope = models.IntegerField()
    value = models.FloatField()
    unit = models.CharField(max_length=50)
    co2e_kg = models.FloatField()
    review_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

class ValidationIssue(models.Model):
    SEVERITY_CHOICES = [
        ('WARNING', 'Warning'),
        ('ERROR', 'Error'),
    ]
    emission_record = models.ForeignKey(EmissionRecord, on_delete=models.CASCADE, related_name='validation_issues')
    issue = models.CharField(max_length=255)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='ERROR')

class AuditLog(models.Model):
    action = models.CharField(max_length=255)
    user = models.CharField(max_length=100)
    details = models.TextField()
    ip_address = models.CharField(max_length=50, default='127.0.0.1')
    status = models.CharField(max_length=50, default='Success')
    created_at = models.DateTimeField(auto_now_add=True)
