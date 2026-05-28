# Tradeoffs

1.  **No Authentication / Authorization**:
    *   *Tradeoff*: The API and frontend are completely open.
    *   *Why*: Explicitly excluded in the project requirements to focus purely on the ingestion and review domain. In production, Django Rest Framework Token Authentication or JWTs would be required.

2.  **Hardcoded Emission Factors**:
    *   *Tradeoff*: Factors (e.g., diesel = 2.68) are hardcoded in `services.py`.
    *   *Why*: In a real system, these would be pulled from an external API (like EPA, DEFRA, or an internal Emission Factor database) and matched dynamically based on date and geography. Building an Emission Factor management UI was deemed out of scope for the time limit.

3.  **Missing Pagination**:
    *   *Tradeoff*: The `/api/records/` endpoint returns all records.
    *   *Why*: Simplifies the frontend React table implementation. For realistic data volumes, DRF `PageNumberPagination` should be enabled.

4.  **No Bulk Approval**:
    *   *Tradeoff*: Analysts must approve records one by one.
    *   *Why*: Kept the UI simple. Bulk actions require more complex state management in React.
