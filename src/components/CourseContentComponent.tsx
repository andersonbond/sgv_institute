import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { IonCard, IonCardContent, IonSearchbar, IonIcon } from "@ionic/react";
import { createOutline } from "ionicons/icons";
import CourseContentSection from "./CourseContentSections";

const CourseContentComponent: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { courseId } = useParams<{ courseId: string }>();
  const history = useHistory();

  useEffect(() => {
    fetch("/courseList.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch course list");
        }
        return response.json();
      })
      .then((data) => {
        // Retrieve the course using courseId from the URL
        const course = data[courseId];
        if (course && course.modules) {
          setModules(course.modules);
        } else {
          console.warn(`No modules found for course ${courseId}`);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching course list:", error);
        setLoading(false);
      });
  }, [courseId]);
  console.log(modules);
  const handleTakeExam = () => {
    history.push(`/course/${courseId}/exam`);
    window.location.reload();
  };

  const handleSelectedModule = (module: any) => {
    setSelectedModule(module.moduleId);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4">
        <p>Loading modules...</p>
      </div>
    );
  }

  if (!loading && modules.length === 0) {
    return (
      <div className="min-h-screen p-4">
        <p>No modules available for this course.</p>
      </div>
    );
  }

  return (
    <div>
      {!selectedModule ? (
        <div className="space-y-6 p-4">
          {/* <div className="w-full">
            <IonSearchbar placeholder="Search Modules..." className="mb-4" />
          </div> */}
          {modules.map((module) => (
            <IonCard
              key={module.moduleId}
              onClick={() => handleSelectedModule(module)}
              className={`bg-slate-100 cursor-pointer hover:shadow-xl transition duration-300 rounded-lg`}
            >
              <IonCardContent className="flex items-center space-x-4">
                <img
                  src={module.icon}
                  alt={module.title}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {module.title}
                  </div>
                  <div className="text-xl mt-4 text-stone-700">
                    {module.description}
                  </div>
                </div>
              </IonCardContent>
            </IonCard>
          ))}
        </div>
      ) : (
        <CourseContentSection
          moduleId={selectedModule}
          onBackToModules={() => setSelectedModule(null)}
        />
      )}
    </div>
  );
};

export default CourseContentComponent;
