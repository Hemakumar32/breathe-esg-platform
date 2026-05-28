# Data Model

## Canonical Emissions Model

The platform standardizes ingested data from multiple disparate sources into a single canonical model: `EmissionRecord`.

### Core Fields

*   **`source_type`**: The origin of the data (e.g., `SAP`, `UTILITY`, `TRAVEL`). Provides high-level traceability.
*   **`activity_type`**: A standardized classification of the emission-generating activity (e.g., `Fuel Combustion`, `Electricity Consumption`, `Business Travel`).
*   **`scope`**: The GHG Protocol Scope (1, 2, or 3) indicating whether the emissions are direct or indirect.
*   **`value`**: The quantitative measure of the activity (e.g., quantity of fuel, kWh, distance traveled).
*   **`unit`**: The unit of measurement for the `value`.
*   **`co2e_kg`**: The final calculated carbon dioxide equivalent emissions in kilograms.

### Traceability and Auditability

*   **`raw_record_id`**: A foreign key to the `RawRecord` table. This is critical for auditing. It allows an analyst to trace any finalized emission calculation back to the exact JSON row that was imported from the CSV.
*   **`review_status`**: Tracks the workflow state (`PENDING`, `APPROVED`, `REJECTED`). Once `APPROVED`, the record is conceptually locked for reporting.
