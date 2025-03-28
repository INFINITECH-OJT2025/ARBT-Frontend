"use client";

import { useEffect } from "react";

const ChatBot = () => {
  useEffect(() => {
    // Check if the Tawk.to script is already added
    if (document.getElementById("tawk-script")) return;

    // Create a script element for Tawk.to
    const script = document.createElement("script");
    script.src = "https://embed.tawk.to/67d3dd6ce75030190d977c87/1im9q6pvf";  // Tawk.to embed script



    script.async = true;
    script.id = "tawk-script"; // Give it an ID to ensure it's only added once
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");

    // Append the script to the body
    document.body.appendChild(script);

    // Add the div container where Tawk will embed the chat
    const div = document.createElement("div");
    div.id = "tawk_67d3dd6ce75030190d977c87";
    document.body.appendChild(div);

    // Cleanup when the component is unmounted
    return () => {
      const existingScript = document.getElementById("tawk-script");
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  return null;  // No need to render anything in the DOM
};

export default ChatBot;
