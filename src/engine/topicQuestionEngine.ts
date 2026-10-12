import { DifficultyTier } from '../types';
import { PRNG } from './generators/shared';
import type { GeneratedTopicArtifact } from './topicGenerators/types';
import { generateNumberSenseTopic } from './topicGenerators/numberSense';
import { generateFractionsDecimalsPercentagesTopic } from './topicGenerators/fractionsDecimalsPercentages';
import { generateRatiosAlgebraTopic } from './topicGenerators/ratiosAlgebra';
import { generateExponentsRootsTopic } from './topicGenerators/exponentsRoots';
import { generateGeometryTopic } from './topicGenerators/geometry';
import { generateMensurationTopic } from './topicGenerators/mensurationMeasurement';
import { generateShapesTopic } from './topicGenerators/shapes2D3D';
import { generateCoordinatesGraphsTopic } from './topicGenerators/coordinatesGraphs';
import { generateStatisticsProbabilityTopic } from './topicGenerators/statisticsProbability';
import { generateFinancialAppliedTopic } from './topicGenerators/financialApplied';

export type { GeneratedTopicArtifact };

/**
 * Universal Topic Question Engine
 * Dispatches to the dedicated mathematical domain and subtopic generator.
 * Strictly adheres to pedagogical blueprints, variety of representations,
 * unique mathematical reasoning, and standardized LaTeX formatting.
 */
