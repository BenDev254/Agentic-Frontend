import React from 'react';

interface PatientData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  age?: number;
  gender?: string;
  address?: string;
  blood_group?: string;
  allergies?: string;
  existing_conditions?: string;
}

interface Props {
  patient: PatientData | null;
  onBack: () => void; // callback to go back to the patient list
}

export default function PatientDataView({ patient, onBack }: Props) {
  if (!patient) {
    return <div className="loading-spinner">Select a patient to view details</div>;
  }

  const displayName = `${patient.first_name} ${patient.last_name}`;
  const avatarInitial = patient.first_name.charAt(0).toUpperCase();

  return (
    <div className="patient-view" >
      <div className="patient-header-card">
        <div className="patient-avatar-large">{avatarInitial}</div>
        <div>
          <h1>{displayName}</h1>
          <p>{patient.email}</p>
        </div>
      </div>

      <div className="patient-info-card">
        <h2>Patient Information</h2>
        <ul>
          {patient.age !== undefined && <li><strong>Age:</strong> {patient.age}</li>}
          {patient.gender && <li><strong>Gender:</strong> {patient.gender}</li>}
          {patient.phone && <li><strong>Phone:</strong> {patient.phone}</li>}
          {patient.address && <li><strong>Address:</strong> {patient.address}</li>}
          {patient.blood_group && <li><strong>Blood Group:</strong> {patient.blood_group}</li>}
          {patient.allergies && <li><strong>Allergies:</strong> {patient.allergies}</li>}
          {patient.existing_conditions && <li><strong>Existing Conditions:</strong> {patient.existing_conditions}</li>}
        </ul>
      </div>
    </div>
  );
}
