# Security Specification & Test Cases

This document defines the zero-trust security specification, data invariants, and adversarial payloads for GreenCare Hospital's Firestore Database.

## 1. System Invariants

1. **User Privacy**: A patient can only read and write their own User document. They cannot read or modify other users' documents.
2. **PII Protection**: Medical reports and appointments are strictly private. A patient can see only their own records.
3. **Admin Authority**: Admins can view and manage all appointments, reports, and doctors.
4. **Bootstrapped Admin**: The user signed under `josh.a.mens2016@gmail.com` serves as the initial system administrator.
5. **Immutable Identity**: Users cannot modify their `uid` or `role` once set, nor can they create their profiles with the 'admin' role directly unless approved.
6. **Temporal Consistency**: Action timestamps (like `createdAt` and `updatedAt`) must strictly match `request.time`. No back-dated or future-dated records generated on the client are allowed.
7. **Doctor Directories**: Doctor directory documents can be read by anyone (including unauthenticated visitors), but they are only writeable by administrators.

## 2. The "Dirty Dozen" Malicious Payloads

Here are twelve adversarial payloads designed to test and violate security rules, which must all be securely blocked with a `PERMISSION_DENIED` status.

### Threat Vector A: Privilege Escalation & Role Spoofing (Users Collection)

#### Payload 1: Self-Promoted Admin Profile
* **Target Path**: `users/attacker_uid`
* **Action**: `create`
* **Adversarial Payload**:
```json
{
  "uid": "attacker_uid",
  "email": "attacker@gmail.com",
  "displayName": "Intruder",
  "role": "admin",
  "phoneNumber": "555-0199",
  "createdAt": "2026-05-22T10:22:33Z"
}
```
* **Failure Outcome**: Attacker obtains full administrative capabilities over all patient reports and appointments.
* **Mitigation**: Rule mandates `incoming().role != 'admin'` unless user is recognized as a system bootstrapper, or requires explicit admin delegation.

#### Payload 2: Overwriting Identity (Role Update)
* **Target Path**: `users/patient_uid`
* **Action**: `update`
* **Adversarial Payload**:
```json
{
  "uid": "patient_uid",
  "email": "patient@gmail.com",
  "displayName": "Name Update",
  "role": "admin"
}
```
* **Failure Outcome**: A registered patient upgrades their own profile role to `admin`.
* **Mitigation**: Updates to the `role` field are strictly denied for non-admins using `affectedKeys().hasOnly(['displayName', 'phoneNumber', 'updatedAt'])`.

### Threat Vector B: Identity Spoofing & Relational Impersonation (Appointments & Reports)

#### Payload 3: Impersonating Patient ID
* **Target Path**: `appointments/appointment_abc`
* **Action**: `create`
* **Adversarial Payload**:
```json
{
  "id": "appointment_abc",
  "patientId": "victim_uid",
  "patientName": "Victim User",
  "patientEmail": "victim@gmail.com",
  "doctorId": "doctor_1",
  "doctorName": "Dr. Green",
  "doctorSpecialty": "Cardiology",
  "date": "2026-06-01",
  "timeSlot": "09:00 AM",
  "status": "pending"
}
```
* **Failure Outcome**: Attacker books an appointment on behalf of another user, creating spam or accessing medical time allocations under false credentials.
* **Mitigation**: Mandate that `incoming().patientId == request.auth.uid`.

#### Payload 4: Hijacking Existing Appointment
* **Target Path**: `appointments/victim_appointment`
* **Action**: `update`
* **Adversarial Payload**:
```json
{
  "id": "victim_appointment",
  "patientId": "attacker_uid",
  "patientName": "Attacker Name",
  "status": "confirmed"
}
```
* **Failure Outcome**: Attacker changes the patient identifier of an existing appointment to redirect the scheduling data to themselves.
* **Mitigation**: Mandate that `incoming().patientId == existing().patientId` (immutability check).

### Threat Vector C: State Shortcutting & Workflow Violation

#### Payload 5: Unilateral Self-Confirmation
* **Target Path**: `appointments/appointment_123`
* **Action**: `update` (by patient)
* **Adversarial Payload**:
```json
{
  "id": "appointment_123",
  "status": "confirmed"
}
```
* **Failure Outcome**: Patients confirm their own appointments without clinic review or approval.
* **Mitigation**: Patients are only allowed to update `reason`, `date`, `timeSlot` or set `status` to `cancelled`. They cannot change status to `confirmed` or `completed`.

