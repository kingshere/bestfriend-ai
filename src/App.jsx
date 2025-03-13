import { useState, useEffect } from "react";
import "./App.css";
import ReactMarkdown from "react-markdown";
import Footer from "./Footer";
import ShareButtons from "./components/ShareButtons";
import { GoogleGenerativeAI } from "@google/generative-ai";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [generatingAnswer, setGeneratingAnswer] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuestion(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognition);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  async function generateAnswer(e) {
    setGeneratingAnswer(true);
    e.preventDefault();
    setAnswer("Loading your answer... \n It might take up to 10 seconds");
    try {
      // Check if API key exists and log it for debugging (remove in production)
      const apiKey = import.meta.env.VITE_API_GENERATIVE_LANGUAGE_CLIENT;
      console.log("API Key exists:", !!apiKey); // Logs true if key exists, false otherwise
      
      if (!apiKey) {
        throw new Error("API key is missing. Please check your .env file.");
      }

      // Initialize the Google Generative AI with your API key
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Try using a different model name
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      
      // Generate content using the model with simpler approach
      const prompt = question.trim();
      const result = await model.generateContent(prompt);
      
      // Get the response text
      const response = await result.response;
      const text = response.text();
      
      console.log("API Response:", text); // Log the response for debugging
      
      setAnswer(text);
    } catch (error) {
      // More detailed error logging
      console.error("API Error:", error);
      
      // Handle different types of errors with more specific messages
      setAnswer(`Error: ${error.message || "Something went wrong. Please try again!"}`);
    }
    setGeneratingAnswer(false);
  }

  return (
    <>
      <div className="bg-gradient-to-r from-emerald-900 via-teal-800 to-blue-900 h-screen p-6 flex flex-col justify-center items-center text-white">
        <div className="flex flex-col items-center overflow-y-auto w-full overflow-x-hidden">
          <form
            onSubmit={generateAnswer}
            className="w-full md:w-2/3 lg:w-1/2 xl:w-1/3 text-center rounded-lg shadow-2xl bg-teal-900 py-8 px-6 transition-all duration-500 transform hover:scale-105"
          >
              <h1 className="text-4xl font-bold text-emerald-300 mb-4 animate-pulse">
                Bestfriend AI
              </h1>

            <div className="relative w-full">
              <textarea
                required
                className="border border-teal-700 bg-teal-800 text-white rounded-lg w-full my-3 min-h-fit p-4 transition-all duration-300 focus:border-emerald-500 focus:shadow-lg focus:bg-teal-700"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Take help with your AI mate!"
              ></textarea>
              {recognition && (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full ${
                    isListening ? "bg-red-500" : "bg-emerald-500"
                  } hover:opacity-80 transition-all duration-300`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                </button>
              )}
            </div>
            <button
              type="submit"
              className={`bg-emerald-600 text-white py-3 px-6 rounded-md shadow-md hover:bg-emerald-700 transition-all duration-300 ${
                generatingAnswer ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={generatingAnswer}
            >
              Generate answer
            </button>
          </form>
          {/* Conditional Rendering for ReactMarkdown */}
          {answer && (
            <div className="w-full md:w-2/3 lg:w-1/3 xl:w-1/3 text-center rounded-lg bg-teal-900 my-6 shadow-2xl transition-all duration-500 transform hover:scale-105">
              <div className="p-4">
                <ReactMarkdown>{answer}</ReactMarkdown>
                <ShareButtons answer={answer} />
              </div>
            </div>
          )}
          <Footer />
        </div>
      </div>
    </>
  );
}

export default App;
