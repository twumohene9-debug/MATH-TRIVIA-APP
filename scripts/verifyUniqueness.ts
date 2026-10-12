import { getBlockQuestions } from '../src/engine/questionBank';

console.log('Testing question generation for all 100 stages...');

let totalQuestions = 0;
let duplicatesFound = 0;

for (let s = 1; s <= 100; s++) {
  // Test blocks 1 through 5 with retries for stage s
  for (let b = 1; b <= 5; b++) {
    for (let r = 0; r <= 1; r++) {
      const questions = getBlockQuestions({
        stageId: s,
        levelId: 1,
        blockId: b,
        retryAttempt: r,
        customQuestions: [],
        recentQuestionIds: [],
      });

      if (questions.length !== 10) {
        console.error(`Stage ${s} Block ${b} Retry ${r} only generated ${questions.length} questions!`);
      }

      const stems = new Set<string>();
      const duplicateStemsInThisBlock = [];
      for (let i = 0; i < questions.length; i++) {
        totalQuestions++;
        const q = questions[i];
        if (stems.has(q.questionText.trim())) {
          duplicatesFound++;
          duplicateStemsInThisBlock.push(q.questionText.trim().substring(0, 50));
        }
        stems.add(q.questionText.trim());
      }
      if (duplicateStemsInThisBlock.length > 0) {
        console.log(`[DUPLICATE IN STAGE ${s} BLOCK ${b} RETRY ${r}] count: ${duplicateStemsInThisBlock.length}`);
      }
    }
  }
}

console.log(`Generated ${totalQuestions} questions across 100 stages.`);
console.log(`Duplicates within blocks found: ${duplicatesFound}`);

if (duplicatesFound === 0) {
  console.log('SUCCESS: All questions within each block are strictly unique!');
} else {
  console.log('Warning: Some duplicates exist.');
}
