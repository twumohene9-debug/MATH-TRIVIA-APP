import { DifficultyTier } from '../../types';
import { PRNG } from '../generators/shared';
import { GeneratedTopicArtifact, makeUniqueDistractors, fmtFrac } from './types';

export function generateShapesTopic(
  topicName: string,
  topicArea: string,
  stageId: number,
  difficulty: DifficultyTier,
  prng: PRNG,
  diffMultiplier: number
): GeneratedTopicArtifact {
  const nameL = topicName.toLowerCase();

  // =========================================================================
  // STAGE 61: 2D & 3D FOUNDATIONS, CUBES, CUBOIDS, PRISMS (Topics 601 - 610)
  // =========================================================================
  if (nameL.includes('cube') && !nameL.includes('net') && !nameL.includes('root')) {
    const s = prng.int(3, 10);
    const vol = s * s * s;
    const sa = 6 * s * s;
    const askSA = prng.next() > 0.5;
    if (askSA) {
      const correctAns = `$${sa}\\text{ cm}^2$`;
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Total surface area of a cube',
          questionType: 'direct_calculation', difficulty, mathematicalOperation: 'SA = 6s^2',
          representation: 'equation', context: '3D Geometry',
          numbersUsed: [s, sa], expectedReasoning: 'A cube has 6 identical square faces: Total Surface Area = 6s^2',
          conceptKey: 'CUBE_SURFACE_AREA_CALC',
        },
        questionText: `A solid cube has an edge length of $${s}\\text{ cm}$.\n\nCalculate its total surface area:`,
        correctAnswer: correctAns,
        rawDistractors: makeUniqueDistractors(correctAns, [
          `$${vol}\\text{ cm}^2$`, // volume by mistake
          `$${4 * s * s}\\text{ cm}^2$`, // 4 faces
          `$${sa + 12}\\text{ cm}^2$`,
        ], prng),
        given: `Edge length $s = ${s}\\text{ cm}$.`,
        required: `Total surface area.`,
        method: `$\\text{Surface Area} = 6s^2 = 6 \\times ${s}^2 = 6 \\times ${s * s} = ${sa}\\text{ cm}^2$.`,
        steps: [`Area of 1 face $= ${s}^2 = ${s * s}\\text{ cm}^2$.`, `Total for 6 faces $= 6 \\times ${s * s} = ${sa}\\text{ cm}^2$.`],
        conclusion: `The surface area is $${sa}\\text{ cm}^2$.`,
        hint: `Multiply the area of one square face by 6.`,
      };
    }
    const correctAns = `$${vol}\\text{ cm}^3$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Volume of a cube',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'V = s^3',
        representation: 'equation', context: '3D Geometry',
        numbersUsed: [s, vol], expectedReasoning: 'Volume of a cube is edge cubed: V = s^3',
        conceptKey: 'CUBE_VOLUME_CALC',
      },
      questionText: `A cube has side length $${s}\\text{ cm}$.\n\nCalculate its volume:`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${sa}\\text{ cm}^3$`,
        `$${s * 3}\\text{ cm}^3$`,
        `$${vol + 10}\\text{ cm}^3$`,
      ], prng),
      given: `Side length $s = ${s}\\text{ cm}$.`,
      required: `Volume.`,
      method: `$V = s^3 = ${s} \\times ${s} \\times ${s} = ${vol}\\text{ cm}^3$.`,
      steps: [`$${s}^3 = ${vol}$.`],
      conclusion: `The volume is $${vol}\\text{ cm}^3$.`,
      hint: `Multiply side × side × side.`,
    };
  }

  if (nameL.includes('cuboid')) {
    const l = prng.int(4, 8);
    const w = prng.int(3, 6);
    const h = prng.int(2, 5);
    const vol = l * w * h;
    const correctAns = `$${vol}\\text{ cm}^3$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Volume of a cuboid (rectangular prism)',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'V = l * w * h',
        representation: 'equation', context: '3D Geometry',
        numbersUsed: [l, w, h, vol], expectedReasoning: 'Volume = length * width * height',
        conceptKey: 'CUBOID_VOLUME_CALC',
      },
      questionText: `A rectangular cuboid has dimensions $${l}\\text{ cm} \\times ${w}\\text{ cm} \\times ${h}\\text{ cm}$.\n\nCalculate its volume:`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${2 * (l * w + w * h + l * h)}\\text{ cm}^3$`, // surface area
        `$${l + w + h}\\text{ cm}^3$`,
        `$${vol + 12}\\text{ cm}^3$`,
      ], prng),
      given: `Length $= ${l}\\text{ cm}$, Width $= ${w}\\text{ cm}$, Height $= ${h}\\text{ cm}$.`,
      required: `Volume.`,
      method: `$V = l \\times w \\times h = ${l} \\times ${w} \\times ${h} = ${vol}\\text{ cm}^3$.`,
      steps: [`$${l} \\times ${w} = ${l * w}$.`, `$${l * w} \\times ${h} = ${vol}$.`],
      conclusion: `The volume is $${vol}\\text{ cm}^3$.`,
      hint: `Multiply length × width × height.`,
    };
  }

  if (nameL.includes('faces') || nameL.includes('edges') || nameL.includes('vertices')) {
    const solids = [
      { name: 'cube', F: 6, E: 12, V: 8 },
      { name: 'rectangular cuboid', F: 6, E: 12, V: 8 },
      { name: 'triangular prism', F: 5, E: 9, V: 6 },
      { name: 'square-based pyramid', F: 5, E: 8, V: 5 },
      { name: 'triangular pyramid (tetrahedron)', F: 4, E: 6, V: 4 },
    ];
    const s = prng.pick(solids);
    if (nameL.includes('edges')) {
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Counting edges of 3D polyhedra',
          questionType: 'identification', difficulty, mathematicalOperation: 'Polyhedron counting',
          representation: 'definition', context: '3D Geometry',
          numbersUsed: [s.E], expectedReasoning: 'Edges are line segments where two faces meet',
          conceptKey: 'EDGES_POLYHEDRON_COUNT',
        },
        questionText: `How many edges does a ${s.name} have?`,
        correctAnswer: `$${s.E}$`,
        rawDistractors: [`$${s.F}$`, `$${s.V}$`, `$${s.E + 2}$`],
        given: `Solid: ${s.name}.`,
        required: `Number of edges.`,
        method: `Count line segments connecting vertices on a ${s.name}.`,
        steps: [`A ${s.name} has exactly $${s.E}$ edges.`],
        conclusion: `It has $${s.E}$ edges.`,
        hint: `An edge is where two flat faces meet.`,
      };
    }
    if (nameL.includes('vertices')) {
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Counting vertices of 3D polyhedra',
          questionType: 'identification', difficulty, mathematicalOperation: 'Polyhedron counting',
          representation: 'definition', context: '3D Geometry',
          numbersUsed: [s.V], expectedReasoning: 'Vertices are corners where three or more edges intersect',
          conceptKey: 'VERTICES_POLYHEDRON_COUNT',
        },
        questionText: `How many vertices (corners) does a ${s.name} have?`,
        correctAnswer: `$${s.V}$`,
        rawDistractors: [`$${s.F}$`, `$${s.E}$`, `$${s.V + 2}$`],
        given: `Solid: ${s.name}.`,
        required: `Number of vertices.`,
        method: `Count the corner points of a ${s.name}.`,
        steps: [`A ${s.name} has $${s.V}$ vertices.`],
        conclusion: `It has $${s.V}$ vertices.`,
        hint: `A vertex is a sharp corner where edges meet.`,
      };
    }
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Counting faces of 3D polyhedra',
        questionType: 'identification', difficulty, mathematicalOperation: 'Polyhedron counting',
        representation: 'definition', context: '3D Geometry',
        numbersUsed: [s.F], expectedReasoning: 'Faces are the flat 2D boundary polygons',
        conceptKey: 'FACES_POLYHEDRON_COUNT',
      },
      questionText: `How many flat faces does a ${s.name} have?`,
      correctAnswer: `$${s.F}$`,
      rawDistractors: [`$${s.V}$`, `$${s.E}$`, `$${s.F + 2}$`],
      given: `Solid: ${s.name}.`,
      required: `Number of faces.`,
      method: `Count the boundary polygons.`,
      steps: [`A ${s.name} has $${s.F}$ faces.`],
      conclusion: `It has $${s.F}$ faces.`,
      hint: `A face is each flat surface of the 3D shape.`,
    };
  }

  // =========================================================================
  // STAGE 62: CYLINDERS, CONES, SPHERES, PYRAMIDS (Topics 611 - 620)
  // =========================================================================
  if (nameL.includes('cylinder')) {
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Cylinder geometric face structure',
        questionType: 'identification', difficulty, mathematicalOperation: 'Surface classification',
        representation: 'definition', context: 'Circular 3D solids',
        numbersUsed: [2, 1], expectedReasoning: 'A cylinder has 2 identical circular bases and 1 curved rectangular surface',
        conceptKey: 'CYLINDER_SURFACES_STRUCTURE',
      },
      questionText: `Which description correctly characterizes the surfaces of a closed cylinder?`,
      correctAnswer: `$2$ flat circular bases and $1$ curved surface`,
      rawDistractors: [
        `$3$ flat circular faces and $0$ curved surfaces`,
        `$1$ circular base and $1$ pointed apex`,
        `$6$ rectangular faces and $8$ vertices`,
      ],
      given: `Solid: Closed cylinder.`,
      required: `Surface composition.`,
      method: `A cylinder has top and bottom parallel congruent circular faces and a rolled rectangular curved jacket.`,
      steps: [`$2$ flat circular faces $+ 1$ curved surface.`],
      conclusion: `It has 2 flat circular bases and 1 curved surface.`,
      hint: `Think of a standard tin can: top, bottom, and curved side.`,
    };
  }

  if (nameL.includes('cone')) {
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Cone geometric properties',
        questionType: 'identification', difficulty, mathematicalOperation: 'Solid classification',
        representation: 'definition', context: 'Circular 3D solids',
        numbersUsed: [1, 1], expectedReasoning: 'A cone has 1 flat circular base, 1 curved surface, and 1 pointed apex',
        conceptKey: 'CONE_PROPERTIES_STRUCTURE',
      },
      questionText: `How many vertices (sharp tips / apex) does a standard cone have?`,
      correctAnswer: `$1$ (the apex)`,
      rawDistractors: [`$0$`, `$2$`, `$3$`],
      given: `Solid: Cone.`,
      required: `Vertex count.`,
      method: `A cone has a single apex point where its curved surface converges.`,
      steps: [`A cone has exactly $1$ apex.`],
      conclusion: `It has 1 apex.`,
      hint: `An ice cream cone tapers to a single pointed point at the tip.`,
    };
  }

  if (nameL.includes('sphere')) {
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Sphere geometric properties',
        questionType: 'identification', difficulty, mathematicalOperation: 'Curved solid analysis',
        representation: 'definition', context: '3D Geometry',
        numbersUsed: [0], expectedReasoning: 'A sphere is perfectly symmetrical with 1 continuous curved surface, 0 edges, and 0 vertices',
        conceptKey: 'SPHERE_EDGES_VERTICES_COUNT',
      },
      questionText: `How many edges and vertices does a perfect sphere have?`,
      correctAnswer: `$0$ edges and $0$ vertices`,
      rawDistractors: [
        `$1$ edge and $0$ vertices`,
        `$0$ edges and $1$ vertex`,
        `$2$ edges and $2$ vertices`,
      ],
      given: `Solid: Sphere.`,
      required: `Number of edges and vertices.`,
      method: `A sphere has a single continuous curved surface with no flat faces, no intersecting edges, and no corners.`,
      steps: [`$0$ edges, $0$ vertices.`],
      conclusion: `A sphere has 0 edges and 0 vertices.`,
      hint: `A ball is smooth everywhere with no corners or straight lines.`,
    };
  }

  if (nameL.includes('pyramid')) {
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Square-based pyramid face structure',
        questionType: 'identification', difficulty, mathematicalOperation: 'Polyhedron face classification',
        representation: 'definition', context: '3D Pyramids',
        numbersUsed: [1, 4, 5], expectedReasoning: 'A square pyramid has 1 square base and 4 triangular lateral faces',
        conceptKey: 'SQUARE_PYRAMID_FACES_BREAKDOWN',
      },
      questionText: `What shapes make up the $5$ faces of a square-based pyramid?`,
      correctAnswer: `$1$ square and $4$ congruent triangles`,
      rawDistractors: [
        `$5$ equilateral triangles`,
        `$2$ squares and $3$ rectangles`,
        `$1$ triangle and $4$ squares`,
      ],
      given: `Solid: Square-based pyramid.`,
      required: `Face polygon composition.`,
      method: `The base is a square ($1$ face); the sides meeting at the apex are triangles ($4$ faces).`,
      steps: [`$1$ square base $+ 4$ triangular faces $= 5$ total faces.`],
      conclusion: `1 square and 4 triangles.`,
      hint: `The bottom is a square and the sides slope up as triangles.`,
    };
  }

  // =========================================================================
  // STAGE 63: NETS OF 3D SHAPES (Topics 621 - 630)
  // =========================================================================
  if (nameL.includes('net')) {
    if (nameL.includes('cube')) {
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Nets of a cube',
          questionType: 'reasoning', difficulty, mathematicalOperation: 'Spatial unfolding',
          representation: 'definition', context: 'Nets of polyhedra',
          numbersUsed: [11, 6], expectedReasoning: 'There are exactly 11 distinct valid flat nets that fold into a closed cube',
          conceptKey: 'NETS_OF_A_CUBE_COUNT',
        },
        questionText: `In solid geometry, exactly how many distinct flat nets can fold to form a cube?`,
        correctAnswer: `$11$ distinct nets`,
        rawDistractors: [`$6$ nets`, `$8$ nets`, `$16$ nets`],
        given: `Solid: Cube.`,
        required: `Number of distinct valid folding nets.`,
        method: `Combinatorial analysis proves there are precisely 11 unique planar hexamino patterns that fold into a closed cube.`,
        steps: [`There are exactly $11$ valid cube nets.`],
        conclusion: `There are 11 distinct nets.`,
        hint: `Think of hexaminoes: exactly 11 of the 35 hexamino shapes can fold into a cube.`,
      };
    }
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Definition of a geometric net',
        questionType: 'identification', difficulty, mathematicalOperation: '2D-to-3D folding',
        representation: 'definition', context: 'Geometric nets',
        numbersUsed: [2, 3], expectedReasoning: 'A net is a 2D pattern that folds along edges to construct a 3D solid',
        conceptKey: 'GEOMETRIC_NET_DEFINITION',
      },
      questionText: `In geometry, what is the net of a 3D solid?`,
      correctAnswer: `A $2\\text{D}$ flat pattern that can be folded along edges to form the $3\\text{D}$ solid`,
      rawDistractors: [
        `The total weight of the solid`,
        `The shadow cast by the solid on a wall`,
        `The line formed where two faces intersect`,
      ],
      given: `3D solid.`,
      required: `Definition of a net.`,
      method: `A net unfolds all 3D faces flat onto a single 2D plane.`,
      steps: [`A net is a 2D cutout that folds into the 3D shape.`],
      conclusion: `It is a 2D pattern that folds into the 3D solid.`,
      hint: `Think of unfolding a cardboard box flat.`,
    };
  }

  // =========================================================================
  // STAGE 64: CROSS-SECTIONS & VIEWS (Topics 631 - 640)
  // =========================================================================
  if (nameL.includes('cross-section') || nameL.includes('view') || nameL.includes('orthographic') || nameL.includes('isometric')) {
    if (nameL.includes('cylinder') || nameL.includes('horizontal cross-section')) {
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Cross-section of a cylinder',
          questionType: 'identification', difficulty, mathematicalOperation: 'Plane-solid intersection',
          representation: 'definition', context: 'Cross-sections',
          numbersUsed: [1], expectedReasoning: 'A plane slicing parallel to circular base yields a congruent circle',
          conceptKey: 'CYLINDER_HORIZONTAL_CROSS_SECTION',
        },
        questionText: `A solid cylinder standing upright is sliced by a horizontal plane parallel to its base.\n\nWhat $2\\text{D}$ shape is the cross-section?`,
        correctAnswer: `A circle congruent to the base`,
        rawDistractors: [`A rectangle`, `An ellipse`, `A triangle`],
        given: `Upright cylinder sliced parallel to base.`,
        required: `Shape of cross-section.`,
        method: `Any horizontal slice parallel to the base reproduces the circular cross-section.`,
        steps: [`Cross-section is a circle.`],
        conclusion: `The cross-section is a circle.`,
        hint: `Slicing horizontally through a can produces a circle.`,
      };
    }
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Orthographic projection views',
        questionType: 'identification', difficulty, mathematicalOperation: 'Projection analysis',
        representation: 'definition', context: 'Technical drawing',
        numbersUsed: [3], expectedReasoning: 'Standard orthographic views are Front, Top (plan), and Side (elevation)',
        conceptKey: 'ORTHOGRAPHIC_PROJECTION_VIEWS',
      },
      questionText: `In engineering drawings, what are the three standard orthographic views used to represent a 3D object?`,
      correctAnswer: `Front view, Top view (Plan), and Side view (Elevation)`,
      rawDistractors: [
        `Inside view, Outside view, and Bottom view`,
        `Perspective view, Isometric view, and Oblique view`,
        `Shadow view, Reflection view, and Rotation view`,
      ],
      given: `Orthographic projection.`,
      required: `Standard 3 views.`,
      method: `Orthographic views project the front, top (plan), and side onto orthogonal 2D planes.`,
      steps: [`Front, Top (Plan), and Side (Elevation).`],
      conclusion: `Front view, Top view, and Side view.`,
      hint: `Look at the object from the front, from directly above, and from the side.`,
    };
  }

  // =========================================================================
  // STAGE 65: SIMILAR & CONGRUENT SHAPES & TRANSFORMATIONS (Topics 641 - 650)
  // =========================================================================
  if (nameL.includes('similar') || nameL.includes('scale factor') || nameL.includes('enlargement')) {
    const k = prng.pick([2, 3, 4, 5]);
    const areaK = k * k;
    const baseArea = prng.int(8, 20);
    const newArea = baseArea * areaK;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Area scale factor in similar figures',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Area Scale Factor = k^2',
        representation: 'equation', context: 'Similar shapes',
        numbersUsed: [k, baseArea, newArea], expectedReasoning: 'When linear dimensions scale by k, area scales by k^2',
        conceptKey: 'AREA_SCALE_FACTOR_SIMILAR',
      },
      questionText: `Triangle $A$ has an area of $${baseArea}\\text{ cm}^2$.\n\nTriangle $B$ is similar to Triangle $A$ with a linear scale factor of $k = ${k}$.\n\nWhat is the area of Triangle $B$?`,
      correctAnswer: `$${newArea}\\text{ cm}^2$`,
      rawDistractors: makeUniqueDistractors(`$${newArea}\\text{ cm}^2$`, [
        `$${baseArea * k}\\text{ cm}^2$`, // forgot to square k
        `$${newArea + 10}\\text{ cm}^2$`,
        `$${baseArea * 2 * k}\\text{ cm}^2$`,
      ], prng),
      given: `Base area $= ${baseArea}\\text{ cm}^2$, Linear scale factor $k = ${k}$.`,
      required: `Enlarged area.`,
      method: `$\\text{Area scale factor} = k^2 = ${k}^2 = ${areaK}$. Enlarged area $= ${baseArea} \\times ${areaK} = ${newArea}\\text{ cm}^2$.`,
      steps: [
        `$k^2 = ${k}^2 = ${areaK}$.`,
        `$\\text{New Area} = ${baseArea} \\times ${areaK} = ${newArea}\\text{ cm}^2$.`,
      ],
      conclusion: `The area is $${newArea}\\text{ cm}^2$.`,
      hint: `Square the linear scale factor ($k^2$) before multiplying by the original area!`,
    };
  }

  if (nameL.includes('congruent')) {
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Triangle congruence criteria',
        questionType: 'identification', difficulty, mathematicalOperation: 'Congruence postulates',
        representation: 'definition', context: 'Congruence',
        numbersUsed: [3], expectedReasoning: 'Valid criteria: SSS, SAS, ASA, AAS, RHS (not AAA)',
        conceptKey: 'TRIANGLE_CONGRUENCE_CRITERIA',
      },
      questionText: `Which of the following is NOT a valid mathematical condition to prove that two triangles are congruent?`,
      correctAnswer: `$\\text{AAA}$ (Angle-Angle-Angle)`,
      rawDistractors: [
        `$\\text{SSS}$ (Side-Side-Side)`,
        `$\\text{SAS}$ (Side-Angle-Side)`,
        `$\\text{RHS}$ (Right-angle-Hypotenuse-Side)`,
      ],
      given: `Triangle congruence postulates.`,
      required: `Invalid condition.`,
      method: `$\\text{AAA}$ guarantees that two triangles are SIMILAR (same shape), but not necessarily CONGRUENT (same size).`,
      steps: [`AAA proves similarity, not congruence.`],
      conclusion: `AAA cannot prove congruence.`,
      hint: `Two triangles can have the exact same angles but completely different sizes!`,
    };
  }

  // =========================================================================
  // STAGE 66: TESSELLATIONS & SYMMETRY (Topics 651 - 660)
  // =========================================================================
  if (nameL.includes('tessellat') || nameL.includes('tiling')) {
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Regular polygons that can tessellate a plane',
        questionType: 'reasoning', difficulty, mathematicalOperation: 'Interior angle division of 360 degrees',
        representation: 'definition', context: 'Tessellations',
        numbersUsed: [3, 4, 6], expectedReasoning: 'Only regular polygons whose interior angle divides 360 can tile a plane: equilateral triangle, square, hexagon',
        conceptKey: 'REGULAR_TESSELLATION_POLYGONS',
      },
      questionText: `Which regular polygon can tessellate (tile a flat floor completely with no gaps or overlaps)?`,
      correctAnswer: `Regular hexagon`,
      rawDistractors: [`Regular pentagon`, `Regular heptagon (7-sided)`, `Regular octagon (alone)`],
      given: `Regular tessellation on a flat plane.`,
      required: `Regular polygon that tiles flat plane.`,
      method: `The interior angle must divide $360^\\circ$ evenly. For a regular hexagon, each angle is $120^\\circ$, and $3 \\times 120^\\circ = 360^\\circ$. A pentagon's angle is $108^\\circ$, which does not divide $360^\\circ$.`,
      steps: [`$360^\\circ \\div 120^\\circ = 3$ exact fit.`],
      conclusion: `Regular hexagons tessellate a flat plane.`,
      hint: `Think of a beehive honeycomb: what shape are the cells?`,
    };
  }

  // =========================================================================
  // STAGE 67: GEOMETRIC CONSTRUCTIONS & BISECTORS (Topics 661 - 670)
  // =========================================================================
  if (nameL.includes('bisector') || nameL.includes('construction') || nameL.includes('compass')) {
    if (nameL.includes('angle bisector')) {
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Definition of an angle bisector',
          questionType: 'identification', difficulty, mathematicalOperation: 'Angle division by 2',
          representation: 'definition', context: 'Geometric construction',
          numbersUsed: [2], expectedReasoning: 'An angle bisector is a ray dividing an angle into two equal congruent halves',
          conceptKey: 'ANGLE_BISECTOR_DEFINITION',
        },
        questionText: `What is the geometric function of an angle bisector?`,
        correctAnswer: `It divides an angle into two equal, congruent angles`,
        rawDistractors: [
          `It doubles the measure of the angle`,
          `It creates a perpendicular line of 90 degrees`,
          `It finds the center of gravity of a circle`,
        ],
        given: `Angle bisector.`,
        required: `Geometric function.`,
        method: `Bi-sector means cut into two equal sections.`,
        steps: [`Divides the angle into two equal halves.`],
        conclusion: `It divides the angle into two equal angles.`,
        hint: `"Bi" means two: it splits the angle into two equal parts.`,
      };
    }
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Perpendicular bisector property',
        questionType: 'identification', difficulty, mathematicalOperation: 'Perpendicular midpoint locus',
        representation: 'definition', context: 'Geometric construction',
        numbersUsed: [90, 2], expectedReasoning: 'A perpendicular bisector passes through segment midpoint at 90 degrees and is equidistant from endpoints',
        conceptKey: 'PERPENDICULAR_BISECTOR_PROPERTY',
      },
      questionText: `The perpendicular bisector of a line segment $AB$ passes through:`,
      correctAnswer: `The midpoint of $AB$ at a right angle ($90^\\circ$)`,
      rawDistractors: [
        `One of the endpoints at an acute angle`,
        `Any point along the segment at $45^\\circ$`,
        `The origin of the coordinate plane`,
      ],
      given: `Line segment $AB$.`,
      required: `Perpendicular bisector property.`,
      method: `It is perpendicular ($90^\\circ$) and bisects (cuts in half through the midpoint).`,
      steps: [`Passes through midpoint at $90^\\circ$.`],
      conclusion: `It passes through the midpoint at 90 degrees.`,
      hint: `It cuts the line segment in half at a 90-degree angle.`,
    };
  }

  // =========================================================================
  // STAGE 68: LOCI (Topics 671 - 680)
  // =========================================================================
  if (nameL.includes('loci') || nameL.includes('locus')) {
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Locus of points equidistant from a fixed point',
        questionType: 'identification', difficulty, mathematicalOperation: 'Locus circle definition',
        representation: 'definition', context: 'Loci',
        numbersUsed: [1], expectedReasoning: 'Locus of points at fixed distance r from point P is a circle with radius r',
        conceptKey: 'LOCUS_FROM_FIXED_POINT_CIRCLE',
      },
      questionText: `What geometric shape is the locus of all points on a flat plane that are a constant distance $r$ from a single fixed point $P$?`,
      correctAnswer: `A circle with centre $P$ and radius $r$`,
      rawDistractors: [
        `A straight line passing through $P$`,
        `A square of side length $r$`,
        `A parabola opening upwards from $P$`,
      ],
      given: `Fixed point $P$, constant distance $r$.`,
      required: `Locus shape.`,
      method: `By mathematical definition, a circle is the locus of all coplanar points equidistant from a fixed center.`,
      steps: [`The locus is a circle.`],
      conclusion: `The locus is a circle of radius $r$.`,
      hint: `What do you draw when you rotate a compass with a fixed radius around a center point?`,
    };
  }

  // =========================================================================
  // STAGE 69: EULER'S FORMULA & PLATONIC SOLIDS (Topics 681 - 690)
  // =========================================================================
  if (nameL.includes('euler') || nameL.includes('platonic')) {
    if (nameL.includes('platonic')) {
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Number of Platonic solids',
          questionType: 'identification', difficulty, mathematicalOperation: 'Regular polyhedra classification',
          representation: 'definition', context: 'Platonic solids',
          numbersUsed: [5], expectedReasoning: 'There are exactly 5 convex regular polyhedra: tetrahedron, cube, octahedron, dodecahedron, icosahedron',
          conceptKey: 'FIVE_PLATONIC_SOLIDS_COUNT',
        },
        questionText: `How many Platonic solids (convex regular polyhedra) exist in $3\\text{D}$ geometry?`,
        correctAnswer: `$5$ (Tetrahedron, Cube, Octahedron, Dodecahedron, Icosahedron)`,
        rawDistractors: [`$4$`, `$6$`, `$8$`],
        given: `Platonic solids.`,
        required: `Total count.`,
        method: `Proven by Euclid: only 5 regular convex polyhedra can exist in 3D Euclidean space.`,
        steps: [`There are exactly 5 Platonic solids.`],
        conclusion: `There are 5 Platonic solids.`,
        hint: `There are only 5 regular convex polyhedra in the universe!`,
      };
    }
    // Euler's formula
    const solids = [
      { name: 'hexagonal prism', F: 8, V: 12, E: 18 },
      { name: 'octahedron', F: 8, V: 6, E: 12 },
      { name: 'pentagonal pyramid', F: 6, V: 6, E: 10 },
      { name: 'dodecahedron', F: 12, V: 20, E: 30 },
    ];
    const s = prng.pick(solids);
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: "Euler's Polyhedron Formula V - E + F = 2",
        questionType: 'missing_value', difficulty, mathematicalOperation: 'E = V + F - 2',
        representation: '3D_polyhedron', context: 'Polyhedra',
        numbersUsed: [s.F, s.V, s.E], expectedReasoning: 'Euler formula: V - E + F = 2',
        conceptKey: 'EULERS_FORMULA_APPLICATION',
      },
      questionText: `A solid polyhedron has $${s.F}$ faces and $${s.V}$ vertices.\n\nUsing Euler's formula ($V - E + F = 2$), how many edges ($E$) does it have?`,
      correctAnswer: `$${s.E}$`,
      rawDistractors: makeUniqueDistractors(`$${s.E}$`, [
        `$${s.V + s.F}$`,
        `$${s.E + 2}$`,
        `$${s.E - 2}$`,
      ], prng),
      given: `Faces $F = ${s.F}$, Vertices $V = ${s.V}$.`,
      required: `Edges $E$.`,
      method: `$V - E + F = 2 \\implies E = V + F - 2 = ${s.V} + ${s.F} - 2 = ${s.E}$.`,
      steps: [
        `$V + F = ${s.V} + ${s.F} = ${s.V + s.F}$.`,
        `$E = ${s.V + s.F} - 2 = ${s.E}$.`,
      ],
      conclusion: `The number of edges is $${s.E}$.`,
      hint: `Vertices + Faces - Edges = 2!`,
    };
  }

  // =========================================================================
  // STAGE 70: FRUSTUM, HEMISPHERE & SOLIDS OF REVOLUTION (Topics 691 - 700)
  // =========================================================================
  if (nameL.includes('frustum')) {
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Definition of a frustum',
        questionType: 'identification', difficulty, mathematicalOperation: 'Truncated solid definition',
        representation: 'definition', context: 'Truncated solids',
        numbersUsed: [1], expectedReasoning: 'A frustum is formed by slicing the top off a cone or pyramid with a plane parallel to the base',
        conceptKey: 'FRUSTUM_GEOMETRIC_DEFINITION',
      },
      questionText: `In solid geometry, how is a frustum formed?`,
      correctAnswer: `By cutting off the top of a cone or pyramid with a plane parallel to the base`,
      rawDistractors: [
        `By rolling a cylinder along its side`,
        `By joining two identical spheres together`,
        `By revolving a triangle around its hypotenuse`,
      ],
      given: `Frustum solid.`,
      required: `Geometric definition.`,
      method: `A frustum is the portion of a pyramid or cone between the base and a plane parallel to the base.`,
      steps: [`Truncate the apex parallel to the base.`],
      conclusion: `Cut off the top parallel to the base.`,
      hint: `Think of a bucket or a lampshade: a cone with its pointed tip sliced off.`,
    };
  }

  if (nameL.includes('hemisphere') || nameL.includes('solids of revolution')) {
    if (nameL.includes('hemisphere')) {
      const r = prng.pick([3, 6, 9]);
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Properties of a hemisphere',
          questionType: 'identification', difficulty, mathematicalOperation: 'Half sphere geometry',
          representation: 'definition', context: '3D Geometry',
          numbersUsed: [r], expectedReasoning: 'A solid hemisphere has 1 curved dome face and 1 flat circular base',
          conceptKey: 'HEMISPHERE_FACE_PROPERTIES',
        },
        questionText: `How many faces does a closed solid hemisphere have?`,
        correctAnswer: `$2$ faces ($1$ flat circular base and $1$ curved hemispherical surface)`,
        rawDistractors: [
          `$1$ curved face only`,
          `$3$ flat circular faces`,
          `$0$ faces`,
        ],
        given: `Solid closed hemisphere.`,
        required: `Face count and type.`,
        method: `Cutting a sphere in half exposes a flat circular cross-section plus the remaining curved surface.`,
        steps: [`$1$ flat base $+ 1$ curved surface $= 2$ faces.`],
        conclusion: `2 faces.`,
        hint: `Think of half an orange: the flat circular cut side plus the peel side.`,
      };
    }
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Solid formed by rotating a right-angled triangle',
        questionType: 'identification', difficulty, mathematicalOperation: 'Solid of revolution',
        representation: 'definition', context: 'Solids of revolution',
        numbersUsed: [360], expectedReasoning: 'Rotating a right triangle 360 degrees around one of its legs creates a cone',
        conceptKey: 'SOLID_OF_REVOLUTION_CONE',
      },
      questionText: `What $3\\text{D}$ solid is generated when a right-angled triangle is rotated $360^\\circ$ around one of its legs?`,
      correctAnswer: `A right circular cone`,
      rawDistractors: [`A cylinder`, `A sphere`, `A triangular prism`],
      given: `Right-angled triangle revolved $360^\\circ$ around one leg.`,
      required: `Solid generated.`,
      method: `The leg on the axis forms the height; the other leg sweeps out a circular base, forming a cone.`,
      steps: [`Revolving a right triangle produces a cone.`],
      conclusion: `A right circular cone is formed.`,
      hint: `Spinning a right triangle around its vertical side traces out an ice cream cone shape.`,
    };
  }

  // Default Polygons / Polyhedra
  const polys = [
    { name: 'regular pentagon', sides: 5, intAngle: 108 },
    { name: 'regular hexagon', sides: 6, intAngle: 120 },
    { name: 'regular heptagon', sides: 7, intAngle: 128.5 },
    { name: 'regular octagon', sides: 8, intAngle: 135 },
    { name: 'regular decagon', sides: 10, intAngle: 144 },
  ];
  const p = prng.pick(polys);
  const correctAns = `$${p.sides}$`;
  return {
    blueprint: {
      mainTopic: topicArea, subtopic: topicName, skill: `Number of sides of a ${p.name}`,
      questionType: 'identification', difficulty, mathematicalOperation: 'Polygon side count',
      representation: 'definition', context: '2D Polygon properties',
      numbersUsed: [p.sides], expectedReasoning: 'Classify polygon by side count',
      conceptKey: `POLYGON_SIDES_${p.sides}`,
    },
    questionText: `By definition, how many sides (and angles) does a ${p.name} have?`,
    correctAnswer: correctAns,
    rawDistractors: makeUniqueDistractors(correctAns, [`$${p.sides + 1}$`, `$${p.sides - 1}$`, `$${p.sides + 2}$`], prng),
    given: `Polygon: ${p.name}.`,
    required: `Number of sides.`,
    method: `A ${p.name} has $${p.sides}$ sides.`,
    steps: [`$${p.sides}$ sides.`],
    conclusion: `A ${p.name} has $${p.sides}$ sides.`,
    hint: `Recall Greek numerical prefixes: penta = 5, hexa = 6, octa = 8, deca = 10.`,
  };
}
