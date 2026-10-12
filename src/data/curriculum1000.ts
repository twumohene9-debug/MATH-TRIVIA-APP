/**
 * Canonical 1,000 Mathematics Areas & Topics Curriculum Database
 * Spans 10 major branches of mathematics across 100 Stages (10 topics per Stage).
 */

export interface CurriculumTopic {
  id: number; // 1 to 1000
  name: string;
  stageId: number; // 1 to 100
  worldId: number; // 1 to 10
  area: string;
}

export const CURRICULUM_AREAS = [
  'Number Sense & Basic Arithmetic', // 1-100 (Stages 1-10)
  'Fractions, Decimals & Percentages', // 101-200 (Stages 11-20)
  'Ratios, Proportion & Basic Algebra', // 201-300 (Stages 21-30)
  'Exponents, Roots & Number Properties', // 301-400 (Stages 31-40)
  'Geometry', // 401-500 (Stages 41-50)
  'Mensuration & Measurement', // 501-600 (Stages 51-60)
  '2D & 3D Shapes', // 601-700 (Stages 61-70)
  'Coordinates, Graphs & Algebraic Geometry', // 701-800 (Stages 71-80)
  'Statistics & Probability', // 801-900 (Stages 81-90)
  'Everyday, Financial & Applied Mathematics', // 901-1000 (Stages 91-100)
] as const;

