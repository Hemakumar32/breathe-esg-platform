# SOURCES.md

## SAP Research

I researched common SAP export approaches including:
- flat-file CSV exports
- IDoc structures
- OData services

I selected CSV exports because they are common in operational sustainability workflows where teams manually export datasets for reporting.

**The sample SAP data includes:**
- fuel quantities
- procurement activities
- inconsistent units
- mixed naming conventions

**Real-world deployment risks:**
- localization issues
- inconsistent plant mappings
- malformed exports
- unit inconsistencies

---

## Utility Data Research

I researched how facilities teams typically retrieve electricity usage data.

**Common approaches:**
- portal CSV exports
- PDF invoices
- utility APIs

I selected CSV exports because they are common and easier to normalize within prototype constraints.

**Sample utility data includes:**
- billing periods
- kWh usage
- meter identifiers
- missing readings

**Real-world deployment risks:**
- tariff complexity
- overlapping billing cycles
- estimated meter readings
- inconsistent utility formats

---

## Travel Platform Research

I reviewed documentation and examples from:
- Concur
- Navan
- corporate travel management systems

**Common travel fields:**
- origin airport
- destination airport
- travel class
- hotel nights
- transport categories

**Sample travel data includes:**
- flights
- hotels
- ground transport
- airport code handling

**Real-world deployment risks:**
- missing distances
- duplicate trips
- inconsistent category mappings
- API rate limits

---

## General Observations

Across all sources, the primary challenge is not emissions calculation itself, but:
- inconsistent formats
- missing data
- unit normalization
- auditability
- analyst review workflows

The prototype was designed around these operational realities.
