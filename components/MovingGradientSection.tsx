import { useEffect } from "react";

const MovingGradientSection = () => {
  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
      @keyframes moveGradient {
        0% {
          background-position: 0% 0%;
        }
        50% {
          background-position: 100% 100%;
        }
        100% {
          background-position: 0% 0%;
        }
      }
    `;
    document.head.appendChild(styleTag);

    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);

  return (
    <section
      className="flex flex-col items-center text-center bg-gradient-to-br from-green-100 via-blue-50 to-gray-100 text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-900"
      style={{
        backgroundSize: "400% 400%",
        animation: "moveGradient 5s linear infinite",
      }}
    >
      {/* Your other content here */}
    </section>
  );
};

export default MovingGradientSection;   