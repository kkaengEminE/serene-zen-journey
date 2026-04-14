import type { QuizAnswer } from "./QuizScreen";

// 심리 분석 차원 (4가지 축)
export interface PsychProfile {
  // 각 축은 0~1 범위
  serenity: number;    // 고요함 vs 혼란 (마음의 평화 수준)
  warmth: number;      // 따뜻함 vs 차가움 (감정적 온기)
  resilience: number;  // 회복력 vs 취약성 (내면의 힘)
  openness: number;    // 개방성 vs 폐쇄성 (변화 수용도)
  dominant: "serenity" | "warmth" | "resilience" | "openness";
  secondary: "serenity" | "warmth" | "resilience" | "openness";
  emotionalState: "exhausted" | "anxious" | "restless" | "searching";
  coreNeed: "silence" | "comfort" | "strength" | "direction";
  releaseTarget: "pressure" | "regret" | "worry" | "judgment";
  desiredSelf: "free" | "steady" | "flexible" | "expansive";
}

// 각 질문-답변 조합이 4개 축에 미치는 영향 가중치
const questionWeights: Record<number, Record<number, Partial<Record<keyof Pick<PsychProfile, "serenity" | "warmth" | "resilience" | "openness">, number>>>> = {
  // Q1: 지금 마음 상태
  0: {
    0: { serenity: 0.7, warmth: 0.3 },         // 고요하지만 부족한
    1: { resilience: 0.2, openness: 0.3 },      // 바쁜 생각들
    2: { serenity: 0.1, resilience: 0.1 },       // 불안하고 초조한
    3: { warmth: 0.2, resilience: 0.1 },         // 무기력하고 지친
  },
  // Q2: 오늘의 색
  1: {
    0: { serenity: 0.4, warmth: 0.2 },          // 흐린 회색
    1: { serenity: 0.2, resilience: 0.3 },       // 어두운 남색
    2: { warmth: 0.4, openness: 0.3 },           // 탁한 노란색
    3: { serenity: 0.3, openness: 0.2 },         // 창백한 흰색
  },
  // Q3: 가장 필요한 것
  2: {
    0: { serenity: 0.9, warmth: 0.2 },          // 고요한 침묵
    1: { warmth: 0.9, serenity: 0.2 },           // 따뜻한 위로
    2: { resilience: 0.9, serenity: 0.2 },       // 흔들리지 않는 힘
    3: { openness: 0.9, resilience: 0.2 },       // 새로운 방향
  },
  // Q4: 떠오르는 풍경
  3: {
    0: { serenity: 0.6, resilience: 0.3 },       // 안개 낀 산길
    1: { openness: 0.5, serenity: 0.4 },         // 파도가 밀려오는 해변
    2: { openness: 0.7, warmth: 0.3 },           // 끝없는 들판
    3: { serenity: 0.8, warmth: 0.3 },           // 고요한 연못
  },
  // Q5: 놓아주고 싶은 감정
  4: {
    0: { resilience: 0.6, serenity: 0.4 },       // 완벽해야 한다는 압박
    1: { warmth: 0.5, serenity: 0.4 },           // 과거 후회
    2: { openness: 0.4, resilience: 0.5 },       // 미래 걱정
    3: { openness: 0.6, warmth: 0.4 },           // 타인의 시선
  },
  // Q6: 원하는 모습
  5: {
    0: { openness: 0.8, serenity: 0.3 },         // 바람처럼 자유로운
    1: { resilience: 0.8, serenity: 0.4 },       // 산처럼 흔들리지 않는
    2: { warmth: 0.5, openness: 0.5 },           // 물처럼 유연한
    3: { serenity: 0.5, openness: 0.6 },         // 하늘처럼 넓은
  },
};