export function generateTopicQuestion(params: {
  topicName: string;
  topicArea: string;
  topicId: number;
  stageId: number;
  levelId: number;
  blockId: number;
  questionIndex: number;
  difficulty: DifficultyTier;
  prng: PRNG;
}): GeneratedTopicArtifact {
  const { topicName, topicArea, topicId, stageId, levelId, prng } = params;
  const diffMultiplier = levelId <= 5 ? 1 : levelId <= 10 ? 2 : levelId <= 15 ? 3 : 4;
  const tier: DifficultyTier = levelId <= 5 ? 'foundation' : levelId <= 10 ? 'developing' : levelId <= 15 ? 'advanced' : 'mastery';

  const nameL = `${topicName} ${topicArea}`.toLowerCase();

  // 1. Coordinate Geometry, Graphs, Intercepts, Slopes & Lines
  if (
    nameL.includes('coordinate') ||
    nameL.includes('intercept') ||
    nameL.includes('gradient') ||
    nameL.includes('slope') ||
    nameL.includes('midpoint') ||
    nameL.includes('cartesian') ||
    nameL.includes('distance formula') ||
    nameL.includes('linear function') ||
    nameL.includes('straight line') ||
    nameL.includes('parabola') ||
    nameL.includes('graph')
  ) {
    return generateCoordinatesGraphsTopic(topicName, topicArea, stageId, tier, prng, diffMultiplier);
  }

  // 2. Statistics, Data Representation & Probability
  if (
    nameL.includes('statistic') ||
    nameL.includes('probability') ||
    nameL.includes('mean') ||
    nameL.includes('median') ||
    nameL.includes('mode') ||
    nameL.includes('frequency') ||
    nameL.includes('deviation') ||
    nameL.includes('data presentation') ||
    nameL.includes('box plot') ||
    nameL.includes('histogram') ||
    nameL.includes('pie chart') ||
    nameL.includes('stem-and-leaf') ||
    nameL.includes('scatter') ||
    nameL.includes('chart') ||
    nameL.includes('tree diagram')
  ) {
    return generateStatisticsProbabilityTopic(topicName, topicArea, stageId, tier, prng, diffMultiplier);
  }

  // 3. Financial Mathematics & Commercial Applications
  if (
    nameL.includes('interest') ||
    nameL.includes('tax') ||
    nameL.includes('vat') ||
    nameL.includes('discount') ||
    nameL.includes('profit') ||
    nameL.includes('loss') ||
    nameL.includes('depreciation') ||
    nameL.includes('currency') ||
    nameL.includes('commercial')
  ) {
    return generateFinancialAppliedTopic(topicName, topicArea, stageId, tier, prng, diffMultiplier);
  }

  // 4. Algebra, Equations, Polynomials, Relations & Matrices
  if (
    nameL.includes('matrix') ||
    nameL.includes('determinant') ||
    nameL.includes('polynomial') ||
    nameL.includes('factoriz') ||
    nameL.includes('quadratic') ||
    nameL.includes('linear equation') ||
    nameL.includes('simultaneous') ||
    nameL.includes('substitution') ||
    nameL.includes('subject of formula') ||
    nameL.includes('algebra') ||
    nameL.includes('equation') ||
    nameL.includes('expression') ||
    nameL.includes('inequalit') ||
    nameL.includes('relation') ||
    nameL.includes('mapping') ||
    nameL.includes('function notation')
  ) {
    return generateRatiosAlgebraTopic(topicName, topicArea, stageId, tier, prng, diffMultiplier);
  }

  // 5. Ratios, Rates, Proportions & Variations
  if (
    nameL.includes('ratio') ||
    nameL.includes('proportion') ||
    nameL.includes('variation') ||
    nameL.includes('scale factor')
  ) {
    return generateRatiosAlgebraTopic(topicName, topicArea, stageId, tier, prng, diffMultiplier);
  }

  // 6. Exponents, Roots, Logarithms & Surds
  if (
    nameL.includes('exponent') ||
    nameL.includes('logarithm') ||
    nameL.includes('surd') ||
    nameL.includes('radical') ||
    nameL.includes('index') ||
    nameL.includes('power') ||
    nameL.includes('scientific notation')
  ) {
    return generateExponentsRootsTopic(topicName, topicArea, stageId, tier, prng, diffMultiplier);
  }

  // 7. Fractions, Decimals, Percentages & Arithmetic Order
  if (
    nameL.includes('fraction') ||
    nameL.includes('decimal') ||
    nameL.includes('percent') ||
    nameL.includes('bodmas') ||
    nameL.includes('bidmas')
  ) {
    return generateFractionsDecimalsPercentagesTopic(topicName, topicArea, stageId, tier, prng, diffMultiplier);
  }

  // 8. Mensuration, Perimeter, Area & Volume
  if (
    nameL.includes('perimeter') ||
    nameL.includes('area') ||
    nameL.includes('volume') ||
    nameL.includes('surface area') ||
    nameL.includes('circumference') ||
    nameL.includes('capacity') ||
    nameL.includes('measurement')
  ) {
    return generateMensurationTopic(topicName, topicArea, stageId, tier, prng, diffMultiplier);
  }

  // 9. 3D Shapes, Polyhedra, Prisms & Solids
  if (
    nameL.includes('prism') ||
    nameL.includes('cylinder') ||
    nameL.includes('cone') ||
    nameL.includes('sphere') ||
    nameL.includes('pyramid') ||
    nameL.includes('polyhedr') ||
    nameL.includes('3d shape') ||
    nameL.includes('net of') ||
    nameL.includes('cross-section') ||
    nameL.includes('cuboid') ||
    nameL.includes('cube')
  ) {
    return generateShapesTopic(topicName, topicArea, stageId, tier, prng, diffMultiplier);
  }

  // 10. Geometry, Angles, Triangles, Circles, Polygons & Vectors
  if (
    nameL.includes('geometry') ||
    nameL.includes('angle') ||
    nameL.includes('triangle') ||
    nameL.includes('polygon') ||
    nameL.includes('circle') ||
    nameL.includes('pythagor') ||
    nameL.includes('trigonometr') ||
    nameL.includes('vector') ||
    nameL.includes('locus') ||
    nameL.includes('loci') ||
    nameL.includes('construction') ||
    nameL.includes('bisector')
  ) {
    return generateGeometryTopic(topicName, topicArea, stageId, tier, prng, diffMultiplier);
  }

  // 11. Number Sense, Integers, Primes & Factors
  if (
    nameL.includes('number') ||
    nameL.includes('counting') ||
    nameL.includes('place value') ||
    nameL.includes('prime') ||
    nameL.includes('factor') ||
    nameL.includes('multiple') ||
    nameL.includes('hcf') ||
    nameL.includes('lcm') ||
    nameL.includes('integer') ||
    nameL.includes('modular') ||
    nameL.includes('binary') ||
    nameL.includes('set')
  ) {
    return generateNumberSenseTopic(topicName, topicArea, stageId, tier, prng, diffMultiplier);
  }

  // Fallback cleanly by canonical topicId numeric range (100 topics per branch)
  if (topicId <= 100) {
    return generateNumberSenseTopic(topicName, topicArea, stageId, tier, prng, diffMultiplier);
  }
  if (topicId <= 200) {
    return generateFractionsDecimalsPercentagesTopic(topicName, topicArea, stageId, tier, prng, diffMultiplier);
  }
  if (topicId <= 300) {
    return generateRatiosAlgebraTopic(topicName, topicArea, stageId, tier, prng, diffMultiplier);
  }
  if (topicId <= 400) {
    return generateExponentsRootsTopic(topicName, topicArea, stageId, tier, prng, diffMultiplier);
  }
  if (topicId <= 500) {
    return generateGeometryTopic(topicName, topicArea, stageId, tier, prng, diffMultiplier);
  }
  if (topicId <= 600) {
    return generateMensurationTopic(topicName, topicArea, stageId, tier, prng, diffMultiplier);
  }
  if (topicId <= 700) {
    return generateShapesTopic(topicName, topicArea, stageId, tier, prng, diffMultiplier);
  }
  if (topicId <= 800) {
    return generateCoordinatesGraphsTopic(topicName, topicArea, stageId, tier, prng, diffMultiplier);
  }
  if (topicId <= 900) {
    return generateStatisticsProbabilityTopic(topicName, topicArea, stageId, tier, prng, diffMultiplier);
  }
  return generateFinancialAppliedTopic(topicName, topicArea, stageId, tier, prng, diffMultiplier);
}
