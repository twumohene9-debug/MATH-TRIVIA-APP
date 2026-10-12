import { World, Stage } from '../types';
import { getTopicsForStage } from './curriculum1000';

export const WORLDS: World[] = [
  {
    id: 1,
    title: 'Number Foundations',
    stageRange: [1, 10],
    themeColor: 'from-amber-500/20 via-orange-500/10 to-transparent',
    accentColor: '#f59e0b',
    description: 'Master the fundamental bedrock of arithmetic, counting, number systems, and basic operations.',
    badge: '1️⃣',
  },
  {
    id: 2,
    title: 'Numerical Mastery',
    stageRange: [11, 20],
    themeColor: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    accentColor: '#10b981',
    description: 'Explore the extended number line: negative numbers, fractions, decimals, ratios, and percentages.',
    badge: '🔢',
  },
  {
    id: 3,
    title: 'Applied Mathematics',
    stageRange: [21, 30],
    themeColor: 'from-cyan-500/20 via-blue-500/10 to-transparent',
    accentColor: '#06b6d4',
    description: 'Solve real-world financial, kinematic, speed-distance-time, interest, and mixture modeling challenges.',
    badge: '💼',
  },
  {
    id: 4,
    title: 'Algebra',
    stageRange: [31, 40],
    themeColor: 'from-blue-500/20 via-indigo-500/10 to-transparent',
    accentColor: '#3b82f6',
    description: 'Harness variables, solve linear equations, inequalities, factor polynomials, and master simultaneous systems.',
    badge: '📐',
  },
  {
    id: 5,
    title: 'Geometry & Measurement',
    stageRange: [41, 50],
    themeColor: 'from-purple-500/20 via-violet-500/10 to-transparent',
    accentColor: '#8b5cf6',
    description: 'Investigate angles, polygons, perimeter, area, 3D surface area and volume, Pythagoras, and similarity.',
    badge: '📏',
  },
  {
    id: 6,
    title: 'Statistics & Probability',
    stageRange: [51, 60],
    themeColor: 'from-fuchsia-500/20 via-pink-500/10 to-transparent',
    accentColor: '#d946ef',
    description: 'Analyze data distributions, measures of central tendency, spread, independent events, and conditional odds.',
    badge: '📊',
  },
  {
    id: 7,
    title: 'Functions, Graphs & Coordinates',
    stageRange: [61, 70],
    themeColor: 'from-rose-500/20 via-red-500/10 to-transparent',
    accentColor: '#f43f5e',
    description: 'Connect algebraic formulas to Cartesian geometry: slopes, parabolas, exponentials, logs, and transforms.',
    badge: '📈',
  },
  {
    id: 8,
    title: 'Trigonometry & Advanced Algebra',
    stageRange: [71, 80],
    themeColor: 'from-teal-500/20 via-emerald-500/10 to-transparent',
    accentColor: '#14b8a6',
    description: 'Master trigonometric ratios, sine/cosine laws, identities, geometric sequences, series, and surds.',
    badge: '🌐',
  },
  {
    id: 9,
    title: 'Higher Mathematics',
    stageRange: [81, 90],
    themeColor: 'from-indigo-500/20 via-purple-500/10 to-transparent',
    accentColor: '#6366f1',
    description: 'Venture into rigorous calculus, derivatives, integrals, vectors, matrix algebra, and complex numbers.',
    badge: '⚡',
  },
  {
    id: 10,
    title: 'Ultimate Mathematical Mastery',
    stageRange: [91, 100],
    themeColor: 'from-amber-400/25 via-yellow-500/15 to-transparent',
    accentColor: '#fbbf24',
    description: 'The pinnacle of mathematical reasoning: multi-step proofs, number theory, olympiad logic, and Stage 100.',
    badge: '👑',
  },
];

