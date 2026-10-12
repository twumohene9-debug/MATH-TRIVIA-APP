import { DifficultyTier } from '../../types';
import { PRNG } from '../generators/shared';
import { GeneratedTopicArtifact, makeUniqueDistractors, fmtCedis } from './types';

export function generateFinancialAppliedTopic(
  topicName: string,
  topicArea: string,
  stageId: number,
  difficulty: DifficultyTier,
  prng: PRNG,
  diffMultiplier: number
): GeneratedTopicArtifact {
  const nameL = topicName.toLowerCase();

  // =========================================================================
  // STAGE 91: MONEY & MAKING CHANGE (Topics 901 - 910)
  // =========================================================================
  if (nameL.includes('change') || nameL.includes('coins') || nameL.includes('banknotes') || nameL.includes('counting money') || nameL.includes('currency')) {
    const cost = prng.pick([12, 15, 23, 34, 45, 68]);
    const paid = cost < 20 ? 20 : cost < 50 ? 50 : 100;
    const change = paid - cost;
    const correctAns = `$${fmtCedis(change)}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Calculating change from banknote payment',
        questionType: 'word_problem', difficulty, mathematicalOperation: 'Change = Paid - Cost',
        representation: 'word_problem', context: 'Everyday shopping transaction',
        numbersUsed: [cost, paid, change], expectedReasoning: 'Subtract total purchase cost from banknote denomination tendered',
        conceptKey: 'MAKING_CHANGE_CALCULATION',
      },
      questionText: `Esi buys groceries costing $${fmtCedis(cost)}$ and pays the cashier with a $${fmtCedis(paid)}$ banknote.\n\nHow much change should Esi receive?`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${fmtCedis(change + 5)}$`,
        `$${fmtCedis(Math.max(1, change - 5))}$`,
        `$${fmtCedis(paid + cost)}$`,
      ], prng),
      given: `Purchase cost $= ${fmtCedis(cost)}$, Paid $= ${fmtCedis(paid)}$.`,
      required: `Change due.`,
      method: `$\\text{Change} = \\text{Paid} - \\text{Cost} = ${fmtCedis(paid)} - ${fmtCedis(cost)} = ${fmtCedis(change)}$.`,
      steps: [`$${paid} - ${cost} = ${change}$.`],
      conclusion: `Esi should receive $${fmtCedis(change)}$ in change.`,
      hint: `Subtract the cost of the groceries from the amount handed to the cashier.`,
    };
  }

  // =========================================================================
  // STAGE 92 & 93: PROFIT, LOSS, DISCOUNT & VAT (Topics 911 - 930)
  // =========================================================================
  if (nameL.includes('discount')) {
    const origPrice = prng.pick([80, 100, 120, 150, 200, 250]);
    const discPct = prng.pick([10, 15, 20, 25, 30]);
    const discAmount = (origPrice * discPct) / 100;
    const salePrice = origPrice - discAmount;
    const correctAns = `$${fmtCedis(salePrice)}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Calculating discounted sale price',
        questionType: 'word_problem', difficulty, mathematicalOperation: 'Sale Price = Orig - (Orig * Disc%)',
        representation: 'word_problem', context: 'Retail sales',
        numbersUsed: [origPrice, discPct, discAmount, salePrice], expectedReasoning: 'Compute percentage reduction and subtract from original price',
        conceptKey: 'DISCOUNT_SALE_PRICE_CALC',
      },
      questionText: `A jacket originally marked at $${fmtCedis(origPrice)}$ is on sale at a $${discPct}\\%$ discount.\n\nWhat is the discounted sale price?`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${fmtCedis(discAmount)}$`, // gave discount amount instead of price
        `$${fmtCedis(origPrice - discPct)}$`, // subtracted percentage points directly
        `$${fmtCedis(salePrice + 10)}$`,
      ], prng),
      given: `Original price $= ${fmtCedis(origPrice)}$, Discount $= ${discPct}\\%$.`,
      required: `Sale price.`,
      method: `$\\text{Discount Amount} = ${origPrice} \\times \\dfrac{${discPct}}{100} = ${fmtCedis(discAmount)}$. $\\text{Sale Price} = ${origPrice} - ${discAmount} = ${fmtCedis(salePrice)}$.`,
      steps: [
        `Discount: $${origPrice} \\times ${discPct / 100} = ${fmtCedis(discAmount)}$.`,
        `Sale price: $${origPrice} - ${discAmount} = ${fmtCedis(salePrice)}$.`,
      ],
      conclusion: `The sale price is $${fmtCedis(salePrice)}$.`,
      hint: `Find $${discPct}\\%$ of $${fmtCedis(origPrice)}$, then subtract it from the original price.`,
    };
  }

  if (nameL.includes('profit') || nameL.includes('loss') || nameL.includes('selling price') || nameL.includes('cost price')) {
    const cp = prng.pick([50, 80, 100, 150, 200, 250]);
    const profitPct = prng.pick([15, 20, 25, 30, 40]);
    const profitAmount = (cp * profitPct) / 100;
    const sp = cp + profitAmount;
    const isLoss = nameL.includes('loss');
    if (isLoss) {
      const lossAmount = profitAmount;
      const spLoss = cp - lossAmount;
      const correctAns = `$${fmtCedis(spLoss)}$`;
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Calculating selling price under percentage loss',
          questionType: 'word_problem', difficulty, mathematicalOperation: 'SP = CP - Loss',
          representation: 'word_problem', context: 'Commerce',
          numbersUsed: [cp, profitPct, lossAmount, spLoss], expectedReasoning: 'Subtract percentage loss from cost price',
          conceptKey: 'SELLING_PRICE_LOSS_CALC',
        },
        questionText: `A trader bought goods for $${fmtCedis(cp)}$ and had to sell them at a $${profitPct}\\%$ loss.\n\nWhat was the selling price?`,
        correctAnswer: correctAns,
        rawDistractors: makeUniqueDistractors(correctAns, [
          `$${fmtCedis(sp)}$`, // added profit instead of subtracting loss
          `$${fmtCedis(lossAmount)}$`,
          `$${fmtCedis(spLoss - 10)}$`,
        ], prng),
        given: `Cost price $= ${fmtCedis(cp)}$, Loss $= ${profitPct}\\%$.`,
        required: `Selling price.`,
        method: `$\\text{Loss} = ${cp} \\times \\dfrac{${profitPct}}{100} = ${fmtCedis(lossAmount)}$. $\\text{SP} = ${cp} - ${lossAmount} = ${fmtCedis(spLoss)}$.`,
        steps: [`$${cp} - ${lossAmount} = ${spLoss}$.`],
        conclusion: `The selling price is $${fmtCedis(spLoss)}$.`,
        hint: `Calculate the loss amount and subtract it from the cost price.`,
      };
    }
    const correctAns = `$${fmtCedis(sp)}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Calculating selling price under percentage profit',
        questionType: 'word_problem', difficulty, mathematicalOperation: 'SP = CP + Profit',
        representation: 'word_problem', context: 'Commerce',
        numbersUsed: [cp, profitPct, profitAmount, sp], expectedReasoning: 'Compute profit on cost price and add to cost price',
        conceptKey: 'SELLING_PRICE_PROFIT_CALC',
      },
      questionText: `A trader purchased goods for $${fmtCedis(cp)}$ and sold them to earn a $${profitPct}\\%$ profit.\n\nWhat was the selling price?`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${fmtCedis(profitAmount)}$`,
        `$${fmtCedis(cp - profitAmount)}$`,
        `$${fmtCedis(sp + 15)}$`,
      ], prng),
      given: `Cost price $= ${fmtCedis(cp)}$, Profit $= ${profitPct}\\%$.`,
      required: `Selling price.`,
      method: `$\\text{Profit} = ${cp} \\times \\dfrac{${profitPct}}{100} = ${fmtCedis(profitAmount)}$. $\\text{SP} = ${cp} + ${profitAmount} = ${fmtCedis(sp)}$.`,
      steps: [`$${cp} + ${profitAmount} = ${sp}$.`],
      conclusion: `The selling price is $${fmtCedis(sp)}$.`,
      hint: `Calculate $${profitPct}\\%$ of $${fmtCedis(cp)}$ and add it to the cost price.`,
    };
  }

  // =========================================================================
  // STAGE 94: SIMPLE & COMPOUND INTEREST (Topics 931 - 940)
  // =========================================================================
  if (nameL.includes('interest') || nameL.includes('principal') || nameL.includes('loan')) {
    const P = prng.pick([500, 1000, 1200, 2000, 2500, 5000]);
    const R = prng.pick([5, 6, 8, 10, 12]);
    const T = prng.pick([2, 3, 4, 5]);
    const I = (P * R * T) / 100;
    const totalAmount = P + I;
    const isTotalReq = nameL.includes('repayment') || nameL.includes('total');
    if (isTotalReq) {
      const correctAns = `$${fmtCedis(totalAmount)}$`;
      return {
        blueprint: {
          mainTopic: topicArea, subtopic: topicName, skill: 'Total repayment amount under simple interest',
          questionType: 'word_problem', difficulty, mathematicalOperation: 'A = P + I',
          representation: 'word_problem', context: 'Banking and loans',
          numbersUsed: [P, R, T, I, totalAmount], expectedReasoning: 'Calculate simple interest I = PRT/100 and add to Principal',
          conceptKey: 'LOAN_TOTAL_REPAYMENT_CALC',
        },
        questionText: `A farmer borrows a loan of $${fmtCedis(P)}$ at an interest rate of $${R}\\%$ per annum for $${T}\\text{ years}$.\n\nWhat is the total repayment amount (Principal $+$ Interest)?`,
        correctAnswer: correctAns,
        rawDistractors: makeUniqueDistractors(correctAns, [
          `$${fmtCedis(I)}$`, // gave interest only
          `$${fmtCedis(P + (P * R) / 100)}$`, // 1 year only
          `$${fmtCedis(totalAmount + 100)}$`,
        ], prng),
        given: `Principal $P = ${fmtCedis(P)}$, Rate $R = ${R}\\%$, Time $T = ${T}\\text{ years}$.`,
        required: `Total repayment $A$.`,
        method: `$I = \\dfrac{P \\times R \\times T}{100} = ${fmtCedis(I)}$. $A = P + I = ${P} + ${I} = ${fmtCedis(totalAmount)}$.`,
        steps: [
          `Interest: $\\dfrac{${P} \\times ${R} \\times ${T}}{100} = ${fmtCedis(I)}$.`,
          `Total: $${P} + ${I} = ${fmtCedis(totalAmount)}$.`,
        ],
        conclusion: `The total repayment is $${fmtCedis(totalAmount)}$.`,
        hint: `Find the interest using $I = \\dfrac{P \\times R \\times T}{100}$, then add it back to the principal.`,
      };
    }
    const correctAns = `$${fmtCedis(I)}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Calculating Simple Interest (I = PRT / 100)',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'I = (P * R * T) / 100',
        representation: 'word_problem', context: 'Simple interest',
        numbersUsed: [P, R, T, I], expectedReasoning: 'Multiply principal by rate and time, then divide by 100',
        conceptKey: 'SIMPLE_INTEREST_FORMULA_CALC',
      },
      questionText: `Calculate the Simple Interest earned on a principal of $${fmtCedis(P)}$ deposited at $${R}\\%$ per annum for $${T}\\text{ years}$:`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${fmtCedis(totalAmount)}$`,
        `$${fmtCedis((P * R) / 100)}$`, // 1 year
        `$${fmtCedis(I + 25)}$`,
      ], prng),
      given: `Principal $P = ${fmtCedis(P)}$, Rate $R = ${R}\\%$, Time $T = ${T}\\text{ years}$.`,
      required: `Simple Interest $I$.`,
      method: `$I = \\dfrac{P \\times R \\times T}{100} = \\dfrac{${P} \\times ${R} \\times ${T}}{100} = ${fmtCedis(I)}$.`,
      steps: [`$I = \\dfrac{${P * R * T}}{100} = ${fmtCedis(I)}$.`],
      conclusion: `The interest is $${fmtCedis(I)}$.`,
      hint: `Use the formula: $\\text{Interest} = \\dfrac{P \\times R \\times T}{100}$.`,
    };
  }

  // =========================================================================
  // STAGE 95: CURRENCY CONVERSION & UTILITY BILLS (Topics 941 - 950)
  // =========================================================================
  if (nameL.includes('exchange rate') || nameL.includes('currency conversion')) {
    const rate = prng.pick([12, 14, 15, 16]); // GH¢ per USD
    const usd = prng.pick([20, 50, 100, 200]);
    const ghs = usd * rate;
    const correctAns = `$${fmtCedis(ghs)}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Currency exchange conversion',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Converted = Foreign * Rate',
        representation: 'word_problem', context: 'Foreign exchange',
        numbersUsed: [usd, rate, ghs], expectedReasoning: 'Multiply foreign currency amount by exchange rate per unit',
        conceptKey: 'CURRENCY_EXCHANGE_CALC',
      },
      questionText: `If the foreign exchange rate is $\\$1 = \\text{GH¢}${rate}$, how much is $\\$${usd}$ worth in Ghana Cedis?`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${fmtCedis(Math.round(usd / rate))}$`, // divided instead of multiplied
        `$${fmtCedis(ghs + 50)}$`,
        `$${fmtCedis(usd * 10)}$`,
      ], prng),
      given: `Rate: $\\$1 = \\text{GH¢}${rate}$, Amount: $\\$${usd}$.`,
      required: `Value in GH¢.`,
      method: `$\\text{Amount} = ${usd} \\times ${rate} = ${fmtCedis(ghs)}$.`,
      steps: [`$${usd} \\times ${rate} = ${ghs}$.`],
      conclusion: `It is worth $${fmtCedis(ghs)}$.`,
      hint: `Multiply the US Dollars by the exchange rate of ${rate}.`,
    };
  }

  // =========================================================================
  // STAGE 96: TRAVEL, SPEED, TIME & MAP SCALES (Topics 951 - 960)
  // =========================================================================
  if (nameL.includes('map scale') || nameL.includes('map reading')) {
    const scale = prng.pick([50000, 100000, 200000]); // 1 cm = scale cm
    const mapCm = prng.pick([3, 4, 5, 8]);
    const realKm = (mapCm * scale) / 100000;
    const correctAns = `$${realKm}\\text{ km}$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Calculating real-world distance from map scale',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Real = Map * Scale / 100,000',
        representation: 'word_problem', context: 'Cartography',
        numbersUsed: [mapCm, scale, realKm], expectedReasoning: 'Multiply map distance by scale ratio and convert cm to km',
        conceptKey: 'MAP_SCALE_REAL_DISTANCE_CALC',
      },
      questionText: `A map has a representative scale of $1 : ${scale.toLocaleString()}$ ($1\\text{ cm}$ on the map represents $${scale / 100000}\\text{ km}$ in reality).\n\nIf two towns are $${mapCm}\\text{ cm}$ apart on the map, what is the actual real-world distance between them?`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${realKm * 10}\\text{ km}$`,
        `$${realKm + 5}\\text{ km}$`,
        `$${Math.round(scale / mapCm)}\\text{ km}$`,
      ], prng),
      given: `Scale $1 : ${scale.toLocaleString()}$, Map distance $= ${mapCm}\\text{ cm}$.`,
      required: `Actual distance in km.`,
      method: `$\\text{Real Distance} = ${mapCm} \\times ${scale / 100000}\\text{ km} = ${realKm}\\text{ km}$.`,
      steps: [
        `$1\\text{ cm} = ${scale / 100000}\\text{ km}$.`,
        `$${mapCm} \\times ${scale / 100000} = ${realKm}\\text{ km}$.`,
      ],
      conclusion: `The actual distance is $${realKm}\\text{ km}$.`,
      hint: `Multiply the map measurement by what 1 cm represents in reality.`,
    };
  }

  // =========================================================================
  // STAGE 98: CONSTRUCTION & MENSURATION (Topics 971 - 980)
  // =========================================================================
  if (nameL.includes('tile') || nameL.includes('floor') || nameL.includes('paint') || nameL.includes('fencing')) {
    const roomL = prng.pick([6, 8, 10, 12]);
    const roomW = prng.pick([4, 5, 6]);
    const roomArea = roomL * roomW;
    const tileSideM = 0.5; // 0.5m x 0.5m = 0.25 m^2
    const tileArea = tileSideM * tileSideM;
    const tilesNeeded = Math.round(roomArea / tileArea);
    const correctAns = `$${tilesNeeded}$ tiles`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Calculating tiles required to cover a floor',
        questionType: 'word_problem', difficulty, mathematicalOperation: 'Tiles = RoomArea / TileArea',
        representation: 'word_problem', context: 'Building and construction',
        numbersUsed: [roomL, roomW, roomArea, tilesNeeded], expectedReasoning: 'Divide total floor area by area of a single tile',
        conceptKey: 'FLOOR_TILES_COVERAGE_CALC',
      },
      questionText: `A rectangular hall measures $${roomL}\\text{ m}$ by $${roomW}\\text{ m}$.\n\nSquare floor tiles measure $0.5\\text{ m} \\times 0.5\\text{ m}$ (area of $0.25\\text{ m}^2$ per tile).\n\nHow many tiles are needed to cover the entire floor?`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${roomArea}$ tiles`, // forgot that 1 m^2 takes 4 tiles
        `$${tilesNeeded + 20}$ tiles`,
        `$${Math.round(tilesNeeded / 2)}$ tiles`,
      ], prng),
      given: `Room: $${roomL}\\text{ m} \\times ${roomW}\\text{ m}$, Tile: $0.25\\text{ m}^2$.`,
      required: `Number of tiles.`,
      method: `$\\text{Room Area} = ${roomL} \\times ${roomW} = ${roomArea}\\text{ m}^2$. $\\text{Tiles} = ${roomArea} \\div 0.25 = ${tilesNeeded}$.`,
      steps: [
        `Floor area: $${roomL} \\times ${roomW} = ${roomArea}\\text{ m}^2$.`,
        `Tiles: $${roomArea} \\div 0.25 = ${tilesNeeded}$.`,
      ],
      conclusion: `$${tilesNeeded}$ tiles are needed.`,
      hint: `Each square meter needs 4 tiles (since each tile is 0.25 m²).`,
    };
  }

  // =========================================================================
  // STAGE 99: AGRICULTURAL & POPULATION DENSITY (Topics 981 - 990)
  // =========================================================================
  if (nameL.includes('population density') || nameL.includes('density')) {
    const pop = prng.pick([50000, 80000, 120000, 200000]);
    const area = prng.pick([25, 40, 50, 100]);
    const density = Math.round(pop / area);
    const correctAns = `$${density}\\text{ people/km}^2$`;
    return {
      blueprint: {
        mainTopic: topicArea, subtopic: topicName, skill: 'Calculating population density (Density = Population / Area)',
        questionType: 'direct_calculation', difficulty, mathematicalOperation: 'Density = Pop / Area',
        representation: 'word_problem', context: 'Demographics and geography',
        numbersUsed: [pop, area, density], expectedReasoning: 'Divide total resident population by geographical land area in square kilometers',
        conceptKey: 'POPULATION_DENSITY_CALC',
      },
      questionText: `A district has a total population of $${pop.toLocaleString()}$ people living within a land area of $${area}\\text{ km}^2$.\n\nCalculate the population density of the district:`,
      correctAnswer: correctAns,
      rawDistractors: makeUniqueDistractors(correctAns, [
        `$${density + 150}\\text{ people/km}^2$`,
        `$${Math.max(100, density - 150)}\\text{ people/km}^2$`,
        `$${density * 2}\\text{ people/km}^2$`,
      ], prng),
      given: `Population $= ${pop.toLocaleString()}$, Area $= ${area}\\text{ km}^2$.`,
      required: `Population density.`,
      method: `$\\text{Density} = \\dfrac{\\text{Population}}{\\text{Area}} = \\dfrac{${pop}}{${area}} = ${density}\\text{ people/km}^2$.`,
      steps: [`$${pop} \\div ${area} = ${density}$.`],
      conclusion: `The density is $${density}\\text{ people/km}^2$.`,
      hint: `Divide the total number of people by the area in square kilometers.`,
    };
  }

  // Default Travel Kinematics Distance / Speed
  const speed = prng.pick([60, 75, 80, 90, 100]);
  const time = prng.pick([2, 3, 4, 5]);
  const dist = speed * time;
  const correctAns = `$${dist}\\text{ km}$`;
  return {
    blueprint: {
      mainTopic: topicArea, subtopic: topicName, skill: `Kinematics calculation for ${topicName}`,
      questionType: 'word_problem', difficulty, mathematicalOperation: 'Distance = Speed * Time',
      representation: 'word_problem', context: 'Travel kinematics',
      numbersUsed: [speed, time, dist], expectedReasoning: 'Distance covered equals constant speed multiplied by duration',
      conceptKey: `TRAVEL_KINEMATICS_STAGE_${stageId}_SKILL`,
    },
    questionText: `A passenger bus travels at an average steady speed of $${speed}\\text{ km/h}$ for $${time}\\text{ hours}$.\n\nWhat total distance does the bus travel?`,
    correctAnswer: correctAns,
    rawDistractors: makeUniqueDistractors(correctAns, [
      `$${dist + speed}\\text{ km}$`,
      `$${Math.max(30, dist - speed)}\\text{ km}$`,
      `$${Math.round(speed / time)}\\text{ km}$`,
    ], prng),
    given: `Speed $= ${speed}\\text{ km/h}$, Time $= ${time}\\text{ hours}$.`,
    required: `Distance.`,
    method: `$\\text{Distance} = \\text{Speed} \\times \\text{Time} = ${speed} \\times ${time} = ${dist}\\text{ km}$.`,
    steps: [`$${speed} \\times ${time} = ${dist}\\text{ km}$.`],
    conclusion: `The distance is $${dist}\\text{ km}$.`,
    hint: `Multiply the speed by the travel time: $\\text{Distance} = \\text{Speed} \\times \\text{Time}$.`,
  };
}
