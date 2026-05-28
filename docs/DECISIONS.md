# Engineering Decisions

1.  **Strict Separation of Raw and Canonical Data**:
    *   *Decision*: We store the exact original row as a JSON blob in `RawRecord` and extract the normalized data into `EmissionRecord`.
    *   *Rationale*: In enterprise ESG systems, source data often contains errors or undocumented fields. Retaining the exact raw data is a strict requirement for financial-grade auditing. If calculation factors change in the future, we have the original data to recalculate.

2.  **Synchronous Processing**:
    *   *Decision*: The CSV parsing and calculation run synchronously during the API request.
    *   *Rationale*: For a 2-day prototype and small files (under 10MB), this is sufficient. Introducing Celery or Redis for background processing would violate the "Do NOT overengineer" constraint.

3.  **Validation Issue Normalization**:
    *   *Decision*: Validation failures do not block the row from being saved. Instead, they are saved as related `ValidationIssue` rows.
    *   *Rationale*: This allows users to review errors in context within the dashboard, rather than receiving a massive error text file upon upload. It matches modern SaaS patterns where users correct data post-ingestion.

4.  **Tailwind CSS for UI**:
    *   *Decision*: Used Tailwind CSS and Lucide Icons without a heavy component library.
    *   *Rationale*: Provides the fastest way to build a "modern, clean, SaaS dashboard" without the boilerplate of Material-UI or Ant Design.
