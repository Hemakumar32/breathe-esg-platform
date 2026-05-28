import csv
import io
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import (
    DataSource,
    RawRecord,
    EmissionRecord,
    ValidationIssue,
    AuditLog
)
from .serializers import EmissionRecordSerializer, AuditLogSerializer

EMISSION_FACTORS = {
    "diesel": 2.68,
    "petrol": 2.31,
    "electricity": 0.72,
    "flight": 0.18
}

@api_view(['POST'])
def upload_csv(request):
    file = request.FILES['file']
    source_type = request.data['source_type']
    
    datasource = DataSource.objects.create(
        source_type=source_type,
        file_name=file.name
    )
    
    decoded_file = file.read().decode('utf-8')
    io_string = io.StringIO(decoded_file)
    reader = csv.DictReader(io_string)
    
    created_records = []
    
    total_rows = 0
    warnings_count = 0
    errors_count = 0

    for row in reader:
        total_rows += 1
        raw_record = RawRecord.objects.create(
            datasource=datasource,
            raw_data=row
        )
        
        quantity = 0.0
        try:
            if source_type == "SAP":
                val = row.get("quantity", 0)
                quantity = float(val) if val else 0.0
            elif source_type == "Utility":
                val = row.get("kwh", 0)
                quantity = float(val) if val else 0.0
            else:
                val = row.get("distance", 0)
                quantity = float(val) if val else 0.0
        except ValueError:
            quantity = 0.0

        unit = ""
        factor = 0
        
        if source_type == "SAP":
            unit = row.get("unit", "")
            factor = EMISSION_FACTORS.get(
                row.get("fuel_type", "").lower(),
                0
            )
            activity_type = "Fuel Combustion"
            scope = 1
        elif source_type == "Utility":
            unit = "kWh"
            factor = EMISSION_FACTORS["electricity"]
            activity_type = "Electricity"
            scope = 2
        else:
            unit = "km"
            factor = EMISSION_FACTORS["flight"]
            activity_type = "Business Travel"
            scope = 3
            
        co2e = quantity * factor
        
        emission_record = EmissionRecord.objects.create(
            raw_record=raw_record,
            source_type=source_type,
            activity_type=activity_type,
            scope=scope,
            value=quantity,
            unit=unit,
            co2e_kg=co2e
        )
        
        has_warning = False
        has_error = False

        if quantity < 0:
            if source_type == "Utility":
                ValidationIssue.objects.create(
                    emission_record=emission_record,
                    issue="Invalid electricity usage",
                    severity="ERROR"
                )
                has_error = True
            else:
                ValidationIssue.objects.create(
                    emission_record=emission_record,
                    issue="Invalid quantity",
                    severity="ERROR"
                )
                has_error = True
        elif quantity == 0:
            if source_type == "Utility":
                ValidationIssue.objects.create(
                    emission_record=emission_record,
                    issue="Zero electricity usage",
                    severity="ERROR"
                )
                has_error = True
            else:
                ValidationIssue.objects.create(
                    emission_record=emission_record,
                    issue="Invalid quantity",
                    severity="ERROR"
                )
                has_error = True
            
        if unit == "":
            ValidationIssue.objects.create(
                emission_record=emission_record,
                issue="Missing unit",
                severity="WARNING"
            )
            has_warning = True
            
        if source_type == "Travel":
            origin = row.get("origin", "").strip()
            destination = row.get("destination", "").strip()
            if not origin or len(origin) != 3 or not destination or len(destination) != 3:
                ValidationIssue.objects.create(
                    emission_record=emission_record,
                    issue="Invalid origin or destination code",
                    severity="ERROR"
                )
                has_error = True
                
        if has_error:
            errors_count += 1
        elif has_warning:
            warnings_count += 1

        created_records.append(emission_record)
        
    serializer = EmissionRecordSerializer(
        created_records,
        many=True
    )
    
    return Response({
        "summary": {
            "total_rows": total_rows,
            "processed": len(created_records),
            "warnings": warnings_count,
            "errors": errors_count
        },
        "records": serializer.data
    })

