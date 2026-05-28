from django.urls import path
from .views import upload_csv, get_records, approve_record, reject_record, get_record_detail, update_record, get_audit_logs

urlpatterns = [
    path('upload/', upload_csv),
    path('records/', get_records),
    path('records/<int:pk>/', get_record_detail),
    path('records/<int:pk>/update/', update_record),
    path('records/<int:pk>/approve/', approve_record),
    path('records/<int:pk>/reject/', reject_record),
    path('audit-logs/', get_audit_logs),
]