export const STAGES: Stage[] = [
  // WORLD 1 (1-10)
  { id: 1, worldId: 1, title: 'Numbers & Counting', description: 'Number recognition, ordering, sequences, and cardinal patterns.', subtopics: ['Counting', 'Number Ordering', 'Magnitude Comparison', 'Pattern Sequences'] },
  { id: 2, worldId: 1, title: 'Place Value', description: 'Units, tens, hundreds, thousands, expanded notation, and positional base-10.', subtopics: ['Units & Tens', 'Hundreds & Thousands', 'Expanded Form', 'Digit Values'] },
  { id: 3, worldId: 1, title: 'Addition', description: 'Mental addition, regrouping, missing-number puzzles, and multi-digit sums.', subtopics: ['Mental Addition', 'Column Regrouping', 'Missing Addends', 'Applied Sums'] },
  { id: 4, worldId: 1, title: 'Subtraction', description: 'Borrowing, difference comparisons, balance equations, and word problems.', subtopics: ['Basic Subtraction', 'Multi-digit Borrowing', 'Missing Minuends', 'Difference Problems'] },
  { id: 5, worldId: 1, title: 'Multiplication', description: 'Times tables, repeated addition, arrays, multi-digit products, and properties.', subtopics: ['Times Tables', 'Array Models', 'Multi-digit Products', 'Distributive Law'] },
  { id: 6, worldId: 1, title: 'Division', description: 'Sharing, grouping, remainders, long division, and inverse relationships.', subtopics: ['Division Facts', 'Remainders', 'Long Division', 'Equal Grouping'] },
  { id: 7, worldId: 1, title: 'Factors & Multiples', description: 'Divisibility rules, prime factorization, greatest common factor, and LCM.', subtopics: ['Factor Pairs', 'Prime Numbers', 'GCF / HCF', 'LCM'] },
  { id: 8, worldId: 1, title: 'Number Properties', description: 'Even and odd logic, square numbers, cubes, and arithmetic identities.', subtopics: ['Even & Odd Rules', 'Perfect Squares', 'Cube Numbers', 'Arithmetic Axioms'] },
  { id: 9, worldId: 1, title: 'Order of Operations', description: 'PEMDAS / BODMAS hierarchy: brackets, exponents, multiplication, division, addition, subtraction.', subtopics: ['Brackets Priority', 'Nested Operations', 'Operator Precedence', 'Evaluation'] },
  { id: 10, worldId: 1, title: 'Number Foundations Challenge', description: 'Grand synthesis of arithmetic, order of operations, and numerical puzzles.', subtopics: ['Mixed Arithmetic', 'Multi-step Operations', 'Logic Riddles', 'Foundation Capstone'] },

  // WORLD 2 (11-20)
  { id: 11, worldId: 2, title: 'Integers', description: 'The discrete number line, absolute value, integer ordering, and distance.', subtopics: ['Integer Line', 'Absolute Value', 'Comparing Integers', 'Distance on Number Line'] },
  { id: 12, worldId: 2, title: 'Negative Numbers', description: 'Addition, subtraction, multiplication, and division with directed negative numbers.', subtopics: ['Adding Negatives', 'Subtracting Negatives', 'Negative Products', 'Signed Division'] },
  { id: 13, worldId: 2, title: 'Fractions', description: 'Equivalent fractions, mixed numbers, improper forms, and fraction simplification.', subtopics: ['Equivalence', 'Simplification', 'Improper to Mixed', 'Fraction Comparison'] },
  { id: 14, worldId: 2, title: 'Fraction Operations', description: 'Common denominators, fraction multiplication, reciprocal division, and applications.', subtopics: ['Adding Fractions', 'Subtracting Fractions', 'Multiplying Fractions', 'Dividing Fractions'] },
  { id: 15, worldId: 2, title: 'Decimals', description: 'Tenths, hundredths, thousandths, converting between fractions and decimals.', subtopics: ['Decimal Place Value', 'Fraction-Decimal Conversion', 'Ordering Decimals', 'Rounding Decimals'] },
  { id: 16, worldId: 2, title: 'Decimal Operations', description: 'Column alignment, decimal products, moving decimal places, and division.', subtopics: ['Decimal Addition', 'Decimal Subtraction', 'Decimal Products', 'Decimal Quotients'] },
  { id: 17, worldId: 2, title: 'Percentages', description: 'Per hundred parts, converting fractions/decimals to percentages, and percent of quantities.', subtopics: ['Percent Foundations', 'Percentage of Quantities', 'Percentage Increase', 'Percentage Decrease'] },
  { id: 18, worldId: 2, title: 'Ratios', description: 'Part-to-part, part-to-whole, simplifying ratios, and proportional sharing.', subtopics: ['Ratio Notation', 'Simplifying Ratios', 'Dividing in Ratios', 'Equivalent Ratios'] },
  { id: 19, worldId: 2, title: 'Proportions & Rates', description: 'Unit rates, direct proportions, inverse proportions, and scaling multipliers.', subtopics: ['Unit Rates', 'Direct Proportion', 'Inverse Proportion', 'Cross-Multiplication'] },
  { id: 20, worldId: 2, title: 'Numerical Mastery Challenge', description: 'Complex numerical synthesis combining fractions, decimals, signed numbers, and rates.', subtopics: ['Mixed Fractions & Decimals', 'Compound Rates', 'Percentage Chains', 'World 2 Capstone'] },

  // WORLD 3 (21-30)
  { id: 21, worldId: 3, title: 'Money Mathematics', description: 'Currency calculations, budgeting, transaction reconciliations, and billing.', subtopics: ['Currency Operations', 'Unit Costs', 'Budget Balances', 'Invoice Totals'] },
  { id: 22, worldId: 3, title: 'Profit & Loss', description: 'Cost price, selling price, profit margins, percentage loss, and breakeven.', subtopics: ['Gross Profit', 'Percentage Profit', 'Percentage Loss', 'Cost Price Derivation'] },
  { id: 23, worldId: 3, title: 'Discounts & Markups', description: 'Successive discounts, sales tax, retail markups, and net price determination.', subtopics: ['Single Discount', 'Successive Discounts', 'Wholesale Markups', 'Tax Calculations'] },
  { id: 24, worldId: 3, title: 'Simple Interest', description: 'Principal, rate, time, flat interest formula $I = Prt$, and total accumulated value.', subtopics: ['Interest Formula', 'Time Adjustments', 'Rate Derivation', 'Total Accrual'] },
  { id: 25, worldId: 3, title: 'Compound Interest', description: 'Annual compounding, compound growth multipliers, and future value calculations.', subtopics: ['Annual Compounding', 'Compounding Formula', 'Growth Factors', 'Depreciation Rates'] },
  { id: 26, worldId: 3, title: 'Speed, Distance & Time', description: 'Average speed, kinematic unit conversions (km/h to m/s), journey legs, and overtaking.', subtopics: ['Speed Formula', 'Unit Conversions', 'Average Speed', 'Two-Body Motions'] },
  { id: 27, worldId: 3, title: 'Work & Rate Problems', description: 'Pipes filling tanks, cooperative work rates, workers sharing tasks, and elapsed duration.', subtopics: ['Combined Work Rates', 'Inverse Time Rates', 'Tank Filling Problems', 'Sequential Work'] },
  { id: 28, worldId: 3, title: 'Mixtures & Proportions', description: 'Solution concentrations, blending alloys, dilution problems, and alligation.', subtopics: ['Solution Percentages', 'Alloy Blends', 'Liquid Dilution', 'Weighted Averages'] },
  { id: 29, worldId: 3, title: 'Real-World Mathematical Modelling', description: 'Translating real situations into mathematical models, constraints, and optimization.', subtopics: ['Constraint Formulation', 'Optimization Logic', 'Step Functions', 'Scenario Comparison'] },
  { id: 30, worldId: 3, title: 'Applied Mathematics Challenge', description: 'Comprehensive real-world problem-solving uniting finance, rates, mixtures, and models.', subtopics: ['Multi-phase Financials', 'Kinematic Networks', 'Compound Modelling', 'World 3 Capstone'] },

  // WORLD 4 (31-40)
  { id: 31, worldId: 4, title: 'Algebraic Symbols', description: 'Variables, constants, coefficients, algebraic vocabulary, and terms.', subtopics: ['Variables & Constants', 'Coefficients', 'Like Terms', 'Algebraic Conventions'] },
  { id: 32, worldId: 4, title: 'Algebraic Expressions', description: 'Constructing algebraic expressions from verbal statements and geometry.', subtopics: ['Translating Words to Algebra', 'Expression Structure', 'Perimeter Expressions', 'Area Expressions'] },
  { id: 33, worldId: 4, title: 'Simplification', description: 'Combining like terms, algebraic addition/subtraction, and index laws in algebra.', subtopics: ['Collecting Like Terms', 'Powers in Expressions', 'Minus Sign Rules', 'Simplifying Products'] },
  { id: 34, worldId: 4, title: 'Substitution', description: 'Evaluating algebraic formulas by substituting given numerical values.', subtopics: ['Single Variable Sub', 'Multi-variable Sub', 'Negative Substitutions', 'Formula Evaluation'] },
  { id: 35, worldId: 4, title: 'Linear Equations', description: 'One-step, two-step, and multi-step linear equations with brackets and fractions.', subtopics: ['Single-step Equations', 'Two-step Equations', 'Variables on Both Sides', 'Equations with Brackets'] },
  { id: 36, worldId: 4, title: 'Linear Inequalities', description: 'Solving inequalities, flipping inequality signs with negatives, and number lines.', subtopics: ['Inequality Symbols', 'Solving Inequalities', 'Sign Flip Rule', 'Integer Solution Sets'] },
  { id: 37, worldId: 4, title: 'Expanding & Factorization', description: 'Single and double brackets expansion, common monomial factors, and difference of squares.', subtopics: ['Single Brackets Expansion', 'FOIL / Binomial Products', 'Common Factor Out', 'Difference of Two Squares'] },
  { id: 38, worldId: 4, title: 'Algebraic Fractions', description: 'Simplifying algebraic fractions, common binomial denominators, and rational operations.', subtopics: ['Cancelling Common Terms', 'Adding Algebraic Fractions', 'Multiplying Rational Expressions', 'Solving Fractional Equations'] },
  { id: 39, worldId: 4, title: 'Simultaneous Equations', description: 'Solving systems of two linear equations via elimination and substitution.', subtopics: ['Method of Elimination', 'Method of Substitution', 'Word Problem Systems', 'Intersecting Lines'] },
  { id: 40, worldId: 4, title: 'Algebra Mastery Challenge', description: 'Intensive algebraic manipulation, complex equation solving, and multi-step reasoning.', subtopics: ['High-Degree Factoring', 'Complex Systems', 'Nested Variables', 'World 4 Capstone'] },

  // WORLD 5 (41-50)
  { id: 41, worldId: 5, title: 'Lines & Angles', description: 'Complementary, supplementary, vertically opposite, and parallel line transversal angles.', subtopics: ['Angle Classification', 'Supplementary Angles', 'Corresponding Angles', 'Alternate Interior Angles'] },
  { id: 42, worldId: 5, title: 'Triangles', description: 'Angle sums ($180^\\circ$), exterior angle theorem, isosceles and equilateral properties.', subtopics: ['Triangle Angle Sum', 'Exterior Angles', 'Isosceles Geometry', 'Equilateral Properties'] },
  { id: 43, worldId: 5, title: 'Quadrilaterals', description: 'Parallelograms, rhombuses, trapezoids, kites, and their diagonal properties.', subtopics: ['Parallelogram Theorems', 'Trapezoid Angles', 'Rhombus Diagonals', 'Quadrilateral Angle Sum ($360^\\circ$)'] },
  { id: 44, worldId: 5, title: 'Polygons', description: 'Interior angle sum formula $(n-2) \\times 180^\\circ$, exterior angles, and regular polygons.', subtopics: ['Interior Angle Sum', 'Regular Polygon Angles', 'Exterior Angle Sum ($360^\\circ$)', 'Polygon Diagonals'] },
  { id: 45, worldId: 5, title: 'Perimeter & Area', description: 'Composite shapes, rectangles, triangles, parallelograms, trapezoids, and shaded areas.', subtopics: ['Triangle Area', 'Trapezoid Area', 'Composite 2D Shapes', 'Shaded Regions'] },
  { id: 46, worldId: 5, title: 'Circles', description: 'Radius, diameter, circumference $2\\pi r$, area $\\pi r^2$, arc length, and sectors.', subtopics: ['Circumference', 'Circle Area', 'Arc Length', 'Sector Area'] },
  { id: 47, worldId: 5, title: 'Volume & Surface Area', description: 'Prisms, cylinders, pyramids, cones, spheres, and nets of 3D solids.', subtopics: ['Prism Volume', 'Cylinder Volume & Surface', 'Sphere Formulas', 'Cone Geometry'] },
  { id: 48, worldId: 5, title: 'Pythagorean Theorem', description: 'Right triangles, finding hypotenuse, finding legs, distance in 2D space, and Pythagorean triples.', subtopics: ['Finding Hypotenuse', 'Finding Legs', 'Pythagorean Triples', '3D Pythagoras Applications'] },
  { id: 49, worldId: 5, title: 'Similarity, Congruence & Geometric Reasoning', description: 'Scale factors, area/volume scale factors, triangle congruence criteria (SSS, SAS, ASA, RHS).', subtopics: ['Linear Scale Factor', 'Area Scale Factor ($k^2$)', 'Volume Scale Factor ($k^3$)', 'Congruence Proofs'] },
  { id: 50, worldId: 5, title: 'Geometry Mastery Challenge', description: 'Mastery of multi-step geometric proofs, composite solids, and Euclidean logic.', subtopics: ['Composite Proofs', 'Multi-Theorem Shapes', 'Circle Geometry', 'World 5 Capstone'] },

  // WORLD 6 (51-60)
  { id: 51, worldId: 6, title: 'Data Collection', description: 'Sampling methods, bias, discrete vs continuous data, qualitative vs quantitative.', subtopics: ['Sampling Techniques', 'Data Classification', 'Survey Bias', 'Data Integrity'] },
  { id: 52, worldId: 6, title: 'Tables & Frequency', description: 'Tally charts, frequency tables, grouped frequency distributions, and cumulative frequency.', subtopics: ['Grouped Frequencies', 'Class Midpoints', 'Cumulative Tables', 'Relative Frequency'] },
  { id: 53, worldId: 6, title: 'Charts & Graphs', description: 'Bar charts, histograms, pie charts, scatter graphs, and line graphs.', subtopics: ['Pie Chart Angles', 'Histogram Frequencies', 'Scatter Correlation', 'Reading Trends'] },
  { id: 54, worldId: 6, title: 'Mean', description: 'Arithmetic average, finding missing values from a mean, weighted mean, and combined data.', subtopics: ['Calculating Mean', 'Reversing the Mean', 'Weighted Mean', 'Combined Group Means'] },
  { id: 55, worldId: 6, title: 'Median, Mode & Range', description: 'Middle values, modal frequencies, range, interquartile range (IQR), and box plots.', subtopics: ['Finding Median', 'Identifying Mode', 'Range & Spread', 'Interquartile Range'] },
  { id: 56, worldId: 6, title: 'Data Interpretation', description: 'Comparing distributions, skewness, outliers, misleading graphs, and conclusions.', subtopics: ['Distribution Comparison', 'Detecting Outliers', 'Misleading Scales', 'Statistical Claims'] },
  { id: 57, worldId: 6, title: 'Basic Probability', description: 'Theoretical vs experimental probability, sample space, mutually exclusive events, and complements.', subtopics: ['Probability Scale', 'Sample Spaces', 'Complementary Rule', 'Fair Dice & Coins'] },
  { id: 58, worldId: 6, title: 'Advanced Probability', description: 'Independent events, dependent events, tree diagrams, replacement vs without replacement.', subtopics: ['Independent Events', 'Conditional Probability', 'Tree Diagrams', 'Without Replacement'] },
  { id: 59, worldId: 6, title: 'Combined Statistics & Probability', description: 'Expected values, frequency trees, Venn diagrams, two-way probability tables.', subtopics: ['Expected Value', 'Venn Diagram Probability', 'Two-Way Tables', 'Joint Probability'] },
  { id: 60, worldId: 6, title: 'Statistics & Probability Mastery', description: 'Advanced interpretation of distributions, risk assessment, and probabilistic modeling.', subtopics: ['Complex Trees', 'Weighted Expectations', 'Distribution Rigor', 'World 6 Capstone'] },

  // WORLD 7 (61-70)
  { id: 61, worldId: 7, title: 'Coordinates', description: 'Four quadrants, plotting, midpoint of a line segment, and Cartesian distance formula.', subtopics: ['Quadrant Navigation', 'Midpoint Formula', 'Distance Formula', 'Geometric Coordinates'] },
  { id: 62, worldId: 7, title: 'Straight-Line Graphs', description: 'Linear equations in Cartesian space, table of values, plotting, horizontal/vertical lines.', subtopics: ['Graphing $y = mx + c$', 'Horizontal & Vertical Lines', 'Axis Intercepts', 'Linear Tables'] },
  { id: 63, worldId: 7, title: 'Gradient & Intercepts', description: 'Gradient formula $m = \\frac{y_2 - y_1}{x_2 - x_1}$, parallel and perpendicular line slopes.', subtopics: ['Gradient Calculation', 'Parallel Slopes ($m_1 = m_2$)', 'Perpendicular Slopes ($m_1 m_2 = -1$)', 'Point-Slope Form'] },
  { id: 64, worldId: 7, title: 'Linear Functions', description: 'Function notation $f(x)$, domain, range, linear transformations, and rate of change.', subtopics: ['Evaluating $f(x)$', 'Domain & Range', 'Direct Linear Modeling', 'Inverse Functions'] },
  { id: 65, worldId: 7, title: 'Quadratic Functions', description: 'Parabolas, vertex, axis of symmetry, roots via factoring, and quadratic formula.', subtopics: ['Parabola Vertex', 'Quadratic Roots', 'Axis of Symmetry', 'Maximum/Minimum Value'] },
  { id: 66, worldId: 7, title: 'Polynomials', description: 'Cubic and higher-degree functions, end behavior, turning points, and polynomial division.', subtopics: ['Polynomial Degree', 'Roots & Zeros', 'Turning Points', 'Factor Theorem'] },
  { id: 67, worldId: 7, title: 'Exponential Functions', description: 'Exponential growth and decay curves, asymptotes, base $e$, and doubling times.', subtopics: ['Growth Multipliers', 'Horizontal Asymptotes', 'Decay Models', 'Half-Life Calculations'] },
  { id: 68, worldId: 7, title: 'Logarithmic Functions', description: 'Inverse of exponentials, properties of logs (product, quotient, power), natural logs.', subtopics: ['Log Definition', 'Log Laws', 'Solving Log Equations', 'Log Graphs'] },
  { id: 69, worldId: 7, title: 'Transformations & Composite Functions', description: 'Shifts, stretches, reflections $y = f(x+a)$, and composite operations $f(g(x))$.', subtopics: ['Vertical Translations', 'Horizontal Translations', 'Reflections', 'Composite $f(g(x))$'] },
  { id: 70, worldId: 7, title: 'Functions & Graphs Mastery', description: 'Synthesis of curve sketching, intersection of curves, and graphical analysis.', subtopics: ['Curve Intersections', 'Multi-Function Models', 'Asymptotic Behavior', 'World 7 Capstone'] },

  // WORLD 8 (71-80)
  { id: 71, worldId: 8, title: 'Trigonometric Ratios', description: 'Sine, Cosine, Tangent definitions in right triangles (SOH CAH TOA) and exact values.', subtopics: ['SOH CAH TOA', 'Exact Trig Values ($30^\\circ, 45^\\circ, 60^\\circ$)', 'Angle of Elevation', 'Angle of Depression'] },
  { id: 72, worldId: 8, title: 'Right-Triangle Trigonometry', description: 'Calculating missing angles, missing sides, bearings, and multi-triangle setups.', subtopics: ['Inverse Trig Functions', 'Three-Figure Bearings', 'Multi-triangle Systems', 'Shadow & Height Problems'] },
  { id: 73, worldId: 8, title: 'Sine & Cosine Rules', description: 'Non-right triangle trigonometry: Sine Rule, Cosine Rule, and triangle area $\\frac{1}{2}ab\\sin C$.', subtopics: ['Sine Rule for Sides', 'Sine Rule for Angles', 'Cosine Rule ($a^2 = b^2 + c^2 - 2bc\\cos A$)', 'Area of General Triangle'] },
  { id: 74, worldId: 8, title: 'Trigonometric Equations', description: 'Solving trigonometric equations over intervals such as $[0^\\circ, 360^\\circ]$ or $[0, 2\\pi]$.', subtopics: ['Primary Solutions', 'CAST Diagram / Unit Circle', 'Multiple Solutions', 'Equations with Quadratic Trig'] },
  { id: 75, worldId: 8, title: 'Trigonometric Identities', description: 'Pythagorean identity $\\sin^2\\theta + \\cos^2\\theta = 1$, $\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}$, and simplification.', subtopics: ['Fundamental Identity', 'Simplifying Trig Expressions', 'Double Angle Concepts', 'Trig Proofs'] },
  { id: 76, worldId: 8, title: 'Sequences', description: 'Arithmetic sequences, common difference, general term $a_n = a + (n-1)d$, and geometric terms.', subtopics: ['Arithmetic $n$-th Term', 'Common Difference', 'Geometric $n$-th Term', 'Recurrence Relations'] },
  { id: 77, worldId: 8, title: 'Series', description: 'Sum of arithmetic series $S_n$, sum of finite geometric series, and infinite geometric series.', subtopics: ['Arithmetic Series Sum', 'Geometric Series Sum', 'Infinite Geometric Series', 'Sigma Notation $\\sum$'] },
  { id: 78, worldId: 8, title: 'Exponents, Surds & Logarithms', description: 'Fractional indices, simplifying radical expressions, rationalizing denominators, advanced logs.', subtopics: ['Fractional Powers', 'Simplifying Surds', 'Rationalizing Denominators', 'Advanced Log Bases'] },
  { id: 79, worldId: 8, title: 'Advanced Algebraic Problem-Solving', description: 'Binomial expansion theorem, polynomial roots, algebraic modeling, and equations in disguise.', subtopics: ['Binomial Expansions', 'Hidden Quadratics', 'Algebraic Identities', 'Multi-Step Inequalities'] },
  { id: 80, worldId: 8, title: 'Trigonometry & Advanced Algebra Mastery', description: 'Mastery uniting trigonometric models, harmonic functions, series convergence, and surds.', subtopics: ['Trigonometric Proofs', 'Convergence Tests', 'Harmonic Oscillations', 'World 8 Capstone'] },

  // WORLD 9 (81-90)
  { id: 81, worldId: 9, title: 'Limits', description: 'Intuitive and algebraic limits, one-sided limits, continuity, and limits at infinity.', subtopics: ['Evaluating Limits', 'Indeterminate Forms ($0/0$)', 'Limits at Infinity', 'Continuity Criteria'] },
  { id: 82, worldId: 9, title: 'Differentiation', description: 'First principles, power rule $\\frac{d}{dx}[x^n] = nx^{n-1}$, product rule, quotient rule, chain rule.', subtopics: ['Power Rule', 'Chain Rule', 'Product Rule', 'Quotient Rule'] },
  { id: 83, worldId: 9, title: 'Applications of Derivatives', description: 'Tangents, normals, stationary points, local maxima/minima, and optimization problems.', subtopics: ['Tangent Line Equations', 'Stationary Points', 'Second Derivative Test', 'Real-World Optimization'] },
  { id: 84, worldId: 9, title: 'Integration', description: 'Anti-derivatives, indefinite integrals, constant of integration, and definite integrals.', subtopics: ['Reverse Power Rule', 'Definite Integrals', 'Fundamental Theorem of Calculus', 'Constant $+C$'] },
  { id: 85, worldId: 9, title: 'Applications of Integration', description: 'Area under curves, area between two curves, kinematics via calculus, and accumulation.', subtopics: ['Area Under a Curve', 'Area Between Curves', 'Position-Velocity-Acceleration', 'Total Accumulation'] },
  { id: 86, worldId: 9, title: 'Vectors', description: 'Vector addition, scalar multiplication, magnitude, 2D/3D column vectors, and dot products.', subtopics: ['Vector Components', 'Magnitude $|\\vec{v}|$', 'Dot Product $\\vec{u}\\cdot\\vec{v}$', 'Angle Between Vectors'] },
  { id: 87, worldId: 9, title: 'Matrices', description: 'Matrix dimensions, matrix addition, scalar multiplication, matrix multiplication.', subtopics: ['Matrix Operations', 'Matrix Multiplication', 'Identity Matrix', 'Geometric Transformations'] },
  { id: 88, worldId: 9, title: 'Determinants', description: '$2\\times 2$ and $3\\times 3$ determinants, matrix inverses, and solving linear systems with Cramer\'s rule.', subtopics: ['Determinant $\\det(A)$', 'Matrix Inverse $A^{-1}$', 'Singular Matrices', 'Systems with Inverses'] },
  { id: 89, worldId: 9, title: 'Complex Numbers', description: 'Imaginary unit $i = \\sqrt{-1}$, arithmetic with $a+bi$, complex conjugates, and Argand plane.', subtopics: ['Powers of $i$', 'Complex Arithmetic', 'Complex Conjugates', 'Modulus and Argand Plane'] },
  { id: 90, worldId: 9, title: 'Higher Mathematics Mastery', description: 'Advanced calculus synthesis, multi-variable vector applications, and matrix systems.', subtopics: ['Calculus Synthesis', 'Vector Equations of Lines', 'Eigenvalues & Inverses', 'World 9 Capstone'] },

  // WORLD 10 (91-100)
  { id: 91, worldId: 10, title: 'Advanced Mathematical Reasoning', description: 'Deductive reasoning, proof by contradiction, contrapositive logic, and invariants.', subtopics: ['Proof by Contradiction', 'Contrapositive Statements', 'Mathematical Invariants', 'Direct Deductions'] },
  { id: 92, worldId: 10, title: 'Multi-Step Mathematical Problems', description: 'Problems that bridge algebra, geometry, rates, and functions in intricate sequences.', subtopics: ['Multi-Stage Synthesis', 'Hidden Sub-problems', 'Algebra-Geometry Hybrids', 'Stepwise Dissection'] },
  { id: 93, worldId: 10, title: 'Mathematical Logic', description: 'Truth tables, propositional logic, quantifiers ($\\forall, \\exists$), and conditional statements.', subtopics: ['Truth Tables', 'Universal & Existential Quantifiers', 'Implication & Equivalence', 'Boolean Logic'] },
  { id: 94, worldId: 10, title: 'Number Theory Challenges', description: 'Modular arithmetic, Euclidean algorithm, Diophantine equations, and prime distribution.', subtopics: ['Modular Congruence', 'Euclidean Algorithm', 'Diophantine Solvability', 'Euler Totient Concept'] },
  { id: 95, worldId: 10, title: 'Advanced Probability & Combinatorics', description: 'Permutations $_nP_r$, combinations $_nC_r$, pigeonhole principle, and inclusion-exclusion.', subtopics: ['Permutations & Factorials', 'Combinations Formula', 'Pigeonhole Principle', 'Principle of Inclusion-Exclusion'] },
  { id: 96, worldId: 10, title: 'Mathematical Modelling', description: 'Formulating differential rate equations, discrete recurrence growth, and constrained systems.', subtopics: ['Growth Differential Models', 'Equilibrium States', 'Systemic Constraints', 'Parametric Sensitivity'] },
  { id: 97, worldId: 10, title: 'Competition-Style Mathematics', description: 'Olympiad-style ingenuity: clever substitutions, symmetry, bounding techniques.', subtopics: ['Symmetry Exploitation', 'Clever Substitutions', 'Bounding Variables', 'Olympiad Geometry'] },
  { id: 98, worldId: 10, title: 'Extreme Problem-Solving', description: 'Intricate problem statements requiring multi-disciplinary insight and endurance.', subtopics: ['Iterative Sequences', 'Multi-Layered Logic', 'Analytical Decomposition', 'Deep Inferences'] },
  { id: 99, worldId: 10, title: 'Ultimate Mathematics Challenge', description: 'The penultimate gatekeeper: grueling mathematical rigor testing complete comprehension.', subtopics: ['Comprehensive Synthesis', 'Advanced Calculus & Algebra', 'Deep Probability & Geometry', 'Penultimate Trial'] },
  { id: 100, worldId: 10, title: 'MATHEMATICAL MASTERY', description: 'The supreme culmination of all 100 stages — the ultimate test of mathematical insight, beauty, and mastery.', subtopics: ['Grand Unification', 'Complex Multi-step Proofs', 'Advanced Number Theory & Calculus', 'Supreme Mathematical Master'] },
];