@api_view(['GET'])
def get_records(request):
    records = EmissionRecord.objects.all().order_by('-created_at')
    serializer = EmissionRecordSerializer(records, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_record_detail(request, pk):
    try:
        record = EmissionRecord.objects.get(pk=pk)
        serializer = EmissionRecordSerializer(record)
        return Response(serializer.data)
    except EmissionRecord.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

@api_view(['POST'])
def approve_record(request, pk):
    try:
        record = EmissionRecord.objects.get(pk=pk)
        if record.review_status == 'LOCKED':
            return Response({'error': 'Cannot modify a locked record'}, status=400)
        record.review_status = 'LOCKED'
        record.save()
        try:
            AuditLog.objects.create(
                action='Approved Emission Record',
                user='System Analyst',
                details=f'Record #{record.id} ({record.source_type} - {record.activity_type}) marked as APPROVED',
                ip_address=request.META.get('REMOTE_ADDR', '127.0.0.1'),
                status='Success'
            )
        except Exception as log_err:
            print(f"Failed to create audit log: {log_err}")
        return Response({'status': 'Locked'})
    except EmissionRecord.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

@api_view(['POST'])
def reject_record(request, pk):
    try:
        record = EmissionRecord.objects.get(pk=pk)
        if record.review_status == 'LOCKED':
            return Response({'error': 'Cannot modify a locked record'}, status=400)
        record.review_status = 'REJECTED'
        record.save()
        try:
            AuditLog.objects.create(
                action='Rejected Emission Record',
                user='System Analyst',
                details=f'Record #{record.id} ({record.source_type} - {record.activity_type}) marked as REJECTED',
                ip_address=request.META.get('REMOTE_ADDR', '127.0.0.1'),
                status='Success'
            )
        except Exception as log_err:
            print(f"Failed to create audit log: {log_err}")
        return Response({'status': 'Rejected'})
    except EmissionRecord.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)
@api_view(['PUT'])
def update_record(request, pk):
    try:
        record = EmissionRecord.objects.get(pk=pk)
        if record.review_status == 'LOCKED':
            return Response({'error': 'Cannot update a locked record'}, status=400)
    except EmissionRecord.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

    raw_record = request.data.get('raw_record', {})
    
    # Recalculate values based on source_type
    source_type = record.source_type
    
    quantity = 0.0
    try:
        if source_type == "SAP":
            val = raw_record.get("quantity", 0)
            quantity = float(val) if val else 0.0
        elif source_type == "Utility":
            val = raw_record.get("kwh", 0)
            quantity = float(val) if val else 0.0
        else:
            val = raw_record.get("distance", 0)
            quantity = float(val) if val else 0.0
    except ValueError:
        quantity = 0.0

    if source_type == "SAP":
        unit = raw_record.get("unit", "").strip()
        factor = EMISSION_FACTORS.get(raw_record.get("fuel_type", "").lower(), 0)
    elif source_type == "Utility":
        unit = "kWh"
        factor = EMISSION_FACTORS["electricity"]
    else:
        unit = "km"
        factor = EMISSION_FACTORS["flight"]
        
    co2e = quantity * factor
    
    # Update raw_record model
    record.raw_record.raw_data = raw_record
    record.raw_record.save()
    
    # Update record
    record.value = quantity
    record.unit = unit
    record.co2e_kg = co2e
    record.review_status = 'PENDING'
    record.save()

    # Audit log
    try:
        AuditLog.objects.create(
            action='Corrected Emission Record',
            user='System Analyst',
            details=f'Record #{record.id} ({record.source_type} - {record.activity_type}) updated and reset to PENDING',
            ip_address=request.META.get('REMOTE_ADDR', '127.0.0.1'),
            status='Success'
        )
    except Exception as log_err:
        print(f"Failed to create audit log: {log_err}")
    
    # Clear existing validations
    ValidationIssue.objects.filter(emission_record=record).delete()
    
    # Re-run validation logic
    if quantity < 0:
        ValidationIssue.objects.create(
            emission_record=record,
            issue="Invalid electricity usage" if source_type == "Utility" else "Invalid quantity",
            severity="ERROR"
        )
    elif quantity == 0:
        ValidationIssue.objects.create(
            emission_record=record,
            issue="Zero electricity usage" if source_type == "Utility" else "Invalid quantity",
            severity="ERROR"
        )
        
    if unit == "":
        ValidationIssue.objects.create(
            emission_record=record,
            issue="Missing unit",
            severity="WARNING"
        )
        
    if source_type == "Travel":
        origin = raw_record.get("origin", "").strip()
        destination = raw_record.get("destination", "").strip()
        if not origin or len(origin) != 3 or not destination or len(destination) != 3:
            ValidationIssue.objects.create(
                emission_record=record,
                issue="Invalid origin or destination code",
                severity="ERROR"
            )

    serializer = EmissionRecordSerializer(record)
    return Response(serializer.data)

@api_view(['GET'])
def get_audit_logs(request):
    logs = AuditLog.objects.all().order_by('-created_at')
    serializer = AuditLogSerializer(logs, many=True)
    return Response(serializer.data)