#### Payload 6: Modifying Closed Terminal State
* **Target Path**: `appointments/completed_appointment`
* **Action**: `update`
* **Adversarial Payload**:
```json
{
  "id": "completed_appointment",
  "date": "2026-07-15",
  "timeSlot": "11:00 AM",
  "status": "pending"
}
```
* **Failure Outcome**: Users alter past, completed medical files or clinical history details.
* **Mitigation**: If `existing().status == 'completed'` or `existing().status == 'cancelled'`, reject further client-side modifications.

### Threat Vector D: Denial-of-Wallet & Resource Poisoning (Size/Bound Attackers)

#### Payload 7: Huge Payload String Injection
* **Target Path**: `reports/report_toxic`
* **Action**: `create`
* **Adversarial Payload**:
```json
{
  "id": "report_toxic",
  "patientId": "attacker_uid",
  "patientName": "Attacker",
  "title": "[100,000 characters of junk...]",
  "fileName": "report.pdf",
  "fileDataURL": "data:application/pdf;base64,JVBERi..."
}
```
* **Failure Outcome**: Storage costs or bandwidth spikes, exhausting quotas.
* **Mitigation**: Impose `.size() <= 100` on the `title` field, and size bounds on other text fields.

#### Payload 8: Path Variable Injection (Junk ID Attack)
* **Target Path**: `appointments/[massive-junk-variable-over-10k-characters]`
* **Action**: `create`
* **Adversarial Payload**: Valid booking data but hitting an insecure ID schema.
* **Failure Outcome**: Junk or infinite keys in database indexes, causing massive routing costs.
* **Mitigation**: ID path checks using `isValidId(id)`.

### Threat Vector E: PII Direct Scraping & Blanket Leakage

#### Payload 9: Blanket Querying (List All Patients)
* **Target Path**: `/users`
* **Action**: `list`
* **Request Context**: Signed in as a generic patient.
* **Failure Outcome**: Scraping all patients' names, emails, and phone numbers.
* **Mitigation**: Rules impose `resource.data.uid == request.auth.uid` on lists, or require admin authority.

#### Payload 10: Theft of Another User's Medical Report
* **Target Path**: `/reports/victim_report_id`
* **Action**: `get`
* **Request Context**: Signed in as a third-party non-owner patient.
* **Failure Outcome**: Direct leak of a patient's sensitive clinical reports and metadata.
* **Mitigation**: Directly validate that a report's `patientId == request.auth.uid` or user is admin.

### Threat Vector F: Time & Temporal Forgeries

#### Payload 11: Future/Past Back-Dating
* **Target Path**: `appointments/appointment_forged`
* **Action**: `create`
* **Adversarial Payload**:
```json
{
  "createdAt": "2015-01-01T00:00:00Z"
}
```
* **Failure Outcome**: Forging chronological records.
* **Mitigation**: Enforce `incoming().createdAt == request.time`.

#### Payload 12: Orphaned Relationship Injection
* **Target Path**: `appointments/appointment_orphaned`
* **Action**: `create`
* **Adversarial Payload**: Booking an appointment pointing to `doctorId: "non_existent_id"`.
* **Failure Outcome**: Database references break, causing application rendering loops.
* **Mitigation**: Ensure doctor exists on creation using `exists(/databases/$(database)/documents/doctors/$(incoming().doctorId))`.

---

## 3. Threat-Matrix Status & Validation Checks

| Target Collection | Identity Spoofing | State Shortcutting | Resource Poisoning | PII Leakage | Temporal Integrity |
|---|---|---|---|---|---|
| `/users` | Blocked via ID match | No state transitions | Guarded via schema size | Blocked via Split/Owner check | Enforced via server `request.time` |
| `/doctors` | Blocked (Admin only) | N/A | Blocked (Admin only) | Public catalog | N/A |
| `/appointments` | Blocked (patientId == auth.uid)| Blocked via `affectedKeys` | Bound checked string | Owner-only list checks | Enforced via `request.time` |
| `/reports` | Blocked (patientId == auth.uid) | N/A | Size validated data url | Strict owner read gates | Enforced via `request.time` |
