/**
 * Canonical 10-Part Open Curriculum Database
 * Covers the complete mathematical syllabus from Early Foundations through
 * Basic 7-9 (JHS), Core Mathematics 1-3 (SHS), Elective Mathematics 1-2,
 * and Further Mathematics Mastery.
 *
 * CRITICAL RULE: All 10 Parts are permanently UNLOCKED from day one.
 * Users can freely explore and quiz on any Part without prerequisite locking.
 */

export interface CurriculumUnit {
  id: string;
  name: string;
  strand?: string;
  subtopics: string[];
  keyConcept: string;
  sampleQuestionType: string;
}

export interface CurriculumPart {
  id: number; // 1 to 10
  title: string;
  levelBadge: string;
  subtitle: string;
  description: string;
  badge: string;
  accentColor: string;
  bgGradient: string;
  borderColor: string;
  strands: string[];
  units: CurriculumUnit[];
  totalTopicsCount: number;
}

export const CURRICULUM_PARTS: CurriculumPart[] = [
  {
    id: 1,
    title: 'Foundations & Primary Mathematics',
    levelBadge: 'Foundational',
    subtitle: 'Primary Number Sense, Spatial Geometry & Measurement',
    description: 'Bedrock numeracy: counting, cardinal numbers, place value up to 10,000, basic operations, money, introductory shapes, measurement, and elementary data.',
    badge: '🌱',
    accentColor: '#10b981',
    bgGradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    borderColor: 'border-emerald-300 dark:border-emerald-700',
    strands: ['Number', 'Algebra', 'Geometry and Measurement', 'Data'],
    units: [
      {
        id: 'p1_u1',
        name: 'Counting, Representation & Cardinality',
        strand: 'Number',
        subtopics: ['Counting by 1s (Forward and Backward)', 'Counting objects up to 10', 'Estimating groups of objects', 'Ordinal numbers up to 10th', 'Skip counting to 1000', 'Place value of whole numbers (0–1000)', 'Comparing and ordering numbers (<, >)', 'Skip counting by 10s, 50s, 100s, 1000s up to 10,000', 'Roman numerals', 'Integers introduction'],
        keyConcept: 'Cardinality, positional number value and ordering up to 10,000',
        sampleQuestionType: 'identification',
      },
      {
        id: 'p1_u2',
        name: 'Number Operations & Basic Arithmetic',
        strand: 'Number',
        subtopics: ['Addition of whole numbers', 'Subtraction of whole numbers', 'Addition and subtraction relationships', 'Multiplication as repeated addition', 'Division and equal grouping', 'Decimals and decimal fractions', 'Factors, multiples and square numbers'],
        keyConcept: 'The four fundamental arithmetic operations and inverse relations',
        sampleQuestionType: 'direct_calculation',
      },
      {
        id: 'p1_u3',
        name: 'Fractions, Money & Proportions',
        strand: 'Number',
        subtopics: ['Fraction models and representation', 'Equivalent fractions', 'Money transactions and change', 'Simple ratios and sharing', 'Proportions in everyday context'],
        keyConcept: 'Parts of wholes, currency transactions, and ratio sharing',
        sampleQuestionType: 'word_problem',
      },
      {
        id: 'p1_u4',
        name: 'Patterns, Relations & Equations',
        strand: 'Algebra',
        subtopics: ['Repeating and growing patterns', 'Missing numbers in equations', 'Unknowns and balances', 'Simple algebraic expressions', 'One-step additive equations'],
        keyConcept: 'Pattern recognition and balancing simple algebraic statements',
        sampleQuestionType: 'missing_value',
      },
      {
        id: 'p1_u5',
        name: '2D/3D Shapes, Position & Measurement',
        strand: 'Geometry and Measurement',
        subtopics: ['2D shapes (triangles, quadrilaterals, circles)', '3D shapes and prisms', 'Position, direction and motion', 'Length measurement', 'Mass and capacity', 'Perimeter of basic shapes', 'Area with unit squares', 'Time and clock reading'],
        keyConcept: 'Geometric attributes, spatial position, and standard metric measurement',
        sampleQuestionType: 'direct_calculation',
      },
      {
        id: 'p1_u6',
        name: 'Data Handling & Elementary Probability',
        strand: 'Data',
        subtopics: ['Tally charts and data collection', 'Bar graphs and pictographs', 'Interpreting simple tables', 'Chance and likelihood (certain, likely, impossible)'],
        keyConcept: 'Organizing data visually and reasoning with likelihood',
        sampleQuestionType: 'reasoning',
      },
    ],
    totalTopicsCount: 42,
  },
  {
    id: 2,
    title: 'Basic 7 (JHS Year 1)',
    levelBadge: 'Basic 7 / JHS 1',
    subtitle: 'Standard Numeration, Ratios, Bearings & Intro Algebra',
    description: 'Core Junior High School Year 1 syllabus: multi-digit operations, standard rounding, benchmark fractions, unit rates, linear equations, bearings, vectors, and central tendencies.',
    badge: '📘',
    accentColor: '#3b82f6',
    bgGradient: 'from-blue-500/20 via-indigo-500/10 to-transparent',
    borderColor: 'border-blue-300 dark:border-blue-700',
    strands: ['Number', 'Algebra', 'Geometry and Measurement', 'Data'],
    units: [
      {
        id: 'p2_u1',
        name: 'Numbers & Numeration System',
        strand: 'Number',
        subtopics: ['Modelling number quantities', 'Comparing and ordering whole numbers', 'Rounding to place values and significant figures', 'Decimals and scientific notation', 'Multiplication by powers of 10', 'Mental math (halving, doubling, making 10s/100s)', 'Multi-digit arithmetic and divisibility', 'Decimal word problems and budgets', 'Powers of natural numbers and prime factorization'],
        keyConcept: 'Scientific notation, multi-digit operations, and prime powers',
        sampleQuestionType: 'direct_calculation',
      },
      {
        id: 'p2_u2',
        name: 'Fractions, Decimals & Percentages',
        strand: 'Number',
        subtopics: ['Equivalent fractions and simplifying', 'Converting improper and mixed fractions', 'Adding and subtracting like and unlike fractions', 'Multiplying fractions and finding fraction of quantities', 'Dividing fractions by whole numbers and fractions', 'Converting between fractions, decimals and percentages'],
        keyConcept: 'Rigorous four operations on rational fractions and conversions',
        sampleQuestionType: 'direct_calculation',
      },
      {
        id: 'p2_u3',
        name: 'Ratios and Proportions',
        strand: 'Number',
        subtopics: ['Understanding ratios and equivalent ratios', 'Unit rates and comparison', 'Equivalent proportions', 'Percentages as a rate per 100'],
        keyConcept: 'Unit rates, scaling multipliers, and percentage rates',
        sampleQuestionType: 'word_problem',
      },
      {
        id: 'p2_u4',
        name: 'Patterns, Expressions & Linear Equations',
        strand: 'Algebra',
        subtopics: ['Identifying patterns and predicting elements', 'Graphing relations on the number plane', 'Creating simple algebraic expressions', 'Operations on algebraic terms', 'Translating word problems to linear equations', 'Solving one-variable linear equations'],
        keyConcept: 'Formulating algebraic expressions and solving linear equations',
        sampleQuestionType: 'missing_value',
      },
      {
        id: 'p2_u5',
        name: 'Geometry, Bearings & Vectors',
        strand: 'Geometry and Measurement',
        subtopics: ['Angle types, measuring and angle relationships', 'Constructing angles and line bisectors', 'Perimeter and area of composite shapes', 'Bearings and back bearings', 'Scalar vs vector quantities', 'Vector magnitude and direction', 'Transformations and coordinate reflections', 'Translation vectors, congruence and similarity'],
        keyConcept: 'Geometric constructions, bearings, Cartesian vectors, and planar transformations',
        sampleQuestionType: 'direct_calculation',
      },
      {
        id: 'p2_u6',
        name: 'Data Collection & Probability',
        strand: 'Data',
        subtopics: ['Methods of data collection and organization', 'Presenting data with frequency tables', 'Visualizing data with charts', 'Measures of central tendency (mean, median, mode)', 'Calculating probability and sample spaces'],
        keyConcept: 'Statistical summaries and theoretical probability calculations',
        sampleQuestionType: 'reasoning',
      },
    ],
    totalTopicsCount: 38,
  },
  {
    id: 3,
    title: 'Basic 8 (JHS Year 2)',
    levelBadge: 'Basic 8 / JHS 2',
    subtitle: 'Billion Numeration, Indices, Gradients & Polygons',
    description: 'Junior High School Year 2 syllabus: numbers over one billion, standard form, laws of indices, algebraic fractions, gradients, linear inequalities, polygon angle theorems, and tree diagrams.',
    badge: '📐',
    accentColor: '#8b5cf6',
    bgGradient: 'from-purple-500/20 via-violet-500/10 to-transparent',
    borderColor: 'border-purple-300 dark:border-purple-700',
    strands: ['Number', 'Algebra', 'Geometry and Measurement', 'Handling Data'],
    units: [
      {
        id: 'p3_u1',
        name: 'Large Numbers, Standard Form & Indices',
        strand: 'Number',
        subtopics: ['Place value for numbers over one billion', 'Expressing integers in standard form (scientific notation)', 'Sets, perfect squares and square roots', 'Multiplication and division by powers of 10', 'Laws of indices and exponential notation', 'Decimal operations in real-world contexts'],
        keyConcept: 'Scientific standard form, index laws, and billion-scale place values',
        sampleQuestionType: 'direct_calculation',
      },
      {
        id: 'p3_u2',
        name: 'Fractions Operations & Ratio Reasoning',
        strand: 'Number',
        subtopics: ['Fractions operations and BODMAS', 'Reducing fractions and mixed conversions', 'Unit conversion using ratio reasoning', 'Proportional relationships and rates'],
        keyConcept: 'Order of operations on fractions and proportional reasoning',
        sampleQuestionType: 'direct_calculation',
      },
      {
        id: 'p3_u3',
        name: 'Linear Equations, Gradient & Inequalities',
        strand: 'Algebra',
        subtopics: ['Gradient of straight lines', 'Equations of straight lines $y = mx + c$', 'Using linear graphs to solve real problems', 'Distributive property and expanding algebraic expressions', 'Operations with algebraic fractions', 'Substitution and algebraic evaluations', 'Factorization of algebraic expressions', 'Linear inequalities in one variable', 'Graphing inequalities on the number line'],
        keyConcept: 'Line gradients, algebraic fractions, factoring, and linear inequalities',
        sampleQuestionType: 'missing_value',
      },
      {
        id: 'p3_u4',
        name: 'Angles, Polygons & Trigonometry',
        strand: 'Geometry and Measurement',
        subtopics: ['Parallel lines and transversals', 'Angle sum of triangles', 'Sum of interior and exterior angles in polygons $(n-2) \\times 180^\\circ$', 'Area and circumference of circles', 'Pythagorean theorem $a^2 + b^2 = c^2$', 'Trigonometric ratios (sine, cosine, tangent)', 'Geometric angle and line constructions', 'Locus of points'],
        keyConcept: 'Polygon angle theorems, right-triangle trigonometry, and geometric loci',
        sampleQuestionType: 'direct_calculation',
      },
      {
        id: 'p3_u5',
        name: 'Vectors & Rotations',
        strand: 'Geometry and Measurement',
        subtopics: ['Vector addition and column notation', 'Vector subtraction', 'Scalar multiplication of vectors', 'Vector equality', 'Rotations around origin', 'Counterclockwise rotational rules and congruence'],
        keyConcept: 'Vector arithmetic, scalar scaling, and planar rotations',
        sampleQuestionType: 'direct_calculation',
      },
      {
        id: 'p3_u6',
        name: 'Data Visualization & Independent Probability',
        strand: 'Handling Data',
        subtopics: ['Data types and collection techniques', 'Bar charts and pie charts', 'Stem-and-leaf plots and waffle charts', 'Measures of central tendencies', 'Probability of independent events', 'Probability tree diagrams'],
        keyConcept: 'Data distributions, stem-and-leaf plots, and compound probability trees',
        sampleQuestionType: 'reasoning',
      },
    ],
    totalTopicsCount: 39,
  },
  {
    id: 4,
    title: 'Basic 9 (JHS Year 3 / BECE)',
    levelBadge: 'Basic 9 / BECE Prep',
    subtitle: 'Surds, VAT/NHIL, Simultaneous Equations & Prisms',
    description: 'Junior High School Year 3 / BECE graduation curriculum: surds, financial math (VAT, NHIL, simple interest, commission), simultaneous equations, triangle similarity, prism surface area, and histograms.',
    badge: '🏆',
    accentColor: '#f59e0b',
    bgGradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    borderColor: 'border-amber-300 dark:border-amber-700',
    strands: ['Number', 'Algebra', 'Geometry and Measurements', 'Handling Data'],
    units: [
      {
        id: 'p4_u1',
        name: 'Number Systems, Rational Numbers & Surds',
        strand: 'Number',
        subtopics: ['Integers and significant figures', 'Rational numbers and Venn diagrams in sets', 'Word problems with four operations', 'Understanding surds and radical rules', 'Simplifying surds and like radical operations'],
        keyConcept: 'Set-theoretic Venn diagrams, significant figures, and radical surd simplification',
        sampleQuestionType: 'direct_calculation',
      },
      {
        id: 'p4_u2',
        name: 'Advanced Fractions & Commercial Mathematics',
        strand: 'Number',
        subtopics: ['Order of operations with fractions (BODMAS)', 'Fundamental proportional relationships', 'Simple interest formula $I = Prt$', 'Value-Added Tax (VAT) and NHIL calculations', 'Commercial discounts and commissions', 'Depreciation of capital goods'],
        keyConcept: 'Applied commercial arithmetic: interest, taxes (VAT/NHIL), discounts and depreciation',
        sampleQuestionType: 'word_problem',
      },
      {
        id: 'p4_u3',
        name: 'Linear Relations, Simultaneous Equations & Change of Subject',
        strand: 'Algebra',
        subtopics: ['Graphing linear relations', 'Solving simultaneous linear equations', 'Change of subject of formulas', 'Algebraic substitutions', 'Factorization techniques', 'Solving linear inequalities and boundary problems'],
        keyConcept: 'Two-variable linear systems, literal formula rearranging, and inequality domains',
        sampleQuestionType: 'missing_value',
      },
      {
        id: 'p4_u4',
        name: 'Polygons, Similar Triangles & Constructions',
        strand: 'Geometry and Measurements',
        subtopics: ['Polygons and interior/exterior angle problems', 'Congruent and similar triangles', 'Scale factors in geometric figures', 'Constructing the incenter and incircle of a triangle', 'Constructing the circumcenter and circumcircle', 'Constructing quadrilaterals with given constraints'],
        keyConcept: 'Triangle similarity ratios, in-circle/circum-circle constructions, and quadrilaterals',
        sampleQuestionType: 'direct_calculation',
      },
      {
        id: 'p4_u5',
        name: 'Prisms, Vectors & Enlargements',
        strand: 'Geometry and Measurements',
        subtopics: ['Prisms and nets of 3D shapes', 'Surface area of prisms and cylinders', 'Position vectors and vector laws', 'Parallel and perpendicular vectors', 'Enlargements, center of enlargement and scale factor $k$', 'Area scaling under enlargements ($k^2$)'],
        keyConcept: '3D prism surface areas, vector orthogonality, and enlargement scale factors',
        sampleQuestionType: 'direct_calculation',
      },
      {
        id: 'p4_u6',
        name: 'Data Organization, Histograms & Dependent Probability',
        strand: 'Handling Data',
        subtopics: ['Quantitative vs qualitative data comparison', 'Frequency tables and grouped distributions', 'Histograms and modal classes', 'Survey design and bias prevention', 'Probability of dependent events without replacement', 'Tree diagrams for dependent events'],
        keyConcept: 'Grouped histograms, modal classes, and conditional/dependent event probability',
        sampleQuestionType: 'reasoning',
      },
    ],
    totalTopicsCount: 41,
  },
  {
    id: 5,
    title: 'Core Mathematics 1 (SHS Year 1)',
    levelBadge: 'SHS Core 1',
    subtitle: 'Real Numbers, Quadratic Trinomials & Trigonometric Ratios',
    description: 'Senior High School Core Year 1 syllabus: real number closure, De Morgan’s laws, quadratic factorization, algebraic fractions, Cartesian coordinate geometry, special trigonometry angles, and probability.',
    badge: '📜',
    accentColor: '#06b6d4',
    bgGradient: 'from-cyan-500/20 via-sky-500/10 to-transparent',
    borderColor: 'border-cyan-300 dark:border-cyan-700',
    strands: ['Number Sets', 'Algebra', 'Coordinate Geometry', 'Statistics & Probability'],
    units: [
      {
        id: 'p5_u1',
        name: 'Number Sets, Real Numbers & De Morgan’s Laws',
        strand: 'Number Sets',
        subtopics: ['Classification of real numbers $(\\mathbb{N}, \\mathbb{Z}, \\mathbb{Q}, \\mathbb{R})$', 'Closure property of number sets', 'Rational vs irrational numbers', 'Expressing recurring decimals as fractions', 'Properties of real numbers (commutative, associative, distributive)', 'Set operations, subsets and power sets', 'De Morgan’s laws $(A \\cup B)\' = A\' \\cap B\'$'],
        keyConcept: 'Real number axioms, recurring decimal conversion, and formal set theory',
        sampleQuestionType: 'direct_calculation',
      },
      {
        id: 'p5_u2',
        name: 'Fractions & Financial Percentages',
        strand: 'Number Sets',
        subtopics: ['Fractions operations and inverses', 'BODMAS with complex fractions', 'Percentage increase and decrease', 'Discounts, sale prices, profit and loss', 'Commission calculations', 'Simple and compound interest formulas'],
        keyConcept: 'Fraction arithmetic rigor and compound financial percentage modeling',
        sampleQuestionType: 'word_problem',
      },
      {
        id: 'p5_u3',
        name: 'Algebraic Expressions, Quadratic Trinomials & Fractions',
        strand: 'Algebra',
        subtopics: ['Operations with algebraic expressions', 'Factorizing quadratic trinomials $ax^2 + bx + c$', 'Factorizing by splitting the middle term', 'Perfect squares and difference of two squares', 'Algebraic fractions with monomial and binomial denominators', 'Zero and undefined algebraic fractions ($x$ values where denom $= 0$)', 'Changing subject of formulas with radicals and fractions'],
        keyConcept: 'Factoring quadratic trinomials, algebraic fractions, and undefined restrictions',
        sampleQuestionType: 'missing_value',
      },
      {
        id: 'p5_u4',
        name: 'Relations, Functions & Coordinate Geometry',
        strand: 'Algebra',
        subtopics: ['Types of relations (one-to-one, one-to-many, many-to-one)', 'Mappings, rules and function notation $f(x)$', 'Linear functions and graphs', 'Gradient of straight lines $m = \\frac{y_2 - y_1}{x_2 - x_1}$', 'Equations of straight lines in point-slope and intercept form', 'Parallel lines ($m_1 = m_2$) and perpendicular lines ($m_1 m_2 = -1$)', 'Distance and midpoint formulas between two points'],
        keyConcept: 'Coordinate geometry formulas: gradients, perpendicular conditions, and line equations',
        sampleQuestionType: 'direct_calculation',
      },
      {
        id: 'p5_u5',
        name: 'Angles, Pythagoras, Vectors & Special Trig Angles',
        strand: 'Coordinate Geometry',
        subtopics: ['Angle pairs, parallel lines and transversals', 'Exterior angle theorem and polygon sums', 'Pythagorean theorem in 2D and 3D applications', 'Vector magnitude $|\\mathbf{v}| = \\sqrt{x^2 + y^2}$', 'Trigonometric ratios (SOH CAH TOA)', 'Special angles $30^\\circ, 45^\\circ, 60^\\circ$ exact radical values', 'Perimeter, area of composite 2D shapes, and prism volume'],
        keyConcept: 'Exact special angle trigonometry values $(\\sin 30^\\circ = \\frac{1}{2}, \\tan 45^\\circ = 1)$ and vectors',
        sampleQuestionType: 'direct_calculation',
      },
      {
        id: 'p5_u6',
        name: 'Data Presentation, Central Tendency & Probability',
        strand: 'Statistics & Probability',
        subtopics: ['Grouped vs ungrouped data', 'Quantitative vs qualitative data', 'Data presentation and frequency tables', 'Measures of central tendency (mean, median, mode)', 'Effect of extreme outlier values on the mean', 'Probability of independent events', 'Multiplication rule $P(A \\cap B) = P(A) \\times P(B)$ and tree diagrams'],
        keyConcept: 'Grouped frequency statistics, outlier sensitivity, and independent probability rule',
        sampleQuestionType: 'reasoning',
      },
    ],
    totalTopicsCount: 40,
  },
  {
    id: 6,
    title: 'Core Mathematics 2 (SHS Year 2)',
    levelBadge: 'SHS Core 2',
    subtitle: 'Modular Arithmetic, AP/GP Sequences, 3D Solids & Ogives',
    description: 'Senior High School Core Year 2 syllabus: modular arithmetic, surd division and rationalization, AP & GP series, simultaneous systems, 3D solids surface area & volume, cumulative frequency ogives, and box plots.',
    badge: '🔮',
    accentColor: '#ec4899',
    bgGradient: 'from-pink-500/20 via-rose-500/10 to-transparent',
    borderColor: 'border-pink-300 dark:border-pink-700',
    strands: ['Algebra', 'Functions', 'Geometry', 'Statistics'],
    units: [
      {
        id: 'p6_u1',
        name: 'Surds, Indices, Logarithms & Modular Arithmetic',
        strand: 'Algebra',
        subtopics: ['Surd operations, division and rationalization of denominators', 'Fundamental index laws and fractional exponents', 'Logarithm definition $\\log_b(a) = c \\iff b^c = a$', 'Properties of logarithms and real-world applications', 'Introduction to modular arithmetic (clock arithmetic, $\\pmod m$ operations)'],
        keyConcept: 'Rationalizing surd denominators, logarithmic properties, and modular clock arithmetic',
        sampleQuestionType: 'direct_calculation',
      },
      {
        id: 'p6_u2',
        name: 'Ratios, Proportions & Simultaneous Equations',
        strand: 'Algebra',
        subtopics: ['Ratios vs rates comparison', 'Cross products and proportion equations', 'Similar triangles and scale factors', 'Simultaneous linear equations by substitution', 'Simultaneous linear equations by elimination', 'Graphical solution and intersection point of simultaneous lines'],
        keyConcept: 'Solving two-variable linear systems analytically and graphically',
        sampleQuestionType: 'missing_value',
      },
      {
        id: 'p6_u3',
        name: 'Sequences and Series (AP and GP)',
        strand: 'Functions',
        subtopics: ['Fibonacci sequence and historical contexts', 'Arithmetic Progressions (A.P.): $n$-th term $U_n = a + (n-1)d$', 'Sum of natural numbers and A.P. sum $S_n = \\frac{n}{2}[2a + (n-1)d]$', 'Geometric Progressions (G.P.): $n$-th term $U_n = ar^{n-1}$', 'Sum of finite Geometric Sequences $S_n = \\frac{a(r^n - 1)}{r - 1}$', 'Real-world compound growth modeling'],
        keyConcept: 'Formulaic mastery of arithmetic and geometric progressions and series sums',
        sampleQuestionType: 'direct_calculation',
      },
      {
        id: 'p6_u4',
        name: '2D Transformations & Vector Applications',
        strand: 'Geometry',
        subtopics: ['Translation transformations on coordinate plane', 'Reflection transformations across axes and lines $y = x$', 'Rotation transformations around origin ($90^\\circ, 180^\\circ, 270^\\circ$)', 'Enlargement transformations with fractional/negative scale factors', 'Vector position, resultant vectors and polygon law of vectors'],
        keyConcept: 'Geometric transformation coordinate mapping rules and resultant vector sums',
        sampleQuestionType: 'direct_calculation',
      },
      {
        id: 'p6_u5',
        name: 'Trigonometry Applications, 3D Solids & Volume',
        strand: 'Geometry',
        subtopics: ['Inverse trigonometric functions $(\\sin^{-1}, \\cos^{-1}, \\tan^{-1})$', 'Unit circle reference angles', 'Angles of elevation and depression in word problems', 'Surface area of cylinders, cones, and spheres', 'Volume and capacity of 3D solids $(V = \\frac{1}{3}\\pi r^2 h, V = \\frac{4}{3}\\pi r^3)$', 'Metric and imperial volume conversion'],
        keyConcept: 'Elevation/depression triangles, cone/sphere surface areas and volumes',
        sampleQuestionType: 'word_problem',
      },
      {
        id: 'p6_u6',
        name: 'Data Analysis, Ogives, Box Plots & Dependent Events',
        strand: 'Statistics',
        subtopics: ['Survey design principles and bias identification', 'Ogives (cumulative frequency curves) and estimating medians/quartiles', 'Waffle diagrams and box-and-whisker plots', 'Measures of dispersion: range, interquartile range (IQR)', 'Variance and standard deviation formulas', 'Dependent events and conditional probability experiments'],
        keyConcept: 'Cumulative frequency ogive analysis, box-and-whisker quartiles, and standard deviation',
        sampleQuestionType: 'reasoning',
      },
    ],
    totalTopicsCount: 38,
  },
  {
    id: 7,
    title: 'Advanced Core & Reasoning (SHS Year 3)',
    levelBadge: 'SHS Core 3 / WASSCE',
    subtitle: 'Formal Logic, Variations, Circle Theorems & Bivariate Data',
    description: 'Senior High School Core Year 3 / WASSCE capstone: propositional logic and truth tables, variations (direct, inverse, joint, partial), circle geometry theorems, trigonometric graphs, and scatter plots.',
    badge: '🧠',
    accentColor: '#6366f1',
    bgGradient: 'from-indigo-500/20 via-blue-500/10 to-transparent',
    borderColor: 'border-indigo-300 dark:border-indigo-700',
    strands: ['Logic & Reasoning', 'Variations & Quadratics', 'Circle Geometry', 'Bivariate Statistics'],
    units: [
      {
        id: 'p7_u1',
        name: 'Mathematical Logic & Reasoning',
        strand: 'Logic & Reasoning',
        subtopics: ['Statements, propositions and truth values', 'Logical connectives: negation $(\\neg p)$, conjunction $(p \\land q)$, disjunction $(p \\lor q)$', 'Conditional $(p \\implies q)$ and biconditional $(p \\iff q)$', 'Truth table construction and tautology/contradiction analysis', 'Venn diagrams for logical arguments', 'Valid deductive arguments and rules of inference'],
        keyConcept: 'Truth table logic, conditional statements, and syllogistic inference validation',
        sampleQuestionType: 'reasoning',
      },
      {
        id: 'p7_u2',
        name: 'Proportional Reasoning & Variations',
        strand: 'Variations & Quadratics',
        subtopics: ['Direct variation $y = kx$ and constant of proportionality', 'Inverse variation $y = \\frac{k}{x}$', 'Joint variation $y = kxz$ (multiple variables)', 'Partial variation $y = a + kx$ (fixed cost plus variable rate)', 'Word problems modeling physics, economics and engineering rates'],
        keyConcept: 'Formulating equations of variation and solving for constants $k$',
        sampleQuestionType: 'word_problem',
      },
      {
        id: 'p7_u3',
        name: 'Quadratic Equations & Functions',
        strand: 'Variations & Quadratics',
        subtopics: ['Factorization and quadratic formula $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$', 'Graphical analysis of parabolas: vertex, axis of symmetry, intercepts', 'The discriminant $\\Delta = b^2 - 4ac$ and nature of roots', 'Solving simultaneous linear and quadratic equations algebraically and graphically', 'Max/min optimization in parabolic projectile problems'],
        keyConcept: 'Discriminant root classification, vertex form, and simultaneous line-parabola systems',
        sampleQuestionType: 'missing_value',
      },
      {
        id: 'p7_u4',
        name: 'Circle Geometry & Theorems',
        strand: 'Circle Geometry',
        subtopics: ['Angle at center is twice angle at circumference', 'Angles in the same segment of a circle are equal', 'Angle in a semicircle is a right angle ($90^\\circ$)', 'Opposite angles of a cyclic quadrilateral sum to $180^\\circ$', 'Tangent to a circle is perpendicular to the radius at contact', 'Alternate segment theorem (tangent-chord angle)', 'Tangents from an external point are equal in length'],
        keyConcept: 'Rigorous geometric deductions using Euclidean circle theorems',
        sampleQuestionType: 'direct_calculation',
      },
      {
        id: 'p7_u5',
        name: 'Trigonometric Functions, Graphing & Constructions',
        strand: 'Circle Geometry',
        subtopics: ['Graphs of $y = \\sin x, y = \\cos x, y = \\tan x$', 'Amplitude, period and phase transformations of sine/cosine curves', 'Precise geometric angle constructions ($60^\\circ, 90^\\circ, 45^\\circ, 30^\\circ, 75^\\circ$)', 'Triangle and quadrilateral constructions under given constraints', 'Locus theorems: equidistant from points, parallel lines, intersecting lines'],
        keyConcept: 'Sine/cosine wave characteristics (amplitude/period) and Euclidean loci',
        sampleQuestionType: 'direct_calculation',
      },
      {
        id: 'p7_u6',
        name: 'Bivariate Data Analysis & Probability Decisions',
        strand: 'Bivariate Statistics',
        subtopics: ['Understanding bivariate data and paired observations', 'Scatter plots and correlation direction (positive, negative, zero)', 'Line of best fit (trend line) estimation', 'Probability in real-life risk evaluation and insurance decisions', 'Conditional probability $P(A|B) = \\frac{P(A \\cap B)}{P(B)}$', 'Fundamental probability addition and multiplication laws'],
        keyConcept: 'Scatter plot trend correlation and conditional probability decision trees',
        sampleQuestionType: 'reasoning',
      },
    ],
    totalTopicsCount: 36,
  },
  {
    id: 8,
    title: 'Elective Mathematics 1 (SHS Elective 1)',
    levelBadge: 'Elective Math 1',
    subtitle: 'Binary Ops, Binomial Theorem, Matrices, Lines & Calculus Preview',
    description: 'Senior High School Elective Year 1 curriculum: binary operations, binomial expansions, surd radical equations, polynomial remainder/factor theorems, matrices & 2x2 inverses, and limits & first-principle differentiation.',
    badge: '⚡',
    accentColor: '#e11d48',
    bgGradient: 'from-rose-500/20 via-pink-500/10 to-transparent',
    borderColor: 'border-rose-300 dark:border-rose-700',
    strands: ['Algebra & Number Theory', 'Relations & Polynomials', 'Matrices & Lines', 'Calculus & Probability'],
    units: [
      {
        id: 'p8_u1',
        name: 'Binary Operations & Set Theory',
        strand: 'Algebra & Number Theory',
        subtopics: ['Evaluating binary operations $a * b$', 'Properties: closure, commutativity, associativity, distributive', 'Identity element $e$ such that $a * e = a$', 'Inverse elements $a^{-1}$ such that $a * a^{-1} = e$', 'Set theory definitions, operations and Venn problem solving'],
        keyConcept: 'Abstract algebra axioms: identities, inverses, and algebraic closure',
        sampleQuestionType: 'direct_calculation',
      },
      {
        id: 'p8_u2',
        name: 'Binomial Theorem, Surds & Logarithmic Equations',
        strand: 'Algebra & Number Theory',
        subtopics: ['Pascal’s triangle and combinations $\\binom{n}{r} = \\frac{n!}{r!(n-r)!}$', 'Binomial expansion $(a + b)^n$ for positive integer $n$', 'Finding specific terms in a binomial expansion', 'Simplifying complex surds and square roots of surds $\\sqrt{a + \\sqrt{b}}$', 'Solving radical equations (surd equations)', 'Exponential equations and logarithmic equations with change of base'],
        keyConcept: 'Binomial expansion coefficients and radical/exponential equation solving',
        sampleQuestionType: 'missing_value',
      },
      {
        id: 'p8_u3',
        name: 'Functions, Linear Programming & Polynomials',
        strand: 'Relations & Polynomials',
        subtopics: ['Domain, range and zeros of functions', 'Composite functions $(f \\circ g)(x) = f(g(x))$', 'Inverse functions $f^{-1}(x)$ and conditions for invertibility', 'Linear programming: graphing inequalities and feasibility regions', 'Polynomial division, remainder theorem and factor theorem', 'Solving cubic equations and determining nature of roots via discriminant'],
        keyConcept: 'Function composition, inverse functions, linear programming, and factor theorem',
        sampleQuestionType: 'direct_calculation',
      },
      {
        id: 'p8_u4',
        name: 'Rational Functions & Matrices',
        strand: 'Matrices & Lines',
        subtopics: ['Domain, range and vertical/horizontal asymptotes of rational functions', 'Decomposition into partial fractions (linear factors)', 'Matrix addition, subtraction and multiplication', 'Determinant of $2 \\times 2$ matrices $\\det(A) = ad - bc$', 'Inverse of a $2 \\times 2$ matrix $A^{-1} = \\frac{1}{\\det(A)} \\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}$', 'Solving systems of linear equations using matrices'],
        keyConcept: 'Partial fraction decomposition and $2 \\times 2$ matrix inversion',
        sampleQuestionType: 'direct_calculation',
      },
      {
        id: 'p8_u5',
        name: 'Straight Lines, Vectors & Trigonometric Functions',
        strand: 'Matrices & Lines',
        subtopics: ['Distance between two points and internal/external division of a line segment', 'General straight line equation $Ax + By + C = 0$', 'Acute angle between two intersecting lines $\\tan \\theta = \\left|\\frac{m_1 - m_2}{1 + m_1 m_2}\\right|$', 'Vector forms, parallelogram law and dot product introduction', 'Trigonometric functions across 4 quadrants and ASTC rule', 'Radian measurement and arc length $s = r\\theta$, sector area $A = \\frac{1}{2}r^2\\theta$'],
        keyConcept: 'Angle between intersecting lines, radian sector geometry, and quadrant signs',
        sampleQuestionType: 'direct_calculation',
      },
      {
        id: 'p8_u6',
        name: 'Limits, Differentiation & Permutations/Combinations',
        strand: 'Calculus & Probability',
        subtopics: ['Concept of limits $\\lim_{x \\to a} f(x)$ and indeterminate forms', 'Continuity of functions', 'Differentiating polynomial functions from first principles $\\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$', 'Power rule for differentiation $\\frac{d}{dx}[x^n] = n x^{n-1}$', 'Equations of tangents and normals to curves', 'Permutations $^nP_r$ and combinations $^nC_r$ counting principles'],
        keyConcept: 'First-principles differentiation, tangent line equations, and combinatorics',
        sampleQuestionType: 'direct_calculation',
      },
    ],
    totalTopicsCount: 42,
  },
  {
    id: 9,
    title: 'Elective Mathematics 2 (SHS Elective 2)',
    levelBadge: 'Elective Math 2',
    subtitle: 'Calculus, Partial Fractions, Circle Equations & Vectors',
    description: 'Senior High School Elective Year 2 curriculum: fractional binomial expansions, recurrence series convergence, $3 \\times 3$ matrices, circle equations, spatial vectors & dot products, implicit differentiation, and definite integration.',
    badge: '🚀',
    accentColor: '#14b8a6',
    bgGradient: 'from-teal-500/20 via-emerald-500/10 to-transparent',
    borderColor: 'border-teal-300 dark:border-teal-700',
    strands: ['Advanced Algebra & Series', 'Geometry & Vectors', 'Differential Calculus', 'Integral Calculus & Statistics'],
    units: [
      {
        id: 'p9_u1',
        name: 'Advanced Sets, Binomial Expansions & Series Convergence',
        strand: 'Advanced Algebra & Series',
        subtopics: ['De Morgan’s complete framework and formal set algebra proofs', 'Binomial expansion with negative and fractional exponents $(1 + x)^n$', 'Validity condition $|x| < 1$ for infinite binomial series', 'Arithmetic and geometric means', 'Infinite geometric series and sum to infinity $S_\\infty = \\frac{a}{1 - r}$', 'Recurrence relations and convergence vs divergence of series'],
        keyConcept: 'Infinite binomial expansions $(1+x)^n$ for fractional $n$ and sum to infinity',
        sampleQuestionType: 'direct_calculation',
      },
      {
        id: 'p9_u2',
        name: 'Polynomial Zeros, Partial Fractions & $3 \\times 3$ Matrices',
        strand: 'Advanced Algebra & Series',
        subtopics: ['Rational Zeros theorem and Descartes’ rule of signs', 'Fundamental theorem of algebra and complex conjugate roots', 'Advanced partial fraction decomposition (repeated and irreducible quadratic factors)', 'Determinant of $3 \\times 3$ matrices using minors and cofactors', 'Singular vs non-singular matrices $(\\det = 0)$', 'Matrix inverse formula $A^{-1} = \\frac{1}{\\det(A)} \\text{adj}(A)$'],
        keyConcept: 'Complex roots of polynomials, $3 \\times 3$ determinants and adjugate inverses',
        sampleQuestionType: 'missing_value',
      },
      {
        id: 'p9_u3',
        name: 'Circle Equations, Tangents, Normals & Loci',
        strand: 'Geometry & Vectors',
        subtopics: ['General equation of a circle $x^2 + y^2 + 2gx + 2fy + c = 0$', 'Center $(-g, -f)$ and radius $r = \\sqrt{g^2 + f^2 - c}$', 'Finding equation of circle given 3 points or diameter endpoints', 'Equation of tangent and normal to a circle at a given point', 'Length of tangent from external point', 'Loci problems in Cartesian coordinate planes'],
        keyConcept: 'General circle equations, radius/center extraction, and tangent/normal lines',
        sampleQuestionType: 'direct_calculation',
      },
      {
        id: 'p9_u4',
        name: 'Spatial Reasoning with Vectors & Trig Identities',
        strand: 'Geometry & Vectors',
        subtopics: ['3D Cartesian vectors $\\mathbf{v} = x\\mathbf{i} + y\\mathbf{j} + z\\mathbf{k}$ and unit vectors', 'Scalar (dot) product $\\mathbf{a} \\cdot \\mathbf{b} = |\\mathbf{a}||\\mathbf{b}|\\cos \\theta$', 'Orthogonality condition $\\mathbf{a} \\cdot \\mathbf{b} = 0$', 'Vector projection of $\\mathbf{a}$ onto $\\mathbf{b}$', 'Compound angle formulas $\\sin(A \\pm B), \\cos(A \\pm B), \\tan(A \\pm B)$', 'Double angle formulas $(\\sin 2A, \\cos 2A, \\tan 2A)$ and half-angle identities', 'Verifying advanced trigonometric identities'],
        keyConcept: 'Vector dot products, 3D projections, and compound/double angle formulas',
        sampleQuestionType: 'direct_calculation',
      },
      {
        id: 'p9_u5',
        name: 'Differential Calculus, Implicit & Optimization',
        strand: 'Differential Calculus',
        subtopics: ['Product rule $\\frac{d}{dx}[uv] = u\\frac{dv}{dx} + v\\frac{du}{dx}$ and quotient rule', 'Chain rule for composite functions', 'Implicit differentiation $\\frac{d}{dx}[y^2] = 2y\\frac{dy}{dx}$', 'Derivatives of trigonometric functions $(\\sin x, \\cos x, \\tan x)$', 'Second derivatives $\\frac{d^2 y}{dx^2}$ and concavity', 'Finding stationary points, local maxima, minima, and points of inflection', 'Real-world optimization problems (maximizing volume, minimizing surface area)'],
        keyConcept: 'Product/quotient/chain rules, implicit differentiation, and optimization extrema',
        sampleQuestionType: 'direct_calculation',
      },
      {
        id: 'p9_u6',
        name: 'Integration & Area Under Curves',
        strand: 'Integral Calculus & Statistics',
        subtopics: ['Indefinite integrals as anti-derivatives $\\int x^n dx = \\frac{x^{n+1}}{n+1} + C$', 'Definite integrals $\\int_a^b f(x) dx = F(b) - F(a)$', 'Area under curves using integration', 'Area between two curves $\\int_a^b [f(x) - g(x)] dx$', 'Numerical integration: Trapezium rule', 'Probability axioms, multiplication law, and permutations/combinations'],
        keyConcept: 'Definite integration, area between curves, and the Trapezium rule',
        sampleQuestionType: 'direct_calculation',
      },
    ],
    totalTopicsCount: 44,
  },
  {
    id: 10,
    title: 'Further Mathematics & Mastery',
    levelBadge: 'Further Math Mastery',
    subtitle: 'Linear Transformations, Harmonic Form, Volumes of Revolution & Correlation',
    description: 'Premier WASSCE Elective & Further Mathematics capstone: compound statements & truth tables, linear transformation matrices, harmonic form $R\\cos(\\theta \\pm \\alpha)$, integration by substitution, volumes of revolution, and Spearman’s rank correlation.',
    badge: '👑',
    accentColor: '#8b5cf6',
    bgGradient: 'from-violet-500/20 via-purple-500/10 to-transparent',
    borderColor: 'border-violet-300 dark:border-violet-700',
    strands: ['Advanced Logic', 'Transformations & Parabolas', 'Trigonometric Modeling', 'Integral Calculus & Advanced Stats'],
    units: [
      {
        id: 'p10_u1',
        name: 'Mathematical Logic, Implications & Converses',
        strand: 'Advanced Logic',
        subtopics: ['Statement notation, truth values and compound propositions', 'Negation of statements and De Morgan’s laws in propositional logic', 'Implications $(p \\implies q)$, converse $(q \\implies p)$, inverse $(\\neg p \\implies \\neg q)$, and contrapositive $(\\neg q \\implies \\neg p)$', 'Equivalence of implication and contrapositive', 'Truth tables for complex compound propositions'],
        keyConcept: 'Formal contrapositives, logical equivalences, and truth table proof trees',
        sampleQuestionType: 'reasoning',
      },
      {
        id: 'p10_u2',
        name: 'Linear Transformations & Transformation Matrices',
        strand: 'Transformations & Parabolas',
        subtopics: ['Linear transformation matrices acting on coordinate vectors $\\begin{pmatrix} x\' \\\\ y\' \\end{pmatrix} = M \\begin{pmatrix} x \\\\ y \\end{pmatrix}$', 'Determining image and object points under $2 \\times 2$ matrices', 'Matrix representation of reflections across lines $y = mx$', 'Matrix representation of rotations by angle $\\theta$ around origin $\\begin{pmatrix} \\cos \\theta & -\\sin \\theta \\\\ \\sin \\theta & \\cos \\theta \\end{pmatrix}$', 'Matrix representation of enlargements and shears', 'Composition of transformations $M_2 M_1$ and area scale factors $|\\det(M)|$'],
        keyConcept: 'Transformation matrices, rotation matrices, and composition matrix multiplication',
        sampleQuestionType: 'direct_calculation',
      },
      {
        id: 'p10_u3',
        name: 'Quadratic Functions, Parabolas & Normals',
        strand: 'Transformations & Parabolas',
        subtopics: ['Geometric definition of a parabola: focus and directrix', 'Standard equations of parabolas $y^2 = 4ax$ and $x^2 = 4ay$', 'Parametric coordinates of a parabola $(at^2, 2at)$', 'Equations of tangents and normals to parabolas at given points', 'Intersection of lines and parabolas and condition for tangency $c = \\frac{a}{m}$'],
        keyConcept: 'Focus-directrix parabolas, parametric equations, and tangent/normal lines',
        sampleQuestionType: 'direct_calculation',
      },
      {
        id: 'p10_u4',
        name: 'Trigonometric Modeling & Harmonic Form',
        strand: 'Trigonometric Modeling',
        subtopics: ['Modeling periodic phenomena with sinusoidal functions', 'Expressing $a\\cos \\theta + b\\sin \\theta$ in harmonic form $R\\cos(\\theta - \\alpha)$ where $R = \\sqrt{a^2 + b^2}, \\tan \\alpha = \\frac{b}{a}$', 'Finding maximum and minimum values of linear combinations of sine and cosine', 'Solving trigonometric equations of the form $a\\cos \\theta + b\\sin \\theta = c$'],
        keyConcept: 'Harmonic wave reduction $R\\cos(\\theta \\pm \\alpha)$ and maximum/minimum value extraction',
        sampleQuestionType: 'direct_calculation',
      },
      {
        id: 'p10_u5',
        name: 'Advanced Integration Techniques & Volumes of Revolution',
        strand: 'Integral Calculus & Advanced Stats',
        subtopics: ['Integration by substitution method $\\int f(g(x))g\'(x) dx$', 'Integration of exponential functions $\\int e^{kx} dx = \\frac{1}{k}e^{kx} + C$', 'Integration yielding logarithms $\\int \\frac{f\'(x)}{f(x)} dx = \\ln|f(x)| + C$', 'Trapezium rule for approximate numerical integration', 'Volumes of revolution around the x-axis: $V = \\pi \\int_a^b [y(x)]^2 dx$', 'Volumes of revolution around the y-axis: $V = \\pi \\int_c^d [x(y)]^2 dy$', 'Total, net and signed areas under curves'],
        keyConcept: 'Integration by substitution and volumes of solid revolution $V = \\pi \\int y^2 dx$',
        sampleQuestionType: 'direct_calculation',
      },
      {
        id: 'p10_u6',
        name: 'Correlation Analysis & Binomial Probability Distribution',
        strand: 'Integral Calculus & Advanced Stats',
        subtopics: ['Constructing and interpreting scatter plots with lines of best fit', 'Spearman’s rank correlation coefficient $r_s = 1 - \\frac{6\\sum d^2}{n(n^2 - 1)}$', 'Interpreting rank correlation strength and significance', 'Binomial probability distribution $P(X = k) = \\binom{n}{k} p^k (1-p)^{n-k}$', 'Mean $\\mu = np$ and variance $\\sigma^2 = np(1-p)$ of a binomial distribution', 'Permutations and combinations applied to industrial and commercial operations'],
        keyConcept: 'Spearman’s rank correlation coefficient and binomial probability distributions',
        sampleQuestionType: 'reasoning',
      },
    ],
    totalTopicsCount: 40,
  },
];

/**
 * Helper to fetch a Part by ID (1 to 10)
 */
export function getCurriculumPart(partId: number): CurriculumPart {
  const safeId = Math.max(1, Math.min(10, Math.floor(partId)));
  return CURRICULUM_PARTS[safeId - 1];
}

/**
 * Search the 10 Parts for units or subtopics matching a search keyword
 */
export function searchCurriculumParts(query: string): { part: CurriculumPart; unit: CurriculumUnit; matchedSubtopic?: string }[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const results: { part: CurriculumPart; unit: CurriculumUnit; matchedSubtopic?: string }[] = [];

  for (const part of CURRICULUM_PARTS) {
    for (const unit of part.units) {
      if (unit.name.toLowerCase().includes(q) || (unit.strand && unit.strand.toLowerCase().includes(q)) || unit.keyConcept.toLowerCase().includes(q)) {
        results.push({ part, unit });
        continue;
      }
      for (const sub of unit.subtopics) {
        if (sub.toLowerCase().includes(q)) {
          results.push({ part, unit, matchedSubtopic: sub });
          break;
        }
      }
    }
  }

  return results;
}