export function analyzeQuiz(answers: QuizAnswer[]): PsychProfile {
  const scores = { serenity: 0, warmth: 0, resilience: 0, openness: 0 };

  for (const { questionIndex, answerIndex } of answers) {
    const weights = questionWeights[questionIndex]?.[answerIndex] ?? {};
    for (const [key, val] of Object.entries(weights)) {
      scores[key as keyof typeof scores] += val as number;
    }
  }

  // Normalize to 0~1
  const max = Math.max(...Object.values(scores), 1);
  for (const key of Object.keys(scores) as (keyof typeof scores)[]) {
    scores[key] = scores[key] / max;
  }

  // Find dominant and secondary
  const sorted = (Object.entries(scores) as [keyof typeof scores, number][])
    .sort((a, b) => b[1] - a[1]);

  // Derive emotional state from Q1
  const q1 = answers.find(a => a.questionIndex === 0)?.answerIndex ?? 0;
  const emotionalStates: PsychProfile["emotionalState"][] = ["searching", "restless", "anxious", "exhausted"];

  // Core need from Q3
  const q3 = answers.find(a => a.questionIndex === 2)?.answerIndex ?? 0;
  const coreNeeds: PsychProfile["coreNeed"][] = ["silence", "comfort", "strength", "direction"];

  // Release target from Q5
  const q5 = answers.find(a => a.questionIndex === 4)?.answerIndex ?? 0;
  const releaseTargets: PsychProfile["releaseTarget"][] = ["pressure", "regret", "worry", "judgment"];

  // Desired self from Q6
  const q6 = answers.find(a => a.questionIndex === 5)?.answerIndex ?? 0;
  const desiredSelves: PsychProfile["desiredSelf"][] = ["free", "steady", "flexible", "expansive"];

  return {
    ...scores,
    dominant: sorted[0][0],
    secondary: sorted[1][0],
    emotionalState: emotionalStates[q1],
    coreNeed: coreNeeds[q3],
    releaseTarget: releaseTargets[q5],
    desiredSelf: desiredSelves[q6],
  };
}

// ── 개인화된 힐링 메시지 생성 ──

const gardenMessages: Record<PsychProfile["dominant"], Record<PsychProfile["coreNeed"], string[]>> = {
  serenity: {
    silence: [
      "고요함은 이미 당신 안에 있습니다",
      "침묵 속에서 가장 깊은 대답을 만나세요",
      "바람이 멈춘 수면처럼, 당신의 마음도 맑아지고 있습니다",
      "이 고요함이 당신의 본래 모습입니다",
    ],
    comfort: [
      "고요한 마음 위로 따스한 빛이 내립니다",
      "당신은 이미 충분히 잘 해왔습니다",
      "자갈 위에 그려진 파문처럼, 부드럽게 흘러가세요",
      "따뜻함은 멀리 있지 않습니다 — 바로 이 순간에",
    ],
    strength: [
      "고요함 속에 흔들리지 않는 힘이 있습니다",
      "물은 부드럽지만 바위를 뚫습니다",
      "당신의 평온함이 곧 강인함입니다",
      "깊은 호수처럼, 표면 아래의 힘을 믿으세요",
    ],
    direction: [
      "길은 걸어야 보입니다 — 지금 이 한 걸음이 시작입니다",
      "안개가 걷히면 길이 보일 것입니다",
      "정원의 끝에는 새로운 풍경이 기다립니다",
      "고요한 마음이 가장 정확한 나침반입니다",
    ],
  },
  warmth: {
    silence: [
      "따뜻한 침묵이 당신을 감싸고 있습니다",
      "말하지 않아도 괜찮습니다 — 그 자체로 충분합니다",
      "어둠 속에서도 당신의 마음은 따뜻합니다",
      "고요한 정원이 당신의 온기를 기억합니다",
    ],
    comfort: [
      "당신은 따뜻한 빛을 받을 자격이 있습니다",
      "상처 위에 내리는 햇살처럼, 치유는 이미 시작되었습니다",
      "마음이 따뜻해질 때, 세상도 달라 보입니다",
      "당신의 부드러움은 이 세상에 필요한 빛입니다",
    ],
    strength: [
      "따뜻한 마음은 가장 강한 무기입니다",
      "부드러움으로 세상을 안는 당신은 강합니다",
      "봄바람도 겨울의 눈을 녹입니다 — 당신의 온기처럼",
      "감정을 느끼는 것은 약함이 아닌 용기입니다",
    ],
    direction: [
      "따뜻한 마음이 이끄는 곳에 답이 있습니다",
      "가슴이 시키는 대로 한 발짝만 내딛어 보세요",
      "지금 느끼는 따스함이 당신의 방향입니다",
      "마음의 나침반은 언제나 따뜻한 곳을 가리킵니다",
    ],
  },
  resilience: {
    silence: [
      "흔들림 없는 산은 고요합니다",
      "당신의 뿌리는 보이지 않는 곳에서 깊어지고 있습니다",
      "고요히 서 있는 것도 힘입니다",
      "침묵은 강한 자의 언어입니다",
    ],
    comfort: [
      "강한 나무도 비를 맞으며 자랍니다",
      "쉬어가는 것은 멈추는 것이 아닙니다",
      "당신의 강인함에도 쉼표가 필요합니다",
      "단단한 돌 위에도 따스한 이끼가 자랍니다",
    ],
    strength: [
      "산은 바람에 흔들리지 않습니다",
      "지금의 시련은 내일의 지혜가 됩니다",
      "당신 안의 힘을 믿으세요 — 그것은 진짜입니다",
      "뿌리 깊은 나무는 폭풍에도 서 있습니다",
    ],
    direction: [
      "강한 발걸음은 이미 길을 만들고 있습니다",
      "방향을 몰라도 괜찮습니다 — 당신의 힘이 길을 열 것입니다",
      "산을 넘으면 새로운 지평이 보입니다",
      "견디는 힘이 길을 찾는 힘이 됩니다",
    ],
  },
  openness: {
    silence: [
      "열린 하늘 아래, 고요함이 찾아옵니다",
      "경계를 내려놓으면 침묵이 말을 겁니다",
      "새처럼, 하늘에는 한계가 없습니다",
      "열린 마음이 가장 넓은 고요를 품습니다",
    ],
    comfort: [
      "놓아줄 때 비로소 따뜻함이 들어옵니다",
      "열린 손으로 세상을 안으세요",
      "변화 속에서도 당신의 중심은 따뜻합니다",
      "모든 문이 닫혀도 하늘은 열려 있습니다",
    ],
    strength: [
      "유연함은 강함의 다른 이름입니다",
      "대나무는 휘어져도 부러지지 않습니다",
      "변화를 받아들이는 것이 진정한 힘입니다",
      "바다는 모든 강을 품습니다 — 당신의 마음처럼",
    ],
    direction: [
      "놓아줄 때 비로소 자유가 찾아옵니다",
      "과거의 무게를 내려놓으세요",
      "당신의 길은 이미 열려 있습니다",
      "새로운 바람이 새로운 곳으로 데려갈 것입니다",
    ],
  },
};

