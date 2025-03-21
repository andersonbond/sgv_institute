import { useEffect, useState, useRef } from "react";
import { IonCard, IonIcon } from "@ionic/react";
import { arrowBack, arrowForward, closeCircle } from "ionicons/icons";
import { motion } from "framer-motion";
import { IonProgressBar } from "@ionic/react";
import PreExamPage from "./PreExamination";
import PosExamination from "./PosExamination";
import { saveExamResult } from "../queries/examResults";
import ExamResultCard from "./ExamResultCard";

interface CourseContentSectionProps {
  moduleId: string;
  onBackToModules: () => void;
  currentPage: number;
}

const CourseContentSection: React.FC<CourseContentSectionProps> = ({
  moduleId,
  onBackToModules,
  currentPage,
}) => {
  const [sections, setSections] = useState<any[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(
    currentPage || 0
  );
  const [selectedAnswer, setSelectedAnswer] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [animationKey, setAnimationKey] = useState(0);
  const cardRef = useRef<HTMLIonCardElement>(null);
  const [showCurrentQuestionResult, setCurrentQuestionResult] =
    useState<boolean>(false);
  const [retryCount, setRetryCount] = useState(0); // Track retry count
  const [isAnswerShown, setIsAnswerShown] = useState(false);
  const [isHidePrevNextButton, setHidePrevNextButton] = useState(false);
  const [isExamFinished, setExamFinished] = useState(false);

  useEffect(() => {
    const fileMapping: Record<string, string> = {
      PMFIDS_PM: "project_management.json",
      PMFIDS_BCM: "budget_cost_management.json",
      PMFIDS_RISK: "project_risk_management.json",
      ABSTIT_ABS: "aligning_business_strat.json",
      CM_INTRO: "change_management_intro.json",
      CM_PREPARE: "change_management_prepare.json",
      CM_MANAGE: "change_management_manage.json",
      CM_SUSTAIN: "change_management_sustain.json",
      DCO_SEAMLESS: "seamless_digital.json",
      DCO_NEW_APPLICATION: "new_application.json",
      DCO_APPLICATION_APPROVAL: "application_approval.json",
      DATAGOV_MAPPING: "data_gov.json",
    };

    if (moduleId && fileMapping[moduleId]) {
      console.log("moduleId: ", moduleId);
      const filePath = `/courses/${fileMapping[moduleId]}`;
      fetch(filePath)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Network response was not ok for ${filePath}`);
          }
          return response.json();
        })
        .then((data) => {
          const courses = data;
          const filteredCourse = courses.find(
            (course: any) => course.moduleId === moduleId
          );
          if (filteredCourse) {
            const sortedSections = filteredCourse.sections.sort(
              (a: any, b: any) => parseFloat(a.order) - parseFloat(b.order)
            );
            setSections(sortedSections);
          }
        })
        .catch((error) => {
          console.error("Error fetching course data:", error);
        });
    } else {
      console.warn("No valid moduleId provided or mapping not found.");
    }
  }, [moduleId]);

  const isAnswerSelected = selectedAnswer.length > 0;
  const renderPageColtwoContent = () => {
    return (
      <>
        <div className="text-2xl text-yellow-500 font-bold mb-6">
          {currentSection.title}
        </div>
        <div className="grid grid-cols-2 gap-2 ">
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: currentSection.col1 }}
          />

          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: currentSection.col2 }}
          />
        </div>
      </>
    );
  };

  const renderPageColthreeContent = () => {
    return (
      <>
        <div className="text-2xl text-yellow-500 font-bold mb-6">
          {currentSection.title}
        </div>
        <div className="grid grid-cols-3 gap-3 ">
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: currentSection.col1 }}
          />
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: currentSection.col2 }}
          />
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: currentSection.col3 }}
          />
        </div>
      </>
    );
  };
  useEffect(() => {
    console.log("current module", moduleId);
    const savedPage = localStorage.getItem(`currentPage-${moduleId}`);

    if (savedPage) {
      setCurrentSectionIndex(parseInt(savedPage));
    }
  }, [moduleId]);
  useEffect(() => {
    if (currentSectionIndex !== null) {
      const page = currentSectionIndex?.toString() || "0";
      localStorage.setItem(`currentPage-${moduleId}`, page);
    }
  }, [currentSectionIndex, moduleId]);

  useEffect(() => {
    if (sections.length > 0) {
      localStorage.setItem(`sectionlength-${moduleId}`, `${sections.length}`);
    }
  }, [sections, moduleId]);

  const currentSection = sections[currentSectionIndex];
  const totalSections = sections.length;
  const progress =
    totalSections > 0 ? (currentSectionIndex / (totalSections - 1)) * 100 : 0;
  const currentStep = currentSectionIndex + 1;

  const handleNext = () => {
    if (currentSectionIndex < sections.length - 1) {
      setSelectedAnswer([]);
      setFeedback(null);
      setAnimationKey((prev) => prev + 1);
      setCurrentSectionIndex((prev) => prev + 1);

      if (cardRef.current) {
        cardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    setRetryCount(0);
    setIsAnswerShown(false);
  };

  const handleBack = () => {
    if (currentSectionIndex > 0) {
      setSelectedAnswer([]);
      setFeedback(null);
      setAnimationKey((prev) => prev + 1);
      setCurrentSectionIndex((prev) => prev - 1);

      if (cardRef.current) {
        cardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    setRetryCount(0);
    setIsAnswerShown(false);
  };

  const handleAnswerChange = (value: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedAnswer((prev) => [...prev, value]);
    } else {
      setSelectedAnswer((prev) => prev.filter((answer) => answer !== value));
    }
    setFeedback(null);
  };

  const handleShowAnswer = () => {
    const selectedAnswers = selectedAnswer;
    const correctAnswers = currentSection.q_answer
      .split(",")
      .map((answer: string) => answer.trim());

    const isCorrect =
      selectedAnswers.length === correctAnswers.length &&
      selectedAnswers.every((answer) => correctAnswers.includes(answer)) &&
      correctAnswers.every((answer: any) => selectedAnswers.includes(answer));

    setFeedback(
      isCorrect ? "✅ Correct answer!" : "❌ Wrong answer. Try again."
    );
    setIsAnswerShown(true);
  };

  const handleRetry = () => {
    if (retryCount < 3) {
      setIsAnswerShown(false);
      setRetryCount((prevCount) => prevCount + 1);
    } else {
      setRetryCount(0);
    }
    setSelectedAnswer([]);
    setFeedback(null);
  };
  const isExam =
    currentSection?.title === "Module Pre-Examination" ||
    currentSection?.title === "Module Post-Examination";
  const handleFinishModule = async () => {
    const examModule = sections.find(
      (section) => section.title === currentSection?.title
    );
    if (!examModule) return;

    const exam = examModule.exams[0];
    const examId = exam.exam_id;
    const examTitle = exam.title;

    const totalQuestion = examModule.exams.flatMap(
      (exam: any) => exam.questions
    ).length;

    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      console.error("User not found in localStorage");
      return;
    }
    const user = JSON.parse(storedUser);
    const userId = user.userid;

    const examScoreStr = localStorage.getItem("examScore") || "0";
    const examScore = parseInt(examScoreStr, 10);
    const percentage = ((examScore / totalQuestion) * 100).toFixed(2);
    if (currentSectionIndex === sections.length - 1) {
      localStorage.setItem(
        `currentPage-${moduleId}`,
        sections.length.toString()
      );
    }

    const { data, error } = await saveExamResult(
      examTitle,
      userId,
      examId,
      totalQuestion,
      parseFloat(percentage)
    );

    if (error) {
      console.error("Failed to save exam result:", error);
    } else {
      console.log("Exam result saved successfully:", data);
    }
    handleNext();
  };
  return (
    <div>
      <div className="flex justify-end">
        <IonIcon
          icon={closeCircle}
          onClick={onBackToModules}
          size="large"
          className="p-2 mr-4 rounded-lg cursor-pointer text-gray-400"
        />
      </div>

      {sections.length > 0 && currentSectionIndex < sections.length ? (
        <motion.div
          key={animationKey}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.5 }}
        >
          <IonCard ref={cardRef} className="p-6 bg-white shadow-lg rounded-xl">
            <div className="mb-2 text-lg font-semibold text-gray-700 text-right">
              Page {currentStep} / {totalSections}
            </div>
            <IonProgressBar
              value={progress / 100}
              color="warning"
              className="mb-8"
            />
            {currentSection.layout === "col-2" ? (
              renderPageColtwoContent()
            ) : currentSection.layout === "col-3" ? (
              renderPageColthreeContent()
            ) : (
              <div
                className={
                  currentSection.layout === "col-1"
                    ? "grid grid-cols-1 gap-6 items-center items-center justify-items-center"
                    : "grid grid-cols-1 md:grid-cols-2 gap-6 items-center"
                }
              >
                {currentSection.layout === "col-2" ? (
                  renderPageColtwoContent()
                ) : currentSection.layout === "col-3" ? (
                  renderPageColthreeContent()
                ) : (
                  <>
                    {currentSection.image && (
                      <div className="flex justify-center">
                        <img
                          src={currentSection.image}
                          alt={currentSection.title}
                          className="rounded-lg"
                        />
                      </div>
                    )}

                    <div>
                      <div className="text-2xl text-yellow-500 font-bold mb-6">
                        {currentSection.title}
                      </div>
                      <div className="text-2xl text-yellow-500 font-bold mb-6">
                        {currentSection.subheader}
                      </div>

                      <div
                        className="prose mt-4"
                        dangerouslySetInnerHTML={{
                          __html: currentSection.body,
                        }}
                      />

                      {currentSection.list1 && (
                        <ul className="list-disc list-inside mt-4">
                          {currentSection.list1
                            .split(";")
                            .map((item: string, index: number) => (
                              <li
                                className="text-base/8"
                                key={`list1-${index}`}
                              >
                                {item.trim()}
                              </li>
                            ))}
                        </ul>
                      )}

                      {currentSection.numberedlist && (
                        <ol className="list-disc list-inside text-2xl mt-4">
                          {currentSection.numberedlist
                            .split(";")
                            .map((item: string, index: number) => (
                              <li
                                className="text-base/8"
                                key={`numberedlist-${index}`}
                              >
                                {item.trim()}
                              </li>
                            ))}
                        </ol>
                      )}

                      {currentSection.title === "Knowledge Check" &&
                        currentSection.q_selection && (
                          <div className="mt-6">
                            <div className="space-y-4">
                              {Object.entries(
                                currentSection.q_selection[0]
                              ).map(([key, value]) => (
                                <label
                                  key={key}
                                  className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-100"
                                >
                                  {currentSection.q_field_type ===
                                  "single_select" ? (
                                    <input
                                      type="radio"
                                      name="knowledge-check"
                                      value={key}
                                      checked={selectedAnswer.includes(key)}
                                      onChange={(e) =>
                                        !isAnswerShown &&
                                        handleAnswerChange(
                                          e.target.value,
                                          e.target.checked
                                        )
                                      }
                                      disabled={isAnswerShown} // Disable if answer is shown
                                      className="text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                    />
                                  ) : (
                                    <input
                                      type="checkbox"
                                      name="knowledge-check"
                                      value={key}
                                      checked={selectedAnswer.includes(key)}
                                      onChange={(e) =>
                                        !isAnswerShown &&
                                        handleAnswerChange(
                                          e.target.value,
                                          e.target.checked
                                        )
                                      }
                                      disabled={isAnswerShown} // Disable if answer is shown
                                      className="text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                    />
                                  )}
                                  <span className="text-lg text-gray-800">
                                    {String(value)}
                                  </span>
                                </label>
                              ))}
                            </div>
                            <div className="mt-8">
                              {/* Show "Show Answer" button when an answer is selected but feedback is not available */}
                              {!feedback && isAnswerSelected && (
                                <button
                                  onClick={handleShowAnswer}
                                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-300"
                                >
                                  Show Answer
                                </button>
                              )}

                              {/* Show "Retry" button only if the answer is wrong and retries left */}
                              {feedback &&
                                feedback.includes("❌") &&
                                isAnswerSelected &&
                                retryCount < 3 && (
                                  <button
                                    onClick={handleRetry}
                                    className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg shadow-md transition-colors duration-300"
                                  >
                                    Retry
                                  </button>
                                )}

                              {/* Display feedback message */}
                              {feedback && (
                                <p className="text-3xl font-semibold mt-10">
                                  {feedback}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </>
                )}
              </div>
            )}

            {currentSection.title === "Module Pre-Examination" &&
              currentSection.exams && (
                <PreExamPage
                  sections={currentSection}
                  handleFinishQuestionButton={handleFinishModule}
                />
              )}
            {currentSection.title === "Module Post-Examination" &&
              currentSection.exams && (
                <PosExamination
                  sections={currentSection}
                  handleFinishQuestionButton={handleFinishModule}
                />
              )}
            {!isExam && (
              <>
                <div className="flex justify-between mt-6 px-4 pb-4">
                  <button
                    onClick={handleBack}
                    disabled={currentSectionIndex === 0}
                    className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center"
                  >
                    <IonIcon icon={arrowBack} />
                  </button>
                  <button
                    onClick={handleNext}
                    className="w-12 h-12 bg-indigo-700 text-white rounded-full flex items-center justify-center"
                  >
                    <IonIcon icon={arrowForward} />
                  </button>
                </div>
              </>
            )}
          </IonCard>
        </motion.div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold">No content available</h2>
          <button
            onClick={onBackToModules}
            className="mt-4 px-4 py-2 bg-indigo-700 text-white rounded-lg"
          >
            Back to Modules
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseContentSection;
