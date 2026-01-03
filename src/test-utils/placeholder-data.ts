/**
 * @fileoverview Placeholder data for examples and tests
 * @module test-utils/placeholder-data
 * @version 1.0.0
 *
 * @description
 * Provides generic placeholder data for use in Storybook stories, tests, and documentation.
 * Use these constants instead of real hospital, patient, or staff data.
 *
 * @example
 * ```typescript
 * import { PLACEHOLDER } from './test-utils/placeholder-data'
 *
 * const schema = {
 *   header: {
 *     hospital: PLACEHOLDER.hospital.name,
 *     department: PLACEHOLDER.hospital.department,
 *   }
 * }
 * ```
 */

/**
 * Placeholder data constants for examples and tests.
 * Use these constants instead of real data to ensure privacy and internationalization.
 */
export const PLACEHOLDER = {
  /**
   * Hospital and facility information
   */
  hospital: {
    /** Generic hospital name */
    name: 'Sample Hospital',
    /** Alternative hospital name */
    nameAlt: 'Demo Medical Center',
    /** Postpartum care department */
    department: 'Postpartum Care Center',
    /** Alternative department name */
    departmentAlt: 'Mother & Baby Recovery Unit',
    /** Delivery hospital */
    deliveryHospital: 'City Medical Center',
  },

  /**
   * Patient information
   */
  patient: {
    /** Female patient name */
    name: 'Jane Doe',
    /** Male patient name */
    nameMale: 'John Doe',
    /** Baby name */
    babyName: 'Baby Doe',
    /** Alternative baby name */
    babyNameAlt: 'Baby Smith',
  },

  /**
   * Staff information
   */
  staff: {
    /** Nurse name */
    nurse: 'Nurse Smith',
    /** Alternative nurse name */
    nurseAlt: 'Nurse Johnson',
    /** Third nurse name */
    nurseThird: 'Nurse Williams',
    /** Head nurse name */
    headNurse: 'Head Nurse Johnson',
    /** Doctor name */
    doctor: 'Dr. Williams',
  },

  /**
   * Location information
   */
  location: {
    /** City name */
    city: 'Sample City',
    /** Address */
    address: '123 Medical Drive',
    /** Birthplace */
    birthplace: 'Sample City',
  },

  /**
   * Common form values
   */
  form: {
    /** Room number */
    roomNumber: '301',
    /** Bed number */
    bedNumber: '1',
    /** Hospital number */
    hospitalNumber: '2024010001',
    /** Blood type */
    bloodType: 'A+',
  },

  /**
   * Watermark text
   */
  watermark: {
    /** Internal use only */
    internal: 'Internal Use Only',
    /** Draft */
    draft: 'DRAFT',
    /** Confidential */
    confidential: 'CONFIDENTIAL',
  },
} as const

/**
 * Type for the placeholder data structure
 */
export type PlaceholderData = typeof PLACEHOLDER

/**
 * Sample maternal admission data for stories and tests
 */
export const SAMPLE_MATERNAL_DATA = {
  roomNumber: PLACEHOLDER.form.roomNumber,
  hospitalNumber: PLACEHOLDER.form.hospitalNumber,
  admissionTime: '2024-01-15T10:30:00',
  name: PLACEHOLDER.patient.name,
  age: 28,
  bloodType: PLACEHOLDER.form.bloodType,
  birthplace: PLACEHOLDER.location.birthplace,
  deliveryHospital: PLACEHOLDER.hospital.deliveryHospital,
  deliveryDate: '2024-01-10',
  deliveryMethod: 'C-section',
  temperature: 36.5,
  pulse: 72,
  respiration: 18,
  bloodPressure: '120/80',
  weight: 55,
  allergies: ['none'],
  medicalHistory: ['none'],
  assessment:
    'Patient in good general condition, alert and oriented. Post C-section day 5, incision healing well with no redness or discharge. Breasts full, milk production normal. Lochia minimal, light red.',
  nurseSignature: PLACEHOLDER.staff.nurse,
  headNurseSignature: PLACEHOLDER.staff.headNurse,
} as const

/**
 * Sample newborn nursing data for stories and tests
 */