// 감정 상태별 추가 메시지 (첫 번째 메시지로 삽입)
const openingByState: Record<PsychProfile["emotionalState"], string> = {
  exhausted: "지친 마음에게 쉼을 허락하세요",
  anxious: "지금 이 순간, 당신은 안전합니다",
  restless: "흩어진 생각들을 잠시 내려놓으세요",
  searching: "찾고 있는 것은 이미 가까이에 있습니다",
};

// 놓아주기 대상별 마무리 메시지
const closingByRelease: Record<PsychProfile["releaseTarget"], string> = {
  pressure: "완벽하지 않아도 됩니다 — 있는 그대로의 당신이 아름답습니다",
  regret: "과거는 이미 지나갔습니다 — 지금 이 순간에 머무르세요",
  worry: "아직 오지 않은 내일은 걱정이 아닌 희망으로 채우세요",
  judgment: "타인의 눈이 아닌, 자신의 마음으로 살아가세요",
};

export function getPersonalizedMessages(profile: PsychProfile): string[] {
  const coreMessages = gardenMessages[profile.dominant][profile.coreNeed];
  const opening = openingByState[profile.emotionalState];
  const closing = closingByRelease[profile.releaseTarget];

  // 5개 메시지: 오프닝 → 핵심 2개 → 보조 1개 → 클로징
  const secondaryMessages = gardenMessages[profile.secondary][profile.coreNeed];

  return [
    opening,
    coreMessages[0],
    coreMessages[1],
    secondaryMessages[2] ?? secondaryMessages[0],
    closing,
  ];
}

// 피날레 메시지 생성
export function getFinaleMessage(profile: PsychProfile): { title: string; subtitle: string } {
  const titles: Record<PsychProfile["desiredSelf"], string> = {
    free: "자유로운 영혼에게",
    steady: "흔들리지 않는 당신에게",
    flexible: "유연한 물결처럼",
    expansive: "무한한 하늘 아래",
  };

  const subtitles: Record<PsychProfile["desiredSelf"], string> = {
    free: "바람이 되어 경계 없이 날아가세요",
    steady: "당신의 뿌리는 어떤 폭풍도 견딥니다",
    flexible: "변화 속에서 빛나는 당신의 아름다움",
    expansive: "당신의 마음만큼 넓은 세상이 기다립니다",
  };

  return { title: titles[profile.desiredSelf], subtitle: subtitles[profile.desiredSelf] };
}

// 프로필 기반 추천 풍경 (완전 랜덤 대신 성향 반영)
export function getRecommendedLandscape(profile: PsychProfile): number {
  // 0: 지중해, 1: 우유니, 2: 초원
  const mapping: Record<PsychProfile["dominant"], number> = {
    serenity: 1,   // 고요함 → 우유니 (거울 같은 고요)
    warmth: 2,     // 따뜻함 → 초원 (포근한 자연)
    resilience: 2,  // 회복력 → 초원 (생명력)
    openness: 0,   // 개방성 → 지중해 (탁 트인 수평선)
  };
  return mapping[profile.dominant];
}
