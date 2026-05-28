# Supported Source Formats

The platform currently accepts three types of CSV uploads. The column headers must exactly match the formats below.

### 1. SAP Fuel/Procurement (`SAP`)
Used for Scope 1 direct fuel combustion emissions.
*   `plant` (String)
*   `fuel_type` (String) - Expected: Diesel, Petrol, Natural Gas
*   `quantity` (Number)
*   `unit` (String)

### 2. Utility Electricity (`UTILITY`)
Used for Scope 2 indirect electricity emissions.
*   `meter_id` (String)
*   `kwh` (Number) - Total energy consumed
*   `billing_start` (Date)
*   `billing_end` (Date)

### 3. Corporate Travel (`TRAVEL`)
Used for Scope 3 business travel emissions.
*   `employee` (String)
*   `mode` (String) - Expected: Flight, Train, Car
*   `distance` (Number) - Distance in kilometers