export const CURRICULUM_1000_NAMES: string[] = [
  // 1–100: Number Sense & Basic Arithmetic (Stages 1-10)
  'Counting numbers', 'Natural numbers', 'Whole numbers', 'Integers', 'Positive numbers',
  'Negative numbers', 'Zero', 'Even numbers', 'Odd numbers', 'Prime numbers', // 1-10 (Stage 1)
  'Composite numbers', 'Factors', 'Multiples', 'Common factors', 'Common multiples',
  'Place value', 'Face value', 'Expanded form', 'Standard form', 'Number names', // 11-20 (Stage 2)
  'Comparing numbers', 'Ordering numbers', 'Ascending order', 'Descending order', 'Number lines',
  'Counting forward', 'Counting backward', 'Skip counting', 'Rounding numbers', 'Estimation', // 21-30 (Stage 3)
  'Approximation', 'Successor of a number', 'Predecessor of a number', 'Absolute value', 'Magnitude of numbers',
  'Addition', 'Subtraction', 'Multiplication', 'Division', 'Addition of whole numbers', // 31-40 (Stage 4)
  'Subtraction of whole numbers', 'Multiplication of whole numbers', 'Division of whole numbers', 'Mental addition', 'Mental subtraction',
  'Mental multiplication', 'Mental division', 'Column addition', 'Column subtraction', 'Long multiplication', // 41-50 (Stage 5)
  'Long division', 'Short division', 'Division with remainders', 'Checking addition', 'Checking subtraction',
  'Checking multiplication', 'Checking division', 'Order of operations', 'BODMAS', 'BIDMAS', // 51-60 (Stage 6)
  'Arithmetic patterns', 'Number patterns', 'Missing numbers', 'Consecutive numbers', 'Consecutive integers',
  'Odd-number sequences', 'Even-number sequences', 'Multiplication tables', 'Addition tables', 'Subtraction facts', // 61-70 (Stage 7)
  'Division facts', 'Fact families', 'Number bonds', 'Ten bonds', 'Hundred bonds',
  'One-to-one correspondence', 'Cardinal numbers', 'Ordinal numbers', 'Counting objects', 'Counting in tens', // 71-80 (Stage 8)
  'Counting in hundreds', 'Counting in thousands', 'Reading large numbers', 'Writing large numbers', 'Comparing quantities',
  'Greater than', 'Less than', 'Equal to', 'Not equal to', 'Approximately equal to', // 81-90 (Stage 9)
  'Number decomposition', 'Number composition', 'Regrouping', 'Carrying in addition', 'Borrowing in subtraction',
  'Multiplicative comparison', 'Additive comparison', 'Arithmetic fluency', 'Basic computation', 'Number relationships', // 91-100 (Stage 10)

  // 101–200: Fractions, Decimals & Percentages (Stages 11-20)
  'Fractions', 'Proper fractions', 'Improper fractions', 'Mixed numbers', 'Unit fractions',
  'Equivalent fractions', 'Like fractions', 'Unlike fractions', 'Comparing fractions', 'Ordering fractions', // 101-110 (Stage 11)
  'Simplifying fractions', 'Reducing fractions', 'Converting mixed numbers', 'Converting improper fractions', 'Fraction of a quantity',
  'Fraction of a number', 'Addition of fractions', 'Subtraction of fractions', 'Multiplication of fractions', 'Division of fractions', // 111-120 (Stage 12)
  'Fraction word problems', 'Fraction models', 'Fraction strips', 'Fraction circles', 'Numerators',
  'Denominators', 'Common denominators', 'Least common denominator', 'Reciprocal of a fraction', 'Fractions on number lines', // 121-130 (Stage 13)
  'Decimal numbers', 'Decimal place value', 'Tenths', 'Hundredths', 'Thousandths',
  'Decimal notation', 'Comparing decimals', 'Ordering decimals', 'Rounding decimals', 'Adding decimals', // 131-140 (Stage 14)
  'Subtracting decimals', 'Multiplying decimals', 'Dividing decimals', 'Decimal-to-fraction conversion', 'Fraction-to-decimal conversion',
  'Terminating decimals', 'Recurring decimals', 'Decimal estimation', 'Decimal word problems', 'Percentages', // 141-150 (Stage 15)
  'Percentage notation', 'Percentage of a quantity', 'Finding percentages', 'Percentage increase', 'Percentage decrease',
  'Percentage change', 'Percentage difference', 'Percentage comparison', 'Converting percentages to fractions', 'Converting fractions to percentages', // 151-160 (Stage 16)
  'Converting decimals to percentages', 'Converting percentages to decimals', 'Simple percentage problems', 'Percentage word problems', 'Discount percentages',
  'Markup percentages', 'Profit percentages', 'Loss percentages', 'Tax percentages', 'Commission percentages', // 161-170 (Stage 17)
  'Interest percentages', 'Population percentages', 'Test-score percentages', 'Attendance percentages', 'Percentage points',
  'Ratio-to-percentage conversion', 'Fraction-to-ratio conversion', 'Decimal-to-ratio conversion', 'Percent increase in price', 'Percent decrease in price', // 171-180 (Stage 18)
  'Percentage error', 'Percentage estimation', 'Benchmark fractions', 'Benchmark decimals', 'Benchmark percentages',
  'Half as a fraction', 'Quarter as a fraction', 'Thirds', 'Fifths', 'Tenths benchmark', // 181-190 (Stage 19)
  'Eighths', 'Sixteenths', 'Fraction equivalence', 'Decimal equivalence', 'Percentage equivalence',
  'Fraction comparison strategies', 'Decimal comparison strategies', 'Percentage comparison strategies', 'Rational-number representation', 'Rational-number operations', // 191-200 (Stage 20)

  // 201–300: Ratios, Proportion & Basic Algebra (Stages 21-30)
  'Ratios', 'Ratio notation', 'Equivalent ratios', 'Simplifying ratios', 'Comparing ratios',
  'Ratio tables', 'Part-to-part ratios', 'Part-to-whole ratios', 'Three-part ratios', 'Ratio word problems', // 201-210 (Stage 21)
  'Sharing in a ratio', 'Dividing quantities in ratios', 'Scale ratios', 'Unit ratios', 'Rates',
  'Unit rates', 'Proportions', 'Equivalent proportions', 'Direct proportion', 'Inverse proportion', // 211-220 (Stage 22)
  'Proportional reasoning', 'Proportion word problems', 'Speed ratios', 'Recipe ratios', 'Map ratios',
  'Scale drawings', 'Scale factors', 'Similar ratios', 'Ratio graphs', 'Ratio matrix tables', // 221-230 (Stage 23)
  'Algebra', 'Algebraic notation', 'Variables', 'Constants', 'Coefficients',
  'Terms', 'Like terms', 'Unlike terms', 'Algebraic expressions', 'Algebraic equations', // 231-240 (Stage 24)
  'Algebraic inequalities', 'Simplifying expressions', 'Evaluating expressions', 'Substitution', 'Combining like terms',
  'Expanding brackets', 'Removing brackets', 'Factoring expressions', 'Common factors', 'Algebraic simplification', // 241-250 (Stage 25)
  'One-step equations', 'Two-step equations', 'Multi-step equations', 'Equations involving addition', 'Equations involving subtraction',
  'Equations involving multiplication', 'Equations involving division', 'Equations with fractions', 'Equations with decimals', 'Equations with brackets', // 251-260 (Stage 26)
  'Linear equations', 'Linear inequalities', 'Inequality symbols', 'Number-line inequalities', 'Algebraic word problems',
  'Age equations', 'Number equations', 'Consecutive-number equations', 'Money equations', 'Distance equations', // 261-270 (Stage 27)
  'Rate equations', 'Time equations', 'Work equations', 'Mixture equations', 'Formula substitution',
  'Changing the subject of a formula', 'Algebraic identities', 'Distributive property', 'Commutative property', 'Associative property', // 271-280 (Stage 28)
  'Identity property', 'Inverse property', 'Zero property', 'Closure property', 'Algebraic patterns',
  'Arithmetic sequences', 'Sequence rules', 'Term-to-term rules', 'Position-to-term rules', 'Missing terms', // 281-290 (Stage 29)
  'Pattern recognition', 'Function notation', 'Input-output tables', 'Mapping diagrams', 'Simple functions',
  'Linear functions', 'Independent variables', 'Dependent variables', 'Algebraic reasoning', 'Algebraic problem solving', // 291-300 (Stage 30)

  // 301–400: Exponents, Roots & Number Properties (Stages 31-40)
  'Powers', 'Exponents', 'Bases and exponents', 'Squared numbers', 'Cubed numbers',
  'Square roots', 'Cube roots', 'Perfect squares', 'Perfect cubes', 'Exponential notation', // 301-310 (Stage 31)
  'Repeated multiplication', 'Laws of exponents', 'Product rule of exponents', 'Quotient rule of exponents', 'Power-of-a-power rule',
  'Zero exponent', 'Negative exponents', 'Fractional exponents', 'Scientific notation', 'Standard form exponents', // 311-320 (Stage 32)
  'Large numbers in scientific notation', 'Small numbers in scientific notation', 'Converting scientific notation', 'Comparing powers', 'Estimating square roots',
  'Estimating cube roots', 'Simplifying radicals', 'Radical notation', 'Irrational numbers', 'Rational numbers', // 321-330 (Stage 33)
  'Real numbers', 'Number classification', 'Natural-number properties', 'Integer properties', 'Rational-number properties',
  'Real-number properties', 'Prime factorization', 'Factor trees', 'Fundamental theorem of arithmetic', 'Greatest common factor', // 331-340 (Stage 34)
  'Least common multiple', 'Divisibility rules', 'Divisibility by 2', 'Divisibility by 3', 'Divisibility by 5',
  'Divisibility by 9', 'Divisibility by 10', 'Divisibility by 11', 'Odd-even properties', 'Prime-number testing', // 341-350 (Stage 35)
  'Composite-number testing', 'Twin primes', 'Prime gaps', 'Number sequences', 'Fibonacci sequence',
  'Arithmetic sequences formula', 'Geometric sequences', 'Triangular numbers', 'Square-number patterns', 'Cube-number patterns', // 351-360 (Stage 36)
  "Pascal's triangle", 'Perfect numbers', 'Palindromic numbers', 'Divisor counting', 'Sum of factors',
  'Digital roots', 'Casting out nines', 'Modular arithmetic basics', 'Remainders', 'Congruence', // 361-370 (Stage 37)
  'Even-number properties', 'Odd-number properties', 'Consecutive integers logic', 'Consecutive even numbers', 'Consecutive odd numbers',
  'Number puzzles', 'Magic numbers', 'Magic squares', 'Number riddles', 'Mathematical patterns', // 371-380 (Stage 38)
  'Recursive sequences', 'Explicit sequences', 'Sequence graphs', 'Sequence tables', 'Term identification',
  'Pattern generalization', 'Arithmetic progression', 'Geometric progression', 'Common difference', 'Common ratio', // 381-390 (Stage 39)
  'Sequence sums', 'Finite sequences', 'Infinite sequences', 'Recursive rules', 'Formula-based sequences',
  'Number-line operations', 'Integer operations', 'Absolute-value equations', 'Absolute-value inequalities', 'Number-system relationships', // 391-400 (Stage 40)

  // 401–500: Geometry (Stages 41-50)
  'Geometry', 'Points', 'Lines', 'Line segments', 'Rays',
  'Angles', 'Acute angles', 'Right angles', 'Obtuse angles', 'Straight angles', // 401-410 (Stage 41)
  'Reflex angles', 'Full-turn angles', 'Measuring angles', 'Drawing angles', 'Angle estimation',
  'Complementary angles', 'Supplementary angles', 'Adjacent angles', 'Vertically opposite angles', 'Angles on a straight line', // 411-420 (Stage 42)
  'Angles around a point', 'Parallel lines', 'Perpendicular lines', 'Transversal lines', 'Corresponding angles',
  'Alternate angles', 'Co-interior angles', 'Triangles', 'Equilateral triangles', 'Isosceles triangles', // 421-430 (Stage 43)
  'Scalene triangles', 'Right triangles', 'Acute triangles', 'Obtuse triangles', 'Triangle angle sum',
  'Exterior angles of triangles', 'Triangle classification', 'Triangle congruence', 'Triangle similarity', 'Quadrilaterals', // 431-440 (Stage 44)
  'Squares', 'Rectangles', 'Rhombi', 'Parallelograms', 'Trapeziums',
  'Kites', 'Quadrilateral angle sum', 'Polygons', 'Regular polygons', 'Irregular polygons', // 441-450 (Stage 45)
  'Pentagon', 'Hexagon', 'Heptagon', 'Octagon', 'Nonagon',
  'Decagon', 'Polygon angle sums', 'Interior angles', 'Exterior angles', 'Polygon diagonals', // 451-460 (Stage 46)
  'Circles', 'Radius', 'Diameter', 'Circumference', 'Chord',
  'Arc', 'Sector', 'Segment of a circle', 'Tangent', 'Secant', // 461-470 (Stage 47)
  'Central angle', 'Inscribed angle', 'Circle symmetry', 'Circle theorems', 'Perimeter',
  'Rectangle perimeter', 'Square perimeter', 'Triangle perimeter', 'Polygon perimeter', 'Circumference calculations', // 471-480 (Stage 48)
  'Area', 'Rectangle area', 'Square area', 'Triangle area', 'Parallelogram area',
  'Trapezium area', 'Rhombus area', 'Kite area', 'Circle area', 'Composite areas', // 481-490 (Stage 49)
  'Area estimation', 'Perimeter-area relationships', 'Geometric patterns', 'Symmetry', 'Line symmetry',
  'Rotational symmetry', 'Reflection symmetry', 'Tessellations', 'Geometric constructions', 'Geometric reasoning', // 491-500 (Stage 50)

  // 501–600: Mensuration & Measurement (Stages 51-60)
  'Measurement', 'Length', 'Distance', 'Width', 'Height',
  'Depth', 'Mass', 'Weight', 'Capacity', 'Volume', // 501-510 (Stage 51)
  'Temperature', 'Time measurement', 'Measuring with rulers', 'Measuring with tape measures', 'Metric units',
  'Millimetres', 'Centimetres', 'Metres', 'Kilometres', 'Converting length units', // 511-520 (Stage 52)
  'Inches', 'Feet', 'Yards', 'Miles', 'Converting imperial units',
  'Metric-imperial conversion', 'Area units', 'Square centimetres', 'Square metres', 'Square kilometres', // 521-530 (Stage 53)
  'Hectares', 'Acres', 'Area conversion', 'Volume units', 'Cubic centimetres',
  'Cubic metres', 'Cubic millimetres', 'Litres', 'Millilitres', 'Volume conversion', // 531-540 (Stage 54)
  'Capacity conversion', 'Mass units', 'Milligrams', 'Grams', 'Kilograms',
  'Tonnes', 'Mass conversion', 'Temperature scales', 'Celsius', 'Fahrenheit', // 541-550 (Stage 55)
  'Temperature conversion', 'Time units', 'Seconds', 'Minutes', 'Hours',
  'Days', 'Weeks', 'Months', 'Years', 'Time conversion', // 551-560 (Stage 56)
  'Elapsed time', 'Timetables', '12-hour clock', '24-hour clock', 'Reading clocks',
  'Duration', 'Speed measurement', 'Distance-speed-time', 'Average speed', 'Unit conversion', // 561-570 (Stage 57)
  'Perimeter measurement', 'Area measurement', 'Surface area', 'Volume of cubes', 'Volume of cuboids',
  'Volume of prisms', 'Volume of cylinders', 'Volume of pyramids', 'Volume of cones', 'Volume of spheres', // 571-580 (Stage 58)
  'Surface area of cubes', 'Surface area of cuboids', 'Surface area of cylinders', 'Surface area of prisms', 'Surface area of spheres',
  'Capacity of containers', 'Displacement', 'Density basics', 'Density calculations', 'Measuring irregular objects', // 581-590 (Stage 59)
  'Composite solids', 'Composite volumes', 'Composite surface areas', 'Nets of solids', 'Scale measurement',
  'Measurement accuracy', 'Significant figures', 'Measurement error', 'Estimation in measurement', 'Practical mensuration', // 591-600 (Stage 60)

  // 601–700: 2D & 3D Shapes (Stages 61-70)
  '2D shapes', '3D shapes', 'Shape classification', 'Shape properties', 'Faces',
  'Edges', 'Vertices', 'Cubes', 'Cuboids', 'Prisms', // 601-610 (Stage 61)
  'Triangular prisms', 'Rectangular prisms', 'Pentagonal prisms', 'Hexagonal prisms', 'Cylinders',
  'Cones', 'Spheres', 'Pyramids', 'Triangular pyramids', 'Square pyramids', // 611-620 (Stage 62)
  'Pentagonal pyramids', 'Hexagonal pyramids', 'Polyhedra', 'Regular polyhedra', 'Nets of cubes',
  'Nets of cuboids', 'Nets of prisms', 'Nets of pyramids', '3D shape recognition', '3D shape construction', // 621-630 (Stage 63)
  'Cross-sections', 'Horizontal cross-sections', 'Vertical cross-sections', 'Orthographic views', 'Front views',
  'Side views', 'Top views', 'Isometric drawings', 'Perspective drawings', 'Scale drawings shapes', // 631-640 (Stage 64)
  'Similar shapes', 'Congruent shapes', 'Enlargement', 'Reduction', 'Scale factor shapes',
  'Shape transformations', 'Translation', 'Reflection', 'Rotation', 'Enlargement transformation', // 641-650 (Stage 65)
  'Coordinate transformations', 'Shape coordinates', 'Distance between points shapes', 'Midpoint shapes', 'Gradient shapes',
  'Symmetry in shapes', 'Shape patterns', 'Tessellation patterns', 'Regular tessellations', 'Semi-regular tessellations', // 651-660 (Stage 66)
  'Polygon tiling', 'Fractals', 'Geometric constructions', 'Compass constructions', 'Straightedge constructions',
  'Perpendicular bisectors', 'Angle bisectors', 'Constructing triangles', 'Constructing polygons', 'Loci', // 661-670 (Stage 67)
  'Locus of a point', 'Equidistant loci', 'Circle loci', 'Perpendicular loci', 'Geometric problem solving',
  'Shape decomposition', 'Shape composition', 'Composite figures', 'Irregular figures', 'Area of irregular shapes', // 671-680 (Stage 68)
  'Perimeter of irregular shapes', 'Volume of composite solids', 'Surface area of composite solids', "Euler's formula", 'Polyhedron counting',
  'Platonic solids', 'Prisms and pyramids', 'Cylinder properties', 'Cone properties', 'Sphere properties', // 681-690 (Stage 69)
  'Hemisphere', 'Frustum', 'Circular solids', 'Solids of revolution', 'Nets and surface area',
  'Shape visualization', 'Spatial reasoning', 'Geometric modelling', 'Geometric representation', 'Three-dimensional reasoning', // 691-700 (Stage 70)

  // 701–800: Coordinates, Graphs & Algebraic Geometry (Stages 71-80)
  'Coordinate geometry', 'Cartesian plane', 'x-axis', 'y-axis', 'Origin',
  'Ordered pairs', 'Plotting points', 'Reading coordinates', 'Quadrants', 'Positive coordinates', // 701-710 (Stage 71)
  'Negative coordinates', 'Coordinate grids', 'Distance on coordinate grids', 'Midpoint on coordinate grids', 'Horizontal distance',
  'Vertical distance', 'Gradient', 'Slope', 'Gradient of a line', 'Equation of a straight line', // 711-720 (Stage 72)
  'y-intercept', 'x-intercept', 'Linear graphs', 'Plotting linear equations', 'Tables of values',
  'Graph interpretation', 'Graphing inequalities', 'Distance-time graphs', 'Speed-time graphs', 'Conversion graphs', // 721-730 (Stage 73)
  'Travel graphs', 'Line graphs', 'Bar graphs', 'Double bar graphs', 'Pie charts',
  'Scatter plots', 'Frequency graphs', 'Histograms', 'Frequency polygons', 'Cumulative frequency graphs', // 731-740 (Stage 74)
  'Stem-and-leaf plots', 'Box plots', 'Pictographs', 'Tally charts', 'Two-way tables',
  'Venn diagrams', 'Carroll diagrams', 'Tree diagrams', 'Mapping diagrams', 'Function graphs', // 741-750 (Stage 75)
  'Quadratic graphs', 'Cubic graphs', 'Exponential graphs', 'Reciprocal graphs', 'Parabolic graphs',
  'Symmetry of graphs', 'Graph transformations', 'Translation of graphs', 'Reflection of graphs', 'Stretching graphs', // 751-760 (Stage 76)
  'Compressing graphs', 'Intersections of graphs', 'Simultaneous equations graphically', 'Gradient-intercept form', 'Point-slope form',
  'Standard form of a line', 'Parallel lines', 'Perpendicular lines', 'Distance formula', 'Midpoint formula', // 761-770 (Stage 77)
  'Equation of horizontal lines', 'Equation of vertical lines', 'Linear modelling', 'Real-life graphs', 'Graph scales',
  'Graph intervals', 'Graph axes', 'Graph labels', 'Graph accuracy', 'Reading trends', // 771-780 (Stage 78)
  'Increasing graphs', 'Decreasing graphs', 'Constant graphs', 'Maximum points', 'Minimum points',
  'Intercepts', 'Roots of graphs', 'Turning points', 'Rate of change', 'Average rate of change', // 781-790 (Stage 79)
  'Instantaneous rate concept', 'Gradient interpretation', 'Area under simple graphs', 'Graph-based equations', 'Graph-based inequalities',
  'Graph-based estimation', 'Graph comparison', 'Mathematical modelling', 'Data representation', 'Visual mathematics', // 791-800 (Stage 80)

  // 801–900: Statistics & Probability (Stages 81-90)
  'Statistics', 'Data', 'Data collection', 'Primary data', 'Secondary data',
  'Qualitative data', 'Quantitative data', 'Discrete data', 'Continuous data', 'Categorical data', // 801-810 (Stage 81)
  'Numerical data', 'Population', 'Sample', 'Sampling', 'Random sampling',
  'Systematic sampling', 'Stratified sampling', 'Convenience sampling', 'Frequency', 'Frequency tables', // 811-820 (Stage 82)
  'Relative frequency', 'Cumulative frequency', 'Grouped data', 'Ungrouped data', 'Class intervals',
  'Class boundaries', 'Class midpoints', 'Tally tables', 'Data organization', 'Data cleaning', // 821-830 (Stage 83)
  'Mean', 'Arithmetic mean', 'Weighted mean', 'Median', 'Mode',
  'Range', 'Minimum value', 'Maximum value', 'Quartiles', 'Lower quartile', // 831-840 (Stage 84)
  'Upper quartile', 'Interquartile range', 'Percentiles', 'Deciles', 'Mean deviation',
  'Variance', 'Standard deviation', 'Data spread', 'Data distribution', 'Symmetric distribution', // 841-850 (Stage 85)
  'Skewed distribution', 'Positive skew', 'Negative skew', 'Outliers', 'Five-number summary',
  'Box-and-whisker plots', 'Histograms distribution', 'Frequency polygons statistics', 'Cumulative frequency curves', 'Scatter diagrams', // 851-860 (Stage 86)
  'Correlation', 'Positive correlation', 'Negative correlation', 'Zero correlation', 'Line of best fit',
  'Trend lines', 'Prediction from data', 'Data interpretation', 'Statistical comparison', 'Survey data', // 861-870 (Stage 87)
  'Probability', 'Probability scale', 'Certain events', 'Impossible events', 'Likely events',
  'Unlikely events', 'Experimental probability', 'Theoretical probability', 'Probability of simple events', 'Probability fractions', // 871-880 (Stage 88)
  'Probability decimals', 'Probability percentages', 'Sample spaces', 'Outcomes', 'Events',
  'Simple events', 'Compound events', 'Complementary events', 'Mutually exclusive events', 'Independent events', // 881-890 (Stage 89)
  'Dependent events', 'Addition rule of probability', 'Multiplication rule of probability', 'Conditional probability', 'Probability trees',
  'Two-way probability tables', 'Expected frequency', 'Expected value basics', 'Probability simulations', 'Statistical reasoning', // 891-900 (Stage 90)

  // 901–1000: Everyday, Financial & Applied Mathematics (Stages 91-100)
  'Money mathematics', 'Currency', 'Coins', 'Banknotes', 'Counting money',
  'Adding money', 'Subtracting money', 'Multiplying money', 'Dividing money', 'Making change', // 901-910 (Stage 91)
  'Prices', 'Shopping calculations', 'Unit prices', 'Cost comparison', 'Budgets',
  'Personal budgeting', 'Income', 'Expenses', 'Savings', 'Profit', // 911-920 (Stage 92)
  'Loss', 'Cost price', 'Selling price', 'Marked price', 'Discount',
  'Markup', 'Tax', 'Value-added tax', 'Commission', 'Wages', // 921-930 (Stage 93)
  'Salaries', 'Overtime pay', 'Simple interest', 'Compound interest', 'Principal',
  'Interest rate', 'Loan mathematics', 'Repayment calculations', 'Savings calculations', 'Investment basics', // 931-940 (Stage 94)
  'Depreciation', 'Appreciation', 'Exchange rates', 'Currency conversion', 'Financial percentages',
  'Household mathematics', 'Electricity calculations', 'Water-bill calculations', 'Utility consumption', 'Fuel consumption', // 941-950 (Stage 95)
  'Travel mathematics', 'Distance calculations', 'Travel time', 'Average speed', 'Fuel efficiency',
  'Map reading', 'Map scales', 'Navigation mathematics', 'Timetables', 'Calendar mathematics', // 951-960 (Stage 96)
  'Age calculations', 'Date calculations', 'Birth-year calculations', 'Work-rate problems', 'Shared-work problems',
  'Mixture problems', 'Recipe mathematics', 'Cooking measurements', 'Temperature in cooking', 'Construction mathematics', // 961-970 (Stage 97)
  'Building measurements', 'Floor-area calculations', 'Land measurement', 'Plot dimensions', 'Fencing calculations',
  'Roofing calculations', 'Paint-area calculations', 'Tile calculations', 'Brick calculations', 'Agricultural mathematics', // 971-980 (Stage 98)
  'Farm-area calculations', 'Crop-yield calculations', 'Seed-rate calculations', 'Fertilizer calculations', 'Livestock calculations',
  'Population mathematics', 'Growth rates', 'Population density', 'Birth-rate calculations', 'Mortality-rate calculations', // 981-990 (Stage 99)
  'Sports mathematics', 'Scores and averages', 'Sports statistics', 'Mathematics in cooking', 'Mathematics in shopping',
  'Mathematics in construction', 'Mathematics in transportation', 'Mathematics in business', 'Mathematics in everyday life', 'Mathematical problem solving', // 991-1000 (Stage 100)
];

