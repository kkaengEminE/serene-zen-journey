import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export interface QuizAnswer {
  questionIndex: number;
  answerIndex: number;
}

interface QuizScreenProps {
  onComplete: (answers: QuizAnswer[]) => void;
}

const questions = [
  {
    question: "지금 이 순간, 당신의 마음은 어떤 상태인가요?",
    options: ["고요하지만 무언가 부족한", "바쁜 생각들로 가득 찬", "불안하고 초조한", "무기력하고 지친"],
  },
  {
    question: "오늘 하루를 색으로 표현한다면?",
    options: ["흐린 회색", "어두운 남색", "탁한 노란색", "창백한 흰색"],
  },
  {
    question: "지금 가장 필요한 것은 무엇인가요?",
    options: ["고요한 침묵", "따뜻한 위로", "흔들리지 않는 힘", "새로운 방향"],
  },
  {
    question: "눈을 감으면 어떤 풍경이 떠오르나요?",
    options: ["안개 낀 산길", "파도가 밀려오는 해변", "끝없이 펼쳐진 들판", "고요한 연못"],
  },
  {
    question: "당신이 놓아주고 싶은 감정은?",
    options: ["완벽해야 한다는 압박", "과거에 대한 후회", "미래에 대한 걱정", "타인의 시선에 대한 의식"],
  },
  {
    question: "내면의 평화를 찾았을 때, 어떤 모습이길 바라나요?",
    options: ["바람처럼 자유로운", "산처럼 흔들리지 않는", "물처럼 유연한", "하늘처럼 넓은"],
  },
];

const QuizScreen = ({ onComplete }: QuizScreenProps) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [direction, setDirection] = useState(1);

  const progress = ((currentQ + 1) / questions.length) * 100;
  // Gradually lighten: from very dark to slightly warmer
  const bgLightness = 8 + (currentQ / questions.length) * 8;

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers, { questionIndex: currentQ, answerIndex }];
    setAnswers(newAnswers);
    setDirection(1);

    if (currentQ < questions.length - 1) {
      setTimeout(() => setCurrentQ(currentQ + 1), 300);
    } else {
      setTimeout(() => onComplete(newAnswers), 500);
    }
  };

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center transition-colors duration-1000"
      style={{ backgroundColor: `hsl(30, 5%, ${bgLightness}%)` }}
    >
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-px bg-border">
        <motion.div
          className="h-full bg-primary/50"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Question counter */}
      <div className="absolute top-6 right-6 text-xs text-muted-foreground tracking-widest font-serif">
        {currentQ + 1} / {questions.length}
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentQ}
          custom={direction}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-lg mx-6 text-center"
        >
          <p className="text-xs text-muted-foreground tracking-[0.3em] mb-8 font-serif">
            問 {currentQ + 1}
          </p>
          <h2 className="text-xl md:text-2xl font-serif font-light text-foreground leading-relaxed mb-12">
            {questions[currentQ].question}
          </h2>

          <div className="space-y-3">
            {questions[currentQ].options.map((option, i) => (
              <motion.button
                key={i}
                onClick={() => handleAnswer(i)}
                className="w-full py-3 px-6 border border-border/50 rounded-sm text-sm text-foreground/70 hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                whileHover={{ x: 4 }}
              >
                {option}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default QuizScreen;