export const SAMPLE_NEWBORN_DATA = {
  roomNumber: PLACEHOLDER.form.roomNumber,
  bedNumber: PLACEHOLDER.form.bedNumber,
  babyName: PLACEHOLDER.patient.babyName,
  gender: 'Male',
  birthDate: '2024-01-10',
  birthWeight: 3250,
  motherName: PLACEHOLDER.patient.name,
  hospitalNumber: PLACEHOLDER.form.hospitalNumber,
  nursingRecords: [
    {
      date: '2024-01-15',
      time: '08:00',
      temperature: 36.8,
      weight: 3300,
      feeding: 'Breastfeeding',
      urination: 'Normal',
      defecation: 'Normal',
      skinCondition: 'Good',
      umbilicalCord: 'Dry',
      nurse: PLACEHOLDER.staff.nurse,
    },
    {
      date: '2024-01-15',
      time: '14:00',
      temperature: 36.7,
      weight: 3300,
      feeding: 'Breastfeeding',
      urination: 'Normal',
      defecation: 'Normal',
      skinCondition: 'Good',
      umbilicalCord: 'Dry',
      nurse: PLACEHOLDER.staff.nurseAlt,
    },
    {
      date: '2024-01-15',
      time: '20:00',
      temperature: 36.9,
      weight: 3310,
      feeding: 'Breast + Formula',
      urination: 'Normal',
      defecation: 'Normal',
      skinCondition: 'Good',
      umbilicalCord: 'Dry',
      nurse: PLACEHOLDER.staff.nurseThird,
    },
  ],
  specialConditions: ['none'],
  nursingNotes: 'Newborn in good general condition, feeding well, sleeping soundly.',
  nurseSignature: PLACEHOLDER.staff.nurse,
  headNurseSignature: PLACEHOLDER.staff.headNurse,
} as const

/**
 * Sample daily log data for stories and tests
 */
export const SAMPLE_DAILY_LOG_DATA = {
  roomNumber: PLACEHOLDER.form.roomNumber,
  bedNumber: PLACEHOLDER.form.bedNumber,
  name: PLACEHOLDER.patient.name,
  hospitalNumber: PLACEHOLDER.form.hospitalNumber,
  postpartumDays: 5,
  deliveryMethod: 'C-section',
  recordDate: '2024-01-15',
  vitalSigns: [
    {
      time: '08:00',
      temperature: 36.5,
      pulse: 72,
      respiration: 18,
      bloodPressure: '120/80',
      nurse: PLACEHOLDER.staff.nurse,
    },
    {
      time: '14:00',
      temperature: 36.6,
      pulse: 74,
      respiration: 18,
      bloodPressure: '118/78',
      nurse: PLACEHOLDER.staff.nurseAlt,
    },
    {
      time: '20:00',
      temperature: 36.7,
      pulse: 70,
      respiration: 17,
      bloodPressure: '122/82',
      nurse: PLACEHOLDER.staff.nurseThird,
    },
  ],
  lochia: ['serous', 'normal', 'noOdor'],
  breast: ['soft', 'normal'],
  wound: ['healing'],
  nursingMeasures:
    '1. Guided patient on correct breastfeeding position\n2. Assisted patient with turning and mobility\n3. Changed wound dressing, healing well\n4. Provided emotional support, patient mood stable',
  nurseSignature: PLACEHOLDER.staff.nurse,
  headNurseSignature: PLACEHOLDER.staff.headNurse,
} as const

/**
 * Sample discharge assessment data for stories and tests
 */
export const SAMPLE_DISCHARGE_DATA = {
  roomNumber: PLACEHOLDER.form.roomNumber,
  hospitalNumber: PLACEHOLDER.form.hospitalNumber,
  name: PLACEHOLDER.patient.name,
  age: 28,
  admissionDate: '2024-01-15',
  dischargeDate: '2024-01-22',
  stayDays: 7,
  deliveryMethod: 'C-section',
  temperature: 36.5,
  pulse: 72,
  respiration: 18,
  bloodPressure: '120/80mmHg',
  weight: 52,
  uterusRecovery: 'Good',
  lochiaStatus: 'Minimal, light red',
  woundHealing: 'Healing well',
  breastCondition: ['soft', 'normal'],
  feedingMethod: ['breastfeeding'],
  dischargeGuidance: `1. Get adequate rest and ensure sufficient sleep
2. Maintain balanced diet with high protein and vitamins
3. Keep incision clean and dry, seek medical attention if redness or discharge occurs
4. Continue breastfeeding on demand
5. Schedule 42-day postpartum checkup
6. Seek medical attention immediately if fever or abnormal lochia occurs`,
  nurseSignature: PLACEHOLDER.staff.nurse,
  headNurseSignature: PLACEHOLDER.staff.headNurse,
  patientSignature: PLACEHOLDER.patient.name,
} as const
