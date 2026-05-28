from django.contrib import admin
from .models import DataSource, RawRecord, EmissionRecord, ValidationIssue

admin.site.register(DataSource)
admin.site.register(RawRecord)
admin.site.register(EmissionRecord)
admin.site.register(ValidationIssue)
