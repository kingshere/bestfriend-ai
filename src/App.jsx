import { useState, useEffect } from "react";
import "./App.css";
import ReactMarkdown from "react-markdown";
import Footer from "./Footer";
import ShareButtons from "./components/ShareButtons";
import { GoogleGenerativeAI } from "@google/generative-ai";
import SidePanel from "./components/SidePanel";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [generatingAnswer, setGeneratingAnswer] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previousQuestion, setPreviousQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  // Add state for previous conversations and active conversation ID
  const [previousConversations, setPreviousConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState("current");
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  // Load previous conversations from localStorage on component mount
  useEffect(() => {
    const savedConversations = localStorage.getItem("previousConversations");
    if (savedConversations) {
      setPreviousConversations(JSON.parse(savedConversations));
    }
  }, []);

  // Save previous conversations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("previousConversations", JSON.stringify(previousConversations));
  }, [previousConversations]);

  // Function to load a previous conversation
  const loadConversation = (conversationId) => {
    if (conversationId === "current") {
      setChatHistory([]);
      setActiveConversationId("current");
      return;
    }
    
    const conversation = previousConversations.find(conv => conv.id === conversationId);
    if (conversation) {
      setChatHistory(conversation.messages);
      setActiveConversationId(conversationId);
      
      // Close side panel on mobile after selection
      if (window.innerWidth < 768) {
        setIsSidePanelOpen(false);
      }
    }
  };

  // Function to delete a conversation
  const deleteConversation = (id, e) => {
    e.stopPropagation(); // Prevent triggering the parent click event
    setPreviousConversations(prev => prev.filter(conv => conv.id !== id));
    
    // If the active conversation is deleted, switch to current
    if (activeConversationId === id) {
      setChatHistory([]);
      setActiveConversationId("current");
    }
  };

  // Function to clear conversation history and save current conversation
  const clearConversation = () => {
    // Only save if there are messages
    if (chatHistory.length > 0) {
      // Create a new conversation object
      const newConversation = {
        id: Date.now().toString(),
        title: chatHistory[0].parts[0].text.slice(0, 30) + "...",
        timestamp: new Date().toISOString(),
        messages: chatHistory
      };
      
      // Add to previous conversations
      setPreviousConversations(prev => [newConversation, ...prev]);
    }
    
    // Clear current chat
    setChatHistory([]);
    setAnswer("");
    setQuestion("");
    setActiveConversationId("current");
    
    // Reinitialize chat instance
    const apiKey = import.meta.env.VITE_API_GENERATIVE_LANGUAGE_CLIENT;
    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const chat = model.startChat({
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      });
      setChatInstance(chat);
    }
  };

  // Toggle side panel
  const toggleSidePanel = () => {
    setIsSidePanelOpen(!isSidePanelOpen);
  };

  const toggleListening = () => {
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  // New function to handle editing
  const handleEditMessage = () => {
    setPreviousQuestion(question);
    setIsEditing(true);
  };

  // New function to cancel editing
  const cancelEdit = () => {
    setQuestion(previousQuestion);
    setIsEditing(false);
  };

  // Toggle side panel - removed duplicate declaration
  
  // Chat instance setup
  const [chatInstance, setChatInstance] = useState(null);
  
  useEffect(() => {
    const initializeChat = async () => {
      try {
        const apiKey = import.meta.env.VITE_API_GENERATIVE_LANGUAGE_CLIENT;
        if (apiKey) {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
          const chat = model.startChat({
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
          });
          setChatInstance(chat);
        }
      } catch (error) {
        console.error("Failed to initialize chat:", error);
      }
    };
    
    initializeChat();
  }, []);

  async function generateAnswer(e) {
    setGeneratingAnswer(true);
    e.preventDefault();
    setIsEditing(false);
    
    const prompt = question.trim();
    if (!prompt) {
      setGeneratingAnswer(false);
      return;
    }
    
    // Add user message to chat history immediately
    const userMessage = { role: "user", parts: [{ text: prompt }] };
    setChatHistory(prevHistory => [...prevHistory, userMessage]);
    
    try {
      if (!chatInstance) {
        throw new Error("Chat not initialized. Please refresh the page.");
      }
      
      // Send message to API
      const result = await chatInstance.sendMessage(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log("API Response:", text);
      
      // Add AI response to chat history
      const aiMessage = { role: "model", parts: [{ text: text }] };
      setChatHistory(prevHistory => [...prevHistory, aiMessage]);
      
      setQuestion(""); // Clear input for next message
    } catch (error) {
      console.error("API Error:", error);
      
      // Add error message to chat history
      const errorMessage = { 
        role: "model", 
        parts: [{ text: `Error: ${error.message || "Something went wrong. Please try again!"}` }] 
      };
      setChatHistory(prevHistory => [...prevHistory, errorMessage]);
    }
    
    setGeneratingAnswer(false);
  }

  return (
    <>
      <div className="bg-gradient-to-r from-emerald-900 via-teal-800 to-blue-900 min-h-screen flex flex-col">
        {/* Fixed header banner */}
        <div className="fixed top-0 left-0 right-0 z-10 bg-gradient-to-r from-emerald-900 via-teal-800 to-blue-900 py-2 shadow-lg flex items-center justify-between px-4">
          <button 
            onClick={toggleSidePanel}
            className="text-white p-2 rounded-md hover:bg-teal-700 transition-colors md:hidden"
            aria-label="Toggle side panel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex-grow flex justify-center">
            <h1 className="artistic-header-compact mb-0">
              BESTFRIEND AI
            </h1>
          </div>
          
          <div className="w-10"></div> {/* Spacer for balance */}
        </div>
        
        <div className="flex flex-1 pt-20">
          {/* Side panel for previous conversations */}
          <SidePanel 
            isOpen={isSidePanelOpen}
            previousConversations={previousConversations}
            activeConversationId={activeConversationId}
            loadConversation={loadConversation}
            deleteConversation={deleteConversation}
          />
          
          {/* Main content */}
          <div className="flex-1 p-6 md:pl-4 flex flex-col items-center text-white">
            <div className="flex flex-col items-center overflow-y-auto w-full overflow-x-hidden">
              {/* Display conversation history */}
              {chatHistory.length > 0 && (
                <div className="w-full md:w-4/5 lg:w-3/4 xl:w-2/3 mb-6 flex flex-col">
                  {chatHistory.map((message, index) => (
                    <div 
                      key={index} 
                      className={`my-2 p-4 rounded-lg ${
                        message.role === "user" 
                          ? "bg-teal-800 text-white self-end mr-2 max-w-[80%]" 
                          : "bg-emerald-700 text-white self-start ml-2 max-w-[80%]"
                      }`}
                    >
                      <ReactMarkdown>{message.parts[0].text}</ReactMarkdown>
                    </div>
                  ))}
                  
                  {/* Loader when generating answer */}
                  {generatingAnswer && (
                    <div className="my-2 p-4 rounded-lg bg-emerald-700 text-white self-start ml-2 max-w-[80%]">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <form
                onSubmit={generateAnswer}
                className="w-full md:w-4/5 lg:w-3/4 xl:w-2/3 text-center rounded-lg shadow-2xl bg-teal-900 py-8 px-6 transition-all duration-500 transform hover:scale-105"
              >
                <div className="relative w-full">
                  <textarea
                    required
                    className="border border-teal-700 bg-teal-800 text-white rounded-lg w-full my-3 min-h-[120px] p-4 transition-all duration-300 focus:border-emerald-500 focus:shadow-lg focus:bg-teal-700"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Take help from your AI mate!"
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
                
                <div className="flex justify-center space-x-4 mt-4">
                  {isEditing ? (
                    <>
                      <button
                        type="submit"
                        className="bg-emerald-600 text-white py-3 px-6 rounded-md shadow-md hover:bg-emerald-700 transition-all duration-300"
                      >
                        Save & Generate
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="bg-gray-600 text-white py-3 px-6 rounded-md shadow-md hover:bg-gray-700 transition-all duration-300"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="submit"
                        className={`bg-emerald-600 text-white py-3 px-6 rounded-md shadow-md hover:bg-emerald-700 transition-all duration-300 ${
                          generatingAnswer ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={generatingAnswer}
                      >
                        Send message
                      </button>
                      {chatHistory.length > 0 && (
                        <button
                          type="button"
                          onClick={clearConversation}
                          className="bg-red-600 text-white py-3 px-6 rounded-md shadow-md hover:bg-red-700 transition-all duration-300"
                        >
                          New conversation
                        </button>
                      )}
                    </>
                  )}
                </div>
              </form>
              
              {/* We don't need the separate answer display anymore since we're showing the conversation history */}
              <Footer />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
