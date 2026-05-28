import pandas as pd
from .models import DataSource, RawRecord, EmissionRecord, ValidationIssue
import json

def process_csv_upload(source_type, file_obj, filename):
    # Create DataSource
    datasource = DataSource.objects.create(source_type=source_type, file_name=filename)
    
    # Read CSV
    df = pd.read_csv(file_obj)
    
    # Process rows
    for index, row in df.iterrows():
        raw_data = json.loads(row.to_json())
        
        # Save RawRecord
        raw_record = RawRecord.objects.create(
            datasource=datasource,
            raw_data=raw_data,
            status='PROCESSED'
        )
        
        # Normalize & Calculate Emission
        emission_data = normalize_and_calculate(source_type, raw_data)
        
        if emission_data:
            emission_record = EmissionRecord.objects.create(
                raw_record=raw_record,
                source_type=source_type,
                **emission_data
            )
            # Run Validations
            run_validations(emission_record)

def normalize_and_calculate(source_type, raw_data):
    if source_type == 'SAP':
        fuel_type = str(raw_data.get('fuel_type', '')).lower()
        quantity = float(raw_data.get('quantity', 0)) if pd.notna(raw_data.get('quantity')) else 0
        unit = str(raw_data.get('unit', ''))
        
        factor = 2.68 if 'diesel' in fuel_type else 2.31
        co2e_kg = quantity * factor
        
        return {
            'activity_type': 'Fuel Combustion',
            'scope': 1,
            'value': quantity,
            'unit': unit,
            'co2e_kg': co2e_kg
        }
        
    elif source_type == 'UTILITY':
        kwh = float(raw_data.get('kwh', 0)) if pd.notna(raw_data.get('kwh')) else 0
        factor = 0.72
        co2e_kg = kwh * factor
        
        return {
            'activity_type': 'Electricity Consumption',
            'scope': 2,
            'value': kwh,
            'unit': 'kWh',
            'co2e_kg': co2e_kg
        }
        
    elif source_type == 'TRAVEL':
        distance = float(raw_data.get('distance', 0)) if pd.notna(raw_data.get('distance')) else 0
        factor = 0.18
        co2e_kg = distance * factor
        
        return {
            'activity_type': 'Business Travel',
            'scope': 3,
            'value': distance,
            'unit': 'km',
            'co2e_kg': co2e_kg
        }
    return None

def run_validations(record):
    issues = []
    # 1. Negative quantity
    if record.value < 0:
        issues.append({'issue': 'Quantity is negative', 'severity': 'ERROR'})
    
    # 2. Missing units
    if not record.unit or str(record.unit).strip().lower() == 'nan':
        issues.append({'issue': 'Missing unit', 'severity': 'WARNING'})
        
    # 3. Invalid airport code (simulation for travel)
    if record.source_type == 'TRAVEL':
        raw_data = record.raw_record.raw_data
        mode = str(raw_data.get('mode', '')).lower()
        if mode not in ['flight', 'train', 'car']:
             issues.append({'issue': f"Unrecognized travel mode: {mode}", 'severity': 'WARNING'})
             
    # 4. Zero electricity usage
    if record.source_type == 'UTILITY' and record.value == 0:
        issues.append({'issue': 'Electricity usage is zero', 'severity': 'ERROR'})
        
    for issue in issues:
        ValidationIssue.objects.create(
            emission_record=record,
            issue=issue['issue'],
            severity=issue['severity']
        )