/**
 * Returns curriculum metadata for a specific stage and subtopic index (0-9).
 */
export function getCurriculumTopic(stageId: number, subtopicSlot: number): CurriculumTopic {
  const safeStage = Math.max(1, Math.min(100, Math.floor(stageId)));
  const safeSlot = Math.max(0, Math.min(9, Math.floor(subtopicSlot)));
  const topicId = (safeStage - 1) * 10 + safeSlot + 1;
  const name = CURRICULUM_1000_NAMES[topicId - 1] || `Topic ${topicId}`;
  const worldId = Math.min(10, Math.floor((safeStage - 1) / 10) + 1);
  const area = CURRICULUM_AREAS[worldId - 1] || 'General Mathematics';

  return {
    id: topicId,
    name,
    stageId: safeStage,
    worldId,
    area,
  };
}

/**
 * Returns the exact 10 subtopics corresponding to a given Stage (1-100).
 */
export function getTopicsForStage(stageId: number): string[] {
  const safeStage = Math.max(1, Math.min(100, Math.floor(stageId)));
  const startIdx = (safeStage - 1) * 10;
  return CURRICULUM_1000_NAMES.slice(startIdx, startIdx + 10);
}

/**
 * Search the 1,000 topics by name or keyword.
 */
export function searchCurriculum(keyword: string): CurriculumTopic[] {
  const query = keyword.toLowerCase().trim();
  if (!query) return [];

  const results: CurriculumTopic[] = [];
  for (let i = 0; i < CURRICULUM_1000_NAMES.length; i++) {
    const name = CURRICULUM_1000_NAMES[i];
    if (name.toLowerCase().includes(query)) {
      const topicId = i + 1;
      const stageId = Math.floor(i / 10) + 1;
      const worldId = Math.min(10, Math.floor((stageId - 1) / 10) + 1);
      results.push({
        id: topicId,
        name,
        stageId,
        worldId,
        area: CURRICULUM_AREAS[worldId - 1] || 'General Mathematics',
      });
    }
  }
  return results;
}

