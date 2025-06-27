# MobileCDOHealth

**MobileCDOHealth** is a full-stack health record and billing management system designed to streamline medical reporting between **Center CDO-Health officers** and **Partner Hospitals**. It helps track child health records, verify identity at point of care, manage hospital bills, and analyze disease trends for informed decision-making.

---

## 🚀 Features

- 🧑‍⚕️ **Two User Roles**:
  - `CDO_HEALTH`: Adds children in the system, Manages children records, monitors bills, views disease analysis.
  - `HOSPITAL`: Verifies children, treats them after verifying, and submits medical reports with billing.
  
- 🧒 **Child Verification at Hospital**:
  - Hospital staff enter a child's number.
  - System checks if the child exists under that CDO’s center.
  - Profile photo verification ensures identity.

- 💊 **Treatment & Billing**:
  - Hospital logs treatment details and the hospital bill.
  - Bill appears on the CDO's dashboard and CDO as well receives an EMAIL about the bill info.

- 📊 **Analytics for CDO**:
  - Monthly and yearly bill totals.
  - Charts for disease frequency and trends by center.

---

## 🛠️ Tech Stack

### 🔹 Backend
- **Django** & **Django REST Framework (DRF)**
- PostgreSQL 

### 🔹 Frontend
- **React.js**
- Axios for API calls
- Chart libraries (e.g., Chart.js or Recharts for data visualization)

---

## ⚙️ System Flow

1. **CDO_HEALTH**:
   - Registers children at their center.
   - Can view children list, total bills, and disease trends,delete children,update children.

2. **HOSPITAL**:
   - Searches for a child by child number.
   - Verifies profile picture.
   - Provides treatment, Submits treatment details and bill.

3. **Dashboard**:
   - CDOs see a breakdown of:
     - Total bills this month/year
     - Most common diseases

---


