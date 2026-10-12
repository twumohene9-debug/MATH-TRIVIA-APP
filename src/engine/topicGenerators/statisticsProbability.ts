import { DifficultyTier } from '../../types';
import { PRNG } from '../generators/shared';
import { GeneratedTopicArtifact, makeUniqueDistractors, fmtFrac } from './types';

export function generateStatisticsProbabilityTopic(
  topicName: string,
  topicArea: string,
  stageId: number,
  difficulty: DifficultyTier,
  prng: PRNG,
  diffMultiplier: number
): GeneratedTopicArtifact {
  const nameL = topicName.toLowerCase();

  // =========================================================================
  // STAGE 81: DATA TYPES & COLLECTION (Topics 801 - 810)
  // =========================================================================
  if (nameL.includes('discrete data') || nameL.includes('continuous data')) {
    if (nameL.includes('discrete')) {
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Identifying discrete numerical data',
          questionType: 'identification', difficulty, mathematicalOperation: 'Data classification',
          representation: 'definition', context: 'Data types',
          numbersUsed: [1], expectedReasoning: 'Discrete data can only take specific separated values (usually whole count numbers)',
          conceptKey: 'DISCRETE_DATA_IDENTIFICATION',
        },
        questionText: `Which of the following variables is an example of discrete quantitative data?`,
        correctAnswer: `The number of students in a classroom`,
        rawDistractors: [
          `The height of a basketball player (measured in cm)`,
          `The temperature of boiling water (measured in °C)`,
          `The time taken to run 100 meters (measured in seconds)`,
        ],
        given: `Data classification.`,
        required: `Discrete variable.`,
        method: `Discrete data results from counting and takes only distinct integer values (you cannot have 24.7 students). Continuous data is measured along a continuous scale.`,
        steps: [`Count of students is discrete.`],
        conclusion: `The number of students is discrete.`,
        hint: `Discrete data is COUNTED in whole numbers; continuous data is MEASURED.`,
      };
    }
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Identifying continuous data',
        questionType: 'identification', difficulty, mathematicalOperation: 'Data classification',
        representation: 'definition', context: 'Data types',
        numbersUsed: [1], expectedReasoning: 'Continuous data can take any real value along a continuum',
        conceptKey: 'CONTINUOUS_DATA_IDENTIFICATION',
      },
      questionText: `Which of the following is an example of continuous numerical data?`,
      correctAnswer: `The exact mass of a bag of rice (e.g. $4.825\\text{ kg}$)`,
      rawDistractors: [
        `The number of cars in a parking lot`,
        `The number of pages in a textbook`,
        `The number of goals scored in a match`,
      ],
      given: `Data types.`,
      required: `Continuous variable.`,
      method: `Mass can take any fractional or decimal value on a continuous spectrum, so it is continuous.`,
      steps: [`Mass is a continuous measurement.`],
      conclusion: `Mass is continuous data.`,
      hint: `Continuous variables are measured on a scale that can take any fractional value.`,
    };
  }

  if (nameL.includes('primary data') || nameL.includes('secondary data')) {
    if (nameL.includes('primary')) {
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Primary data source definition',
          questionType: 'identification', difficulty, mathematicalOperation: 'Data collection classification',
          representation: 'definition', context: 'Data collection',
          numbersUsed: [1], expectedReasoning: 'Primary data is collected firsthand directly by the researcher',
          conceptKey: 'PRIMARY_DATA_DEFINITION',
        },
        questionText: `What distinguishes primary data from secondary data in statistical investigations?`,
        correctAnswer: `Primary data is collected firsthand by the researcher for the specific purpose of the study`,
        rawDistractors: [
          `Primary data is always numerical, never categorical`,
          `Primary data is retrieved exclusively from government census archives`,
          `Primary data cannot have errors`,
        ],
        given: `Data collection methods.`,
        required: `Definition of primary data.`,
        method: `Firsthand collection (surveys, experiments, direct observations) produces primary data.`,
        steps: [`Primary data is collected directly by the researcher.`],
        conclusion: `Primary data is collected firsthand.`,
        hint: `Think of "primary" as first-hand, directly from the source.`,
      };
    }
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Secondary data source definition',
        questionType: 'identification', difficulty, mathematicalOperation: 'Data collection classification',
        representation: 'definition', context: 'Data collection',
        numbersUsed: [1], expectedReasoning: 'Secondary data has already been gathered and published by someone else',
        conceptKey: 'SECONDARY_DATA_DEFINITION',
      },
      questionText: `Which of the following is an example of secondary data?`,
      correctAnswer: `Using published census records from the National Bureau of Statistics`,
      rawDistractors: [
        `Measuring the heart rates of 30 volunteers in your laboratory`,
        `Conducting your own face-to-face questionnaire with shoppers`,
        `Counting the number of cars passing your school gate today`,
      ],
      given: `Data sources.`,
      required: `Secondary data example.`,
      method: `Census records were collected and published by an outside organization, making them secondary data.`,
      steps: [`Published government census is secondary data.`],
      conclusion: `Using published records is secondary data.`,
      hint: `Secondary means second-hand: someone else already gathered it.`,
    };
  }

  // =========================================================================
  // STAGE 82 & 83: POPULATION, SAMPLING & FREQUENCY (Topics 811 - 830)
  // =========================================================================
  if (nameL.includes('sample') || nameL.includes('population') || nameL.includes('sampling')) {
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Distinguishing sample from population',
        questionType: 'identification', difficulty, mathematicalOperation: 'Sampling concepts',
        representation: 'definition', context: 'Sampling theory',
        numbersUsed: [1], expectedReasoning: 'A population is the entire group of interest; a sample is a representative subset',
        conceptKey: 'SAMPLE_VS_POPULATION_DEF',
      },
      questionText: `In statistics, what is the relationship between a sample and a population?`,
      correctAnswer: `A sample is a subset chosen to represent the entire population`,
      rawDistractors: [
        `The sample is always larger than the population`,
        `A population only includes people who answered a survey`,
        `The sample and population must always be identical`,
      ],
      given: `Sampling theory.`,
      required: `Relationship.`,
      method: `The population is the complete target set; the sample is a smaller subset inspected to make inferences.`,
      steps: [`A sample is a representative subset of the population.`],
      conclusion: `Sample is a subset of the population.`,
      hint: `A doctor takes a blood sample (a few drops) to test your entire body's blood (the population).`,
    };
  }

  if (nameL.includes('class midpoint') || nameL.includes('class interval') || nameL.includes('class boundaries')) {
    const low = prng.pick([10, 20, 30, 40, 50]);
    const high = low + 10;
    const mid = (low + high) / 2;
    const correctAns = `$${mid}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Class interval midpoint calculation',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Midpoint = (Lower + Upper) / 2',
        representation: 'equation', context: 'Grouped frequency distribution',
        numbersUsed: [low, high, mid], expectedReasoning: 'Add class limits and divide by 2',
        conceptKey: 'CLASS_INTERVAL_MIDPOINT_CALC',
      },
      questionText: `What is the class midpoint of the grouped interval $${low} - ${high}$?`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [`$${low + 2}$`, `$${high - 2}$`, `$${low + 4}$`], prng),
      given: `Interval $${low} - ${high}$.`,
      required: `Midpoint.`,
      method: `$\\text{Midpoint} = \\dfrac{\\text{Lower limit} + \\text{Upper limit}}{2} = \\dfrac{${low} + ${high}}{2} = ${mid}$.`,
      steps: [`$\\dfrac{${low} + ${high}}{2} = \\dfrac{${low + high}}{2} = ${mid}$.`],
      conclusion: `The midpoint is $${mid}$.`,
      hint: `Add the two boundaries together and divide by 2.`,
    };
  }

  // =========================================================================
  // STAGE 84: MEASURES OF CENTRAL TENDENCY (Topics 831 - 840)
  // =========================================================================
  if (nameL.includes('mode')) {
    const modalVal = prng.int(14, 25);
    const other1 = modalVal - 3;
    const other2 = modalVal + 4;
    const other3 = modalVal + 7;
    const dataset = [other1, modalVal, other2, modalVal, other3, modalVal];
    const shuffled = prng.shuffle([...dataset]);
    const correctAns = `$${modalVal}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Finding the mode of a dataset',
        questionType: 'identification', difficulty, mathematicalOperation: 'Highest frequency identification',
        representation: 'list', context: 'Descriptive statistics',
        numbersUsed: [...shuffled, modalVal], expectedReasoning: 'The mode is the value that appears most frequently',
        conceptKey: 'MODE_IDENTIFICATION_DATASET',
      },
      questionText: `Find the mode of the following set of scores:\n\n$$${shuffled.join(',\\; ')}$$`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [`$${other1}$`, `$${other2}$`, `$${other3}$`], prng),
      given: `Data: $${shuffled.join(', ')}$.`,
      required: `Mode.`,
      method: `Count occurrences: $${modalVal}$ appears $3$ times (more than any other number).`,
      steps: [`$${modalVal}$ appears most frequently.`],
      conclusion: `The mode is $${modalVal}$.`,
      hint: `The mode is the number that appears the MOST times in the list.`,
    };
  }

  if (nameL.includes('median')) {
    const raw = [prng.int(10, 20), prng.int(21, 30), prng.int(31, 40), prng.int(41, 50), prng.int(51, 60)];
    const shuffled = prng.shuffle([...raw]);
    const sorted = [...raw].sort((a, b) => a - b);
    const median = sorted[2];
    const correctAns = `$${median}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Median of an odd-sized dataset',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Order and select middle element',
        representation: 'list', context: 'Descriptive statistics',
        numbersUsed: [...shuffled, median], expectedReasoning: 'Sort list in ascending order and identify middle element',
        conceptKey: 'MEDIAN_CALCULATION',
      },
      questionText: `Find the median of the following set of numbers:\n\n$$${shuffled.join(',\\; ')}$$`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${shuffled[2]}$`, // picked middle of unsorted list
        `$${median + 3}$`,
        `$${median - 3}$`,
      ], prng),
      given: `Data: $${shuffled.join(', ')}$.`,
      required: `Median.`,
      method: `Arrange values in ascending order and select the middle value.`,
      steps: [
        `Sorted order: $${sorted.join(',\\; ')}$.`,
        `Middle element (3rd out of 5) is $${median}$.`,
      ],
      conclusion: `The median is $${median}$.`,
      hint: `Always put the numbers in order from least to greatest first, then pick the middle one!`,
    };
  }

  if (nameL.includes('mean') || nameL.includes('average')) {
    const n = 5;
    const targetMean = prng.int(12, 28);
    const deltas = [-4, -2, 1, 2, 3];
    const data = deltas.map(d => targetMean + d).sort((a, b) => a - b);
    const sum = data.reduce((acc, v) => acc + v, 0);
    const correctAns = `$${targetMean}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Arithmetic mean calculation',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Mean = Sum / n',
        representation: 'list', context: 'Descriptive statistics',
        numbersUsed: [...data, targetMean], expectedReasoning: 'Sum all values and divide by the total count of values',
        conceptKey: 'ARITHMETIC_MEAN_CALCULATION',
      },
      questionText: `Find the mean (average) of the following data set:\n\n$$${data.join(',\\; ')}$$`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${targetMean + 2}$`,
        `$${targetMean - 2}$`,
        `$${sum}$`,
        `$${data[Math.floor(data.length / 2)] + 1}$`,
      ], prng),
      given: `Values: $${data.join(', ')}$ ($n = ${n}$).`,
      required: `Mean.`,
      method: `$\\text{Mean} = \\dfrac{\\sum x}{n} = \\dfrac{${sum}}{${n}}$.`,
      steps: [
        `Sum of values: $${data.join(' + ')} = ${sum}$.`,
        `Divide by $${n}$: $\\dfrac{${sum}}{${n}} = ${targetMean}$.`,
      ],
      conclusion: `The mean is $${targetMean}$.`,
      hint: `Add up all the numbers and divide by how many numbers there are.`,
    };
  }

  if (nameL.includes('range')) {
    const vals = [prng.int(12, 25), prng.int(26, 40), prng.int(41, 60), prng.int(61, 85), prng.int(86, 99)];
    const minVal = Math.min(...vals);
    const maxVal = Math.max(...vals);
    const rangeVal = maxVal - minVal;
    const correctAns = `$${rangeVal}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Range of dataset',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Range = Max - Min',
        representation: 'list', context: 'Descriptive statistics',
        numbersUsed: [...vals, rangeVal], expectedReasoning: 'Subtract the minimum value from the maximum value',
        conceptKey: 'RANGE_CALCULATION',
      },
      questionText: `Calculate the range of the data set:\n\n$$${vals.join(',\\; ')}$$`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${maxVal}$`,
        `$${rangeVal + 5}$`,
        `$${Math.max(5, rangeVal - 5)}$`,
      ], prng),
      given: `Data: $${vals.join(', ')}$. Maximum $= ${maxVal}$, Minimum $= ${minVal}$.`,
      required: `Range.`,
      method: `$\\text{Range} = \\text{Maximum} - \\text{Minimum} = ${maxVal} - ${minVal}$.`,
      steps: [`$${maxVal} - ${minVal} = ${rangeVal}$.`],
      conclusion: `The range is $${rangeVal}$.`,
      hint: `Subtract the smallest number from the biggest number.`,
    };
  }

  // =========================================================================
  // STAGE 85 & 86: QUARTILES, SPREAD, BOX PLOTS & OUTLIERS (Topics 841 - 860)
  // =========================================================================
  if (nameL.includes('interquartile range') || nameL.includes('iqr')) {
    const q1 = prng.int(20, 35);
    const q3 = q1 + prng.int(15, 30);
    const iqr = q3 - q1;
    const correctAns = `$${iqr}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Interquartile range calculation (IQR = Q3 - Q1)',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'IQR = Q3 - Q1',
        representation: 'equation', context: 'Measures of dispersion',
        numbersUsed: [q1, q3, iqr], expectedReasoning: 'Subtract lower quartile from upper quartile',
        conceptKey: 'IQR_CALCULATION',
      },
      questionText: `A dataset has a lower quartile ($Q_1$) of $${q1}$ and an upper quartile ($Q_3$) of $${q3}$.\n\nCalculate its interquartile range (IQR):`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${q1 + q3}$`,
        `$${Math.round((q1 + q3) / 2)}$`,
        `$${iqr + 5}$`,
      ], prng),
      given: `$Q_1 = ${q1}$, $Q_3 = ${q3}$.`,
      required: `IQR.`,
      method: `$\\text{IQR} = Q_3 - Q_1 = ${q3} - ${q1} = ${iqr}$.`,
      steps: [`$${q3} - ${q1} = ${iqr}$.`],
      conclusion: `The interquartile range is $${iqr}$.`,
      hint: `Subtract $Q_1$ from $Q_3$: $\\text{IQR} = Q_3 - Q_1$.`,
    };
  }

  if (nameL.includes('box-and-whisker') || nameL.includes('box plot') || nameL.includes('five-number summary')) {
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Components of five-number summary',
        questionType: 'identification', difficulty, mathematicalOperation: 'Five-number summary breakdown',
        representation: 'definition', context: 'Box plots',
        numbersUsed: [5], expectedReasoning: 'The five values are Minimum, Q1, Median (Q2), Q3, Maximum',
        conceptKey: 'FIVE_NUMBER_SUMMARY_COMPONENTS',
      },
      questionText: `Which statistical values form the five-number summary depicted on a box-and-whisker plot?`,
      correctAnswer: `Minimum, Lower quartile ($Q_1$), Median ($Q_2$), Upper quartile ($Q_3$), Maximum`,
      rawDistractors: [
        `Mean, Median, Mode, Range, Standard deviation`,
        `Minimum, Mean, Mode, Upper quartile, Maximum`,
        `First term, Second term, Middle term, Fourth term, Fifth term`,
      ],
      given: `Box-and-whisker plot.`,
      required: `5-number summary components.`,
      method: `A box plot visualizes Min, $Q_1$, Median, $Q_3$, and Max.`,
      steps: [`The 5 values are Min, $Q_1$, Median, $Q_3$, Max.`],
      conclusion: `Minimum, Q1, Median, Q3, Maximum.`,
      hint: `The box shows Q1, Median, and Q3; the whiskers stretch to the Minimum and Maximum.`,
    };
  }

  // =========================================================================
  // STAGE 87: CORRELATION & SCATTER DIAGRAMS (Topics 861 - 870)
  // =========================================================================
  if (nameL.includes('correlation') || nameL.includes('scatter')) {
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Interpreting negative correlation',
        questionType: 'interpretation', difficulty, mathematicalOperation: 'Bivariate trend analysis',
        representation: 'definition', context: 'Scatter graphs',
        numbersUsed: [1], expectedReasoning: 'In negative correlation, as one variable increases, the other variable decreases',
        conceptKey: 'NEGATIVE_CORRELATION_INTERPRETATION',
      },
      questionText: `What does a negative correlation between two variables $x$ and $y$ indicate?`,
      correctAnswer: `As variable $x$ increases, variable $y$ tends to decrease`,
      rawDistractors: [
        `As variable $x$ increases, variable $y$ also tends to increase`,
        `There is no relationship whatsoever between $x$ and $y$`,
        `Variable $x$ and variable $y$ must both be negative numbers`,
      ],
      given: `Negative correlation on a scatter plot.`,
      required: `Interpretation of relationship.`,
      method: `Negative correlation means the line of best fit slopes downwards: increasing $x$ corresponds to decreasing $y$.`,
      steps: [`As $x$ increases, $y$ decreases.`],
      conclusion: `As $x$ increases, $y$ tends to decrease.`,
      hint: `Think of a downhill slope: as you move right ($x$ increases), height ($y$) goes down.`,
    };
  }

  // =========================================================================
  // STAGE 88: PROBABILITY SCALE & BASIC PROBABILITY (Topics 871 - 880)
  // =========================================================================
  if (nameL.includes('probability scale') || nameL.includes('impossible') || nameL.includes('certain')) {
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Probability numerical scale boundaries',
        questionType: 'identification', difficulty, mathematicalOperation: 'Interval [0, 1]',
        representation: 'definition', context: 'Probability scale',
        numbersUsed: [0, 1], expectedReasoning: 'Probability of any event is bounded strictly between 0 (impossible) and 1 (certain)',
        conceptKey: 'PROBABILITY_SCALE_BOUNDARIES',
      },
      questionText: `On the mathematical probability scale, what values represent an impossible event and a certain event?`,
      correctAnswer: `$0$ for impossible, and $1$ for certain`,
      rawDistractors: [
        `$-1$ for impossible, and $+1$ for certain`,
        `$0$ for impossible, and $100$ for certain (on fractional scale)`,
        `$0.5$ for impossible, and $1$ for certain`,
      ],
      given: `Probability scale.`,
      required: `Values for impossible and certain.`,
      method: `By Kolmogorov axioms, $P(\\emptyset) = 0$ (impossible) and $P(S) = 1$ (certain).`,
      steps: [`Impossible $= 0$, Certain $= 1$.`],
      conclusion: `0 is impossible, 1 is certain.`,
      hint: `Probability is always a number from 0 to 1.`,
    };
  }

  // =========================================================================
  // STAGE 89: COMPLEMENTARY & MUTUALLY EXCLUSIVE EVENTS (Topics 881 - 890)
  // =========================================================================
  if (nameL.includes('mutually exclusive') || nameL.includes('complementary')) {
    if (nameL.includes('mutually exclusive')) {
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Definition of mutually exclusive events',
          questionType: 'identification', difficulty, mathematicalOperation: 'P(A and B) = 0',
          representation: 'definition', context: 'Probability events',
          numbersUsed: [0], expectedReasoning: 'Two events are mutually exclusive if they cannot happen at the same time: P(A ∩ B) = 0',
          conceptKey: 'MUTUALLY_EXCLUSIVE_DEFINITION',
        },
        questionText: `What does it mean for two events $A$ and $B$ to be mutually exclusive?`,
        correctAnswer: `They cannot occur at the same time ($P(A \\cap B) = 0$)`,
        rawDistractors: [
          `The outcome of one event has no effect on the other`,
          `Their probabilities must both be equal to $0.5$`,
          `One event is guaranteed to happen if the other happens`,
        ],
        given: `Mutually exclusive events $A$ and $B$.`,
        required: `Definition.`,
        method: `Mutually exclusive means disjoint: their intersection is empty, so they cannot happen simultaneously.`,
        steps: [`$P(A \\cap B) = 0$.`],
        conclusion: `They cannot occur at the same time.`,
        hint: `Think of rolling a die: you cannot roll both a 2 and a 5 on a single roll!`,
      };
    }
    const pN = prng.pick([3, 5, 7]);
    const pD = 10;
    const compN = pD - pN;
    const correctAns = `$${fmtFrac(compN, pD)}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Complementary probability rule P(not A) = 1 - P(A)',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: "P(A') = 1 - P(A)",
        representation: 'equation', context: 'Probability rules',
        numbersUsed: [pN, pD, compN], expectedReasoning: 'P(not A) = 1 - P(A)',
        conceptKey: 'COMPLEMENTARY_PROBABILITY_RULE',
      },
      questionText: `The probability that a team wins a match is $${fmtFrac(pN, pD)}$.\n\nAssuming no draws, what is the probability that the team does NOT win?`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [`$${fmtFrac(pN, pD)}$`, `$${fmtFrac(compN + 1, pD)}$`, `$${fmtFrac(compN - 1, pD)}$`], prng),
      given: `$P(\\text{win}) = ${fmtFrac(pN, pD)}$.`,
      required: `$P(\\text{not win})$.`,
      method: `$P(\\text{not } A) = 1 - P(A) = 1 - ${fmtFrac(pN, pD)} = ${fmtFrac(compN, pD)}$.`,
      steps: [`$1 - ${fmtFrac(pN, pD)} = ${fmtFrac(compN, pD)}$.`],
      conclusion: `The probability of not winning is $${fmtFrac(compN, pD)}$.`,
      hint: `Subtract the probability from 1: $1 - P(A)$.`,
    };
  }

  // =========================================================================
  // STAGE 90: RULES OF PROBABILITY & EXPECTED FREQUENCY (Topics 891 - 900)
  // =========================================================================
  if (nameL.includes('expected frequency') || nameL.includes('expected value')) {
    const trials = prng.pick([60, 120, 180, 240, 300]);
    const pFav = 1;
    const pTot = 6;
    const expFreq = trials / pTot;
    const correctAns = `$${expFreq}$ times`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Calculating expected frequency (E = n * p)',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Expected Frequency = n * p',
        representation: 'word_problem', context: 'Probability experiments',
        numbersUsed: [trials, expFreq], expectedReasoning: 'Multiply number of trials n by probability p',
        conceptKey: 'EXPECTED_FREQUENCY_CALCULATION',
      },
      questionText: `A fair 6-sided die is rolled $${trials}$ times.\n\nHow many times would you expect to roll a $6$?`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${expFreq + 10}$ times`,
        `$${Math.max(5, expFreq - 10)}$ times`,
        `$${trials / 2}$ times`,
      ], prng),
      given: `Trials $n = ${trials}$, Probability $p = \\dfrac{1}{6}$.`,
      required: `Expected frequency.`,
      method: `$\\text{Expected frequency} = n \\times p = ${trials} \\times \\dfrac{1}{6} = ${expFreq}$.`,
      steps: [`$${trials} \\times \\dfrac{1}{6} = ${expFreq}$.`],
      conclusion: `You would expect to roll a 6 about ${expFreq} times.`,
      hint: `Multiply total rolls by the probability: $\\text{Rolls} \\times \\dfrac{1}{6}$.`,
    };
  }

  // Default Probability Calculation (Marbles in a bag)
  const red = prng.int(3, 7);
  const blue = prng.int(4, 8);
  const total = red + blue;
  const correctAns = `$${fmtFrac(red, total)}$`;
  return {
    blueprint: {
      mainTopic: topicArea, subtopic: topicName, skill: `Theoretical probability of drawing red in ${topicName}`,
      questionType: 'direct_calculation', difficulty, mathematicalOperation: 'P = favourable / total',
      representation: 'word_problem', context: 'Probability bag',
      numbersUsed: [red, blue, total], expectedReasoning: 'Divide favourable outcomes by total outcomes',
      conceptKey: `PROBABILITY_STAGE_${stageId}_SKILL`,
    },
    questionText: `A bag contains $${red}$ red marbles and $${blue}$ blue marbles.\n\nIf one marble is drawn at random, what is the probability that it is red?`,
    correctAnswer: correctAns,
    rawDistractors: makeUniqueDistractors(correctAns, [
      `$${fmtFrac(blue, total)}$`,
      `$${fmtFrac(red, blue)}$`,
      `$${fmtFrac(1, total)}$`,
    ], prng),
    given: `Red $= ${red}$, Blue $= ${blue}$. Total $= ${total}$.`,
    required: `$P(\\text{red})$.`,
    method: `$P(\\text{Red}) = \\dfrac{\\text{Red}}{\\text{Total}} = \\dfrac{${red}}{${total}}$.`,
    steps: [`Total $= ${red} + ${blue} = ${total}$.`, `$P(\\text{Red}) = ${fmtFrac(red, total)}$.`],
    conclusion: `The probability is $${fmtFrac(red, total)}$.`,
    hint: `Count the red marbles and divide by the total number of marbles.`,
  };
}