/**
 * Returns curriculum metadata given a global topic ID (1 to 1000).
 */
export function getCurriculumTopicById(topicId: number): CurriculumTopic {
  const safeId = Math.max(1, Math.min(1000, Math.floor(topicId)));
  const stageId = Math.floor((safeId - 1) / 10) + 1;
  const subtopicSlot = (safeId - 1) % 10;
  return getCurriculumTopic(stageId, subtopicSlot);
}

/**
 * Returns the range of stage IDs [startStage, endStage] for a given area index (0 to 9).
 */
export function getStageRangeForArea(areaIndex: number): [number, number] {
  const safeArea = Math.max(0, Math.min(9, Math.floor(areaIndex)));
  const startStage = safeArea * 10 + 1;
  const endStage = startStage + 9;
  return [startStage, endStage];
}

/**
 * Returns which area index (0 to 9) a given stage ID (1 to 100) belongs to.
 */
export function getAreaIndexForStage(stageId: number): number {
  const safeStage = Math.max(1, Math.min(100, Math.floor(stageId)));
  return Math.min(9, Math.floor((safeStage - 1) / 10));
}

/**
 * Returns all 100 CurriculumTopic objects within a specific area (0 to 9).
 */
export function getTopicsForArea(areaIndex: number): CurriculumTopic[] {
  const [startStage, endStage] = getStageRangeForArea(areaIndex);
  const topics: CurriculumTopic[] = [];
  for (let s = startStage; s <= endStage; s++) {
    for (let slot = 0; slot < 10; slot++) {
      topics.push(getCurriculumTopic(s, slot));
    }
  }
  return topics;
}
