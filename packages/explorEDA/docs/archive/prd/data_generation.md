# Product Requirement Document: CSV Data Generator CLI

## Objective

Develop a Node.js Command Line Interface (CLI) tool that generates mock CSV data files. The tool should generate large datasets with varying row and column counts, supporting multiple types of data to facilitate testing and experiments.

## Stakeholders

- Product Managers
- Developers
- Quality Assurance
- Data Scientists

## Background and Strategic Fit

The ability to generate mock CSV data with high row and column counts is valuable for developers and data scientists who need to perform load testing, algorithm validation, and feature testing. This tool aims to provide a flexible, customizable way to generate varied data types in CSV format quickly.

## Functional Requirements

### 1. Data Size & Columns

- The tool should allow users to specify row counts: 1,000; 10,000; 100,000; and 1,000,000.
- The tool should allow users to specify column counts: 5, 10, 20, and 50.

### 2. Data Types

The tool should support generating the following data types:

#### 2.1 Categorical Data

- Generate random strings or selection from predefined categories.

#### 2.2 Numerical Data

- Generate integers or floating-point numbers within specified ranges.

#### 2.3 Mixed Data

- Combine multiple data types (categorical + numerical).

#### 2.4 Time Series Data

- Generate sequential timestamps over a specified period with customizable intervals (minute, hour, day).
- A subset of the dataset should use time as the primary column. This column should support multiple formats, including:
  - Epoch time (seconds since 1 January 1970)
  - ISO 8601 format (e.g., "2023-01-01T00:00:00Z")
  - Excel date-time format (e.g., number of days since 30 December 1899)

#### 2.5 Geospatial Data

- Generate random latitude and longitude values.

#### 2.6 Correlated Data

- Use sample functions to generate data where columns have correlations to test specific rule-based logic.

### 3. Command Line Interface

- Accept command-line arguments to customize data scales (e.g., row and column count) and data types.
- Example CLI command: `node csv-generator.js --rows=10000 --columns=20 --datatype="time-series,numerical"`

### 4. Output

- Generate CSV files with the specified configuration.
- Allow the user to specify output file location and name.

## Non-Functional Requirements

### 1. Performance

- The tool should generate the maximum specified data sizes within a reasonable time frame (under 2 minutes for 1 million rows with 50 columns).

### 2. Usability

- Command-line options should be intuitive and well-documented.
- Provide error messages and usage help for invalid command-line arguments.

## Technical Requirements

- Use Node.js for tool development.
- CSV parsing library: `csv-writer` or similar.
- CLI Argument parsing library: `commander`, `yargs` or similar.
- Version control: Git

## Constraints

- Tool must be compatible with Node.js LTS versions.
- Should not make use of external APIs for data generation to ensure no rate limits or downtime affect tool usability.

## Risks

- Performance issues with huge datasets.
- Ensuring randomness and proper distribution in generated data.

## Milestones

1. Approval of PRD Document
2. Basic CLI Setup and Initial Development
3. Implementation of Data Type Generators
4. Input Validation and Error Messages
5. QA Testing & Quality Assurance
6. Release and Documentation

## Deliverables

- Source code of the CLI
- CLI documentation and usage guide
- Test cases and QA report
