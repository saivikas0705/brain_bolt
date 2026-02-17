import crypto from 'crypto';
import mongoose from 'mongoose';
import { config } from '../config';
import { Question } from '../models/Question';

function hash(s: string): string {
  return crypto.createHash('sha256').update(s.trim().toLowerCase()).digest('hex');
}

const SEED_QUESTIONS: Array<{ difficulty: number; prompt: string; choices: string[]; correct: string }> = [
  { difficulty: 1, prompt: 'What is 2 + 2?', choices: ['3', '4', '5', '6'], correct: '4' },
  { difficulty: 1, prompt: 'Capital of France?', choices: ['London', 'Berlin', 'Paris', 'Madrid'], correct: 'Paris' },
  { difficulty: 1, prompt: 'Largest planet in our solar system?', choices: ['Earth', 'Mars', 'Jupiter', 'Saturn'], correct: 'Jupiter' },
  { difficulty: 2, prompt: 'What is 15% of 200?', choices: ['20', '30', '25', '35'], correct: '30' },
  { difficulty: 2, prompt: 'Who wrote Romeo and Juliet?', choices: ['Dickens', 'Shakespeare', 'Austen', 'Orwell'], correct: 'Shakespeare' },
  { difficulty: 2, prompt: 'Atomic number of Carbon?', choices: ['6', '12', '8', '14'], correct: '6' },
  { difficulty: 3, prompt: 'Solve: 3x + 7 = 22', choices: ['x = 4', 'x = 5', 'x = 6', 'x = 7'], correct: 'x = 5' },
  { difficulty: 3, prompt: 'In which year did WWII end?', choices: ['1943', '1944', '1945', '1946'], correct: '1945' },
  { difficulty: 3, prompt: 'What is the speed of light in m/s (approx)?', choices: ['3e6', '3e8', '3e10', '3e12'], correct: '3e8' },
  { difficulty: 4, prompt: 'Derivative of x^3?', choices: ['x^2', '2x^2', '3x^2', '3x'], correct: '3x^2' },
  { difficulty: 4, prompt: 'Which is a prime number?', choices: ['49', '51', '53', '57'], correct: '53' },
  { difficulty: 4, prompt: 'Hex color for white?', choices: ['#000000', '#FFFFFF', '#FFFF00', '#FF0000'], correct: '#FFFFFF' },
  { difficulty: 5, prompt: 'Integral of 1/x dx?', choices: ['x^2', 'ln|x|', '1/x^2', 'e^x'], correct: 'ln|x|' },
  { difficulty: 5, prompt: 'First programming language?', choices: ['C', 'Fortran', 'COBOL', 'Assembly'], correct: 'Fortran' },
  { difficulty: 5, prompt: 'TCP port for HTTPS?', choices: ['80', '443', '8080', '22'], correct: '443' },
  { difficulty: 6, prompt: 'Time complexity of binary search?', choices: ['O(n)', 'O(log n)', 'O(n^2)', 'O(1)'], correct: 'O(log n)' },
  { difficulty: 6, prompt: 'What does API stand for?', choices: ['Application Program Interface', 'Application Programming Interface', 'Applied Program Interface', 'Automated Programming Interface'], correct: 'Application Programming Interface' },
  { difficulty: 6, prompt: 'React is maintained by?', choices: ['Google', 'Microsoft', 'Meta', 'Amazon'], correct: 'Meta' },
  { difficulty: 7, prompt: 'Big-O of merge sort?', choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(log n)'], correct: 'O(n log n)' },
  { difficulty: 7, prompt: 'Which is not a NoSQL DB?', choices: ['MongoDB', 'Redis', 'PostgreSQL', 'Cassandra'], correct: 'PostgreSQL' },
  { difficulty: 7, prompt: 'HTTP method for creating a resource?', choices: ['GET', 'PUT', 'POST', 'DELETE'], correct: 'POST' },
  { difficulty: 8, prompt: 'CAP theorem: which two can you have?', choices: ['CP', 'AP', 'CA', 'All three'], correct: 'CP' },
  { difficulty: 8, prompt: 'Docker uses which isolation?', choices: ['VMs', 'Containers', 'Chroot only', 'Namespaces only'], correct: 'Containers' },
  { difficulty: 8, prompt: 'GraphQL was created by?', choices: ['Google', 'Facebook', 'Netflix', 'Twitter'], correct: 'Facebook' },
  { difficulty: 9, prompt: 'Kubernetes was originally designed by?', choices: ['Microsoft', 'Google', 'Amazon', 'Red Hat'], correct: 'Google' },
  { difficulty: 9, prompt: 'Eventual consistency is associated with?', choices: ['ACID', 'BASE', 'SQL', 'CAP'], correct: 'BASE' },
  { difficulty: 9, prompt: 'Which is a monotonic clock?', choices: ['Date.now()', 'performance.now()', 'setTimeout', 'setInterval'], correct: 'performance.now()' },
  { difficulty: 10, prompt: 'CRDT stands for?', choices: ['Conflict-free Replicated Data Type', 'Consistent Replicated Data Type', 'Concurrent Replicated Data Type', 'Causal Replicated Data Type'], correct: 'Conflict-free Replicated Data Type' },
  { difficulty: 10, prompt: 'Raft consensus: how many nodes for fault tolerance 1?', choices: ['2', '3', '4', '5'], correct: '3' },
  { difficulty: 10, prompt: 'Paxos was proposed by?', choices: ['Leslie Lamport', 'Barbara Liskov', 'Leslie Valiant', 'Butler Lampson'], correct: 'Leslie Lamport' },
];

async function seed() {
  await mongoose.connect(config.mongoUri);
  for (const q of SEED_QUESTIONS) {
    await Question.findOneAndUpdate(
      { prompt: q.prompt, difficulty: q.difficulty },
      {
        difficulty: q.difficulty,
        prompt: q.prompt,
        choices: q.choices,
        correctAnswerHash: hash(q.correct),
        tags: [],
      },
      { upsert: true }
    );
  }
  console.log('Seeded', SEED_QUESTIONS.length, 'questions');
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
