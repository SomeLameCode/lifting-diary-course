import 'dotenv/config';
import { db } from '@/src/db';
import { exerciseCatalog } from '@/src/db/schema';

const exercises = [
  // Chest
  { name: 'Bench Press', muscleGroup: 'chest' },
  { name: 'Incline Bench Press', muscleGroup: 'chest' },
  { name: 'Decline Bench Press', muscleGroup: 'chest' },
  { name: 'Dumbbell Flyes', muscleGroup: 'chest' },
  { name: 'Push-Up', muscleGroup: 'chest' },
  { name: 'Chest Dip', muscleGroup: 'chest' },

  // Back
  { name: 'Deadlift', muscleGroup: 'back' },
  { name: 'Barbell Row', muscleGroup: 'back' },
  { name: 'Pull-Up', muscleGroup: 'back' },
  { name: 'Chin-Up', muscleGroup: 'back' },
  { name: 'Lat Pulldown', muscleGroup: 'back' },
  { name: 'Seated Cable Row', muscleGroup: 'back' },
  { name: 'T-Bar Row', muscleGroup: 'back' },
  { name: 'Face Pull', muscleGroup: 'back' },

  // Legs
  { name: 'Squat', muscleGroup: 'legs' },
  { name: 'Front Squat', muscleGroup: 'legs' },
  { name: 'Romanian Deadlift', muscleGroup: 'legs' },
  { name: 'Leg Press', muscleGroup: 'legs' },
  { name: 'Leg Curl', muscleGroup: 'legs' },
  { name: 'Leg Extension', muscleGroup: 'legs' },
  { name: 'Calf Raise', muscleGroup: 'legs' },
  { name: 'Bulgarian Split Squat', muscleGroup: 'legs' },
  { name: 'Lunges', muscleGroup: 'legs' },
  { name: 'Hip Thrust', muscleGroup: 'legs' },

  // Shoulders
  { name: 'Overhead Press', muscleGroup: 'shoulders' },
  { name: 'Dumbbell Shoulder Press', muscleGroup: 'shoulders' },
  { name: 'Lateral Raise', muscleGroup: 'shoulders' },
  { name: 'Front Raise', muscleGroup: 'shoulders' },
  { name: 'Rear Delt Fly', muscleGroup: 'shoulders' },
  { name: 'Arnold Press', muscleGroup: 'shoulders' },

  // Arms
  { name: 'Barbell Curl', muscleGroup: 'arms' },
  { name: 'Dumbbell Curl', muscleGroup: 'arms' },
  { name: 'Hammer Curl', muscleGroup: 'arms' },
  { name: 'Preacher Curl', muscleGroup: 'arms' },
  { name: 'Concentration Curl', muscleGroup: 'arms' },
  { name: 'Tricep Pushdown', muscleGroup: 'arms' },
  { name: 'Skull Crusher', muscleGroup: 'arms' },
  { name: 'Close-Grip Bench Press', muscleGroup: 'arms' },
  { name: 'Tricep Dip', muscleGroup: 'arms' },

  // Core
  { name: 'Plank', muscleGroup: 'core' },
  { name: 'Crunch', muscleGroup: 'core' },
  { name: 'Russian Twist', muscleGroup: 'core' },
  { name: 'Leg Raise', muscleGroup: 'core' },
  { name: 'Cable Crunch', muscleGroup: 'core' },
  { name: 'Ab Wheel Rollout', muscleGroup: 'core' },
  { name: 'Hanging Leg Raise', muscleGroup: 'core' },
];

async function seed() {
  console.log(`Seeding ${exercises.length} exercises...`);

  await db.insert(exerciseCatalog).values(exercises).onConflictDoNothing();

  console.log(`Done. ${exercises.length} exercises seeded.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
