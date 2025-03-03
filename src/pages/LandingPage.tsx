import React, { useState, useEffect } from "react";
import { IonPage, IonContent, IonSearchbar, IonIcon } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { arrowForwardCircleOutline, enterOutline } from "ionicons/icons";
import { getUserByEmail } from "../queries/userQueries";

const LandingPage: React.FC = () => {
  const history = useHistory();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(!!localStorage.getItem("user"));

  const handleTakeCourse = (courseId: string) => {
    const isLogin = localStorage.getItem("user");
    if (isLogin) {
      history.push(`/course/${courseId}`);
    } else {
      setIsCardOpen(true);
    }
  };
  useEffect(() => {
    const cachedCourses = localStorage.getItem("courses");
    if (cachedCourses) {
      setCourses(JSON.parse(cachedCourses));
      setLoading(false);
    } else {
      fetch("/courseList.json")
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch course list");
          }
          return response.json();
        })
        .then((data) => {
          const coursesArray = Object.values(data);
          setCourses(coursesArray);
          localStorage.setItem("courses", JSON.stringify(coursesArray));
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching course list:", error);
          setLoading(false);
        });
    }
  }, []);

  const validateEmail = async () => {
    const { exists, error, user } = await getUserByEmail(email);

    if (!exists) {
      setError(error || "Email validation failed.");
    } else {
      console.log("user: ", user);
      localStorage.setItem("user", JSON.stringify(user));
      setIsCardOpen(false);
      setError("");
      setIsLogin(true);
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent className="p-6 bg-gradient-to-b from-purple-50 via-pink-50 to-white flex items-center justify-center">
          <p>Loading courses...</p>
        </IonContent>
      </IonPage>
    );
  }

  const handleLogin = () => {
    setIsCardOpen(true);
  };
  return (
    <IonPage>
      <IonContent className="p-6 bg-gradient-to-b from-purple-50 via-pink-50 to-white relative">
        {isCardOpen && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center z-50 relative">
              <button
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
                onClick={() => setIsCardOpen(false)}
              >
                ✕
              </button>
              <h3 className="text-xl font-semibold mb-4">Please enter your email:</h3>
              <input
                type="email"
                placeholder="juandelacruz@bank.com.ph"
                className="w-full p-2 border rounded-lg mb-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
              <button
                className="mt-8 mb-8 w-full bg-gray-700 text-white py-2 rounded-lg"
                onClick={validateEmail}
              >
                <IonIcon icon={enterOutline} size="small" /> Login
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center space-y-8 pt-8 p-4">
          <div className="text-center space-y-2">
            <div className="w-12 mx-auto">
              <img
                src="/src/assets/sgv_logo.png"
                alt="SGV Institute Logo"
                className="w-full logo"
              />
            </div>
            <h2 className="text-3xl font-bold">SGV FSO Institute</h2>
            <p>
              SGV FSO Institute offers a variety of courses to elevate your
              skills and knowledge.{" "}
            </p>
          </div>

          <div>
              <button>
                {!isLogin && (
                  <span
                    onClick={handleLogin}
                    className="px-6 py-2 bg-gray-700 text-white rounded-lg flex items-center gap-2 cursor-pointer"
                  >
                    <IonIcon icon={enterOutline} size="small" /> Login
                  </span>
                )}
              </button>
            </div>
            
          <div
            className={`w-full max-w-md transition-opacity duration-300 ${
              isCardOpen ? "pointer-events-none opacity-40" : ""
            }`}
          >
            <IonSearchbar placeholder="Search courses..." className="mb-4" />
          </div>

          <div className="w-full max-w-4xl space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">
              Recommended Courses
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course) => (
                <div
                  key={course.courseId}
                  className="bg-white p-4 rounded-lg shadow-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 ${course.bgColor} rounded-full flex items-center justify-center`}
                    >
                      <img
                        src={course.icon}
                        alt={`${course.title} Icon`}
                        className="w-6 h-6"
                      />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-yellow-600">
                        {course.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {course.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-8 mb-2 flex justify-between items-center">
                    <span className="text-indigo-500 font-medium">
                      {course.price}
                    </span>
                    <button
                      className="px-6 py-2 bg-indigo-700 text-white rounded-lg flex items-center gap-2"
                      onClick={() => handleTakeCourse(course.courseId)}
                    >
                      <span className="font-bold">Take Course</span>
                      <IonIcon icon={arrowForwardCircleOutline} size="small" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LandingPage;