// Populate each stage's subtopics with its exact 10 topics from the canonical 1,000 curriculum areas
STAGES.forEach(s => {
  s.subtopics = getTopicsForStage(s.id);
});

export function getWorldForStage(stageId: number): World {
  const world = WORLDS.find(w => stageId >= w.stageRange[0] && stageId <= w.stageRange[1]);
  return world || WORLDS[0];
}

export function getStage(stageId: number): Stage {
  const stage = STAGES.find(s => s.id === stageId);
  return stage || STAGES[0];
}

export function getDifficultyTier(levelId: number): 'foundation' | 'developing' | 'advanced' | 'mastery' {
  if (levelId <= 5) return 'foundation';
  if (levelId <= 10) return 'developing';
  if (levelId <= 15) return 'advanced';
  return 'mastery';
}

export function getTimeLimitSeconds(_stageId?: number): number {
  return 120; // 120 seconds per question as requested
}

/**
 * Returns the exact required number of questions per block based on the world:
 * - World 1 & 2 (Stages 1-20): 5 questions per block
 * - World 3 & 4 (Stages 21-40): 6 questions per block
 * - World 5 & 6 (Stages 41-60): 7 questions per block
 * - World 7 & 8 (Stages 61-80): 8 questions per block
 * - World 9 & 10 (Stages 81-100): 10 questions per block
 */
export function getBlockQuestionCountForWorld(worldId: number): number {
  if (worldId <= 2) return 5;
  if (worldId <= 4) return 6;
  if (worldId <= 6) return 7;
  if (worldId <= 8) return 8;
  return 10;
}

export function getBlockQuestionCountForStage(stageId: number): number {
  const safeStage = Math.max(1, Math.min(100, Math.floor(stageId)));
  const worldId = Math.min(10, Math.floor((safeStage - 1) / 10) + 1);
  return getBlockQuestionCountForWorld(worldId);
}
