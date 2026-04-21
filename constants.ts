import { Patient, Exercise, InjuryProfile } from './types';

// Real public video assets for clinical demonstration
const SAMPLE_VIDEOS = {
  wrist: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  knee: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  shoulder: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'
};

export const VERIFIED_PHYSIOS: Record<string, { name: string; id: string }> = {
  'PT-88321': { name: 'Dr. Shrikant Tiwari', id: 'PHY-1001' },
  'PT-99402': { name: 'Dr. Sarah Connor', id: 'PHY-2022' }
};

export const INJURY_LIBRARY: Record<string, InjuryProfile> = {
  'wrist_post_cast': {
    id: 'wrist_post_cast',
    name: 'Distal Radius Fracture (Post-Cast)',
    description: 'Rehabilitation following immobilization for wrist fracture.',
    typicalRecoveryWeeks: 8,
    expectedMilestones: ['Week 1: 30° flexion', 'Week 3: 50% ROM', 'Week 8: Full Load']
  },
  'acl_rehab': {
    id: 'acl_rehab',
    name: 'ACL Reconstruction (Post-Op)',
    description: 'Standard protocol for anterior cruciate ligament reconstruction.',
    typicalRecoveryWeeks: 24,
    expectedMilestones: ['Week 2: 90° flexion', 'Week 12: Jogging']
  },
  'frozen_shoulder': {
      id: 'frozen_shoulder',
      name: 'Adhesive Capsulitis (Frozen Shoulder)',
      description: 'Focus on gradual stretching to restore range of motion.',
      typicalRecoveryWeeks: 12,
      expectedMilestones: ['Week 2: Pain reduction', 'Week 12: Overhead reach']
  }
};

export const WRIST_EXERCISES: Exercise[] = [{ id: 'w1', name: 'Wrist Flexion', targetReps: 15, targetRom: 45, instructions: 'Move hand up and down.' }];
export const KNEE_EXERCISES: Exercise[] = [{ id: 'k1', name: 'Heel Slides', targetReps: 10, targetRom: 110, instructions: 'Slide heel towards buttocks.' }];
export const SHOULDER_EXERCISES: Exercise[] = [{ id: 's1', name: 'Wall Crawl', targetReps: 8, targetRom: 120, instructions: 'Walk fingers up wall.' }];

export const MD_EXERCISES: Exercise[] = [
  { id: 'md1', name: 'Isometric Quad Push', targetReps: 10, targetRom: 0, instructions: 'Press back of knee into bed.', isLowImpact: true },
  { id: 'md2', name: 'Ankle Pumps', targetReps: 20, targetRom: 30, instructions: 'Push foot up and down slowly.', isLowImpact: true },
  { id: 'md3', name: 'Seated Arm Lift', targetReps: 8, targetRom: 90, instructions: 'Gently lift arm to shoulder height.', isLowImpact: true }
];

export const PROTOCOL_MAPPING: Record<string, { exercises: Exercise[], benchmarks: number[] }> = {
    'wrist_post_cast': { exercises: WRIST_EXERCISES, benchmarks: [15, 25, 35, 45, 55, 65, 75] },
    'acl_rehab': { exercises: KNEE_EXERCISES, benchmarks: [45, 60, 75, 90, 100, 110, 120] },
    'frozen_shoulder': { exercises: SHOULDER_EXERCISES, benchmarks: [30, 45, 60, 80, 100, 130, 150] },
    'md_standard': { exercises: MD_EXERCISES, benchmarks: [0, 0, 0, 0, 0, 0, 0] }
};

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'p1',
    name: 'Ishaan',
    age: 24,
    email: 'ishaan.demo@example.com',
    physioName: 'Dr. Shrikant Tiwari',
    injury: 'Right Wrist Fracture',
    injuryType: 'wrist_post_cast',
    startDate: '2023-11-01',
    status: 'On Track',
    prescribedExercises: WRIST_EXERCISES,
    benchmarkRom: [15, 25, 35, 45, 55, 65, 75],
    logs: [
      { id: 'l1', date: '2023-11-02', painScore: 7, maxRom: 15, repsCompleted: 5, videoUrl: SAMPLE_VIDEOS.wrist },
      { id: 'l2', date: '2023-11-05', painScore: 6, maxRom: 20, repsCompleted: 8, videoUrl: SAMPLE_VIDEOS.wrist },
      { id: 'l3', date: '2023-11-09', painScore: 5, maxRom: 35, repsCompleted: 10, videoUrl: SAMPLE_VIDEOS.wrist }
    ],
    weeklyReports: [],
    mode: 'Standard'
  },
  {
    id: 'p2',
    name: 'Rahul Verma',
    age: 32,
    email: 'rahul.v@example.com',
    physioName: 'Dr. Shrikant Tiwari',
    injury: 'ACL Reconstruction',
    injuryType: 'acl_rehab',
    startDate: '2023-10-15',
    status: 'Behind',
    prescribedExercises: KNEE_EXERCISES,
    benchmarkRom: [45, 60, 75, 90],
    logs: [
      { id: 'l6', date: '2023-10-16', painScore: 8, maxRom: 40, repsCompleted: 8, videoUrl: SAMPLE_VIDEOS.knee }
    ],
    weeklyReports: [],
    mode: 'Standard'
  }
];
