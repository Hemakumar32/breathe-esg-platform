from rest_framework import serializers
from .models import EmissionRecord, ValidationIssue, AuditLog

class ValidationIssueSerializer(serializers.ModelSerializer):
    class Meta:
        model = ValidationIssue
        fields = '__all__'

class EmissionRecordSerializer(serializers.ModelSerializer):
    issues = ValidationIssueSerializer(source='validation_issues', many=True, read_only=True)
    raw_data = serializers.JSONField(source='raw_record.raw_data', read_only=True)
    file_name = serializers.CharField(source='raw_record.datasource.file_name', read_only=True)

    class Meta:
        model = EmissionRecord
        fields = '__all__'

class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = '__all__'
