import { useState, useEffect } from "react";
import "./App.css";
import ReactMarkdown from "react-markdown";
import Footer from "./Footer";
import ShareButtons from "./components/ShareButtons";
import { GoogleGenerativeAI } from "@google/generative-ai";
import SidePanel from "./components/SidePanel";
// Import database connection and services
import connectDB from "./utils/db";
import { 
  getConversations, 
  getConversationById, 
  createConversation, 
  updateConversation, 
  deleteConversation, 
  addMessageToConversation 
} from "./services/conversationService";

function App() {
  // State variables
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [generatingAnswer, setGeneratingAnswer] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previousQuestion, setPreviousQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [previousConversations, setPreviousConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState("current");
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  // Database connection state
  const [dbConnected, setDbConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [chatInstance, setChatInstance] = useState(null);

  // Connect to MongoDB on component mount
  useEffect(() => {
    const initDB = async () => {
      try {
        await connectDB();
        setDbConnected(true);
        console.log("Connected to MongoDB");
      } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        // Fallback to localStorage if MongoDB connection fails
        const savedConversations = localStorage.getItem("previousConversations");
        if (savedConversations) {
          setPreviousConversations(JSON.parse(savedConversations));
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    initDB();
  }, []);

  // Load conversations from MongoDB
  useEffect(() => {
    const loadConversations = async () => {
      if (!dbConnected) return;
      
      setIsLoading(true);
      try {
        const conversations = await getConversations();
        setPreviousConversations(conversations.map(conv => ({
          id: conv._id,
          title: conv.title,
          timestamp: conv.updatedAt,
        })));
      } catch (error) {
        console.error("Failed to load conversations:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (dbConnected) {
      loadConversations();
    }
  }, [dbConnected]);

  // Save to localStorage as backup
  useEffect(() => {
    localStorage.setItem("previousConversations", JSON.stringify(previousConversations));
  }, [previousConversations]);

  // Speech recognition setup
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

  // Initialize chat instance
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

  // Function to load a previous conversation
  const loadConversation = async (conversationId) => {
    if (conversationId === "current") {
      setChatHistory([]);
      setActiveConversationId("current");
      return;
    }
    
    try {
      setIsLoading(true);
      const conversation = await getConversationById(conversationId);
      if (conversation) {
        setChatHistory(conversation.messages);
        setActiveConversationId(conversationId);
        
        // Close side panel on mobile after selection
        if (window.innerWidth < 768) {
          setIsSidePanelOpen(false);
        }
      }
    } catch (error) {
      console.error("Failed to load conversation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to delete a conversation
  const deleteConversationHandler = async (id, e) => {
    e.stopPropagation(); // Prevent triggering the parent click event
    
    try {
      await deleteConversation(id);
      setPreviousConversations(prev => prev.filter(conv => conv.id !== id));
      
      // If the active conversation is deleted, switch to current
      if (activeConversationId === id) {
        setChatHistory([]);
        setActiveConversationId("current");
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      // Still remove from UI even if DB delete fails
      setPreviousConversations(prev => prev.filter(conv => conv.id !== id));
    }
  };

  // Function to clear conversation history and save current conversation
  const clearConversation = async () => {
    // Only save if there are messages
    if (chatHistory.length > 0) {
      try {
        // Create a new conversation object
        const newConversation = {
          title: chatHistory[0].parts[0].text.slice(0, 30) + "...",
          messages: chatHistory
        };
        
        // Save to MongoDB
        const savedConversation = await createConversation(newConversation);
        
        // Add to previous conversations
        setPreviousConversations(prev => [{
          id: savedConversation._id,
          title: savedConversation.title,
          timestamp: savedConversation.createdAt
        }, ...prev]);
      } catch (error) {
        console.error("Failed to save conversation:", error);
        
        // Fallback to local storage if MongoDB save fails
        const newConversation = {
          id: Date.now().toString(),
          title: chatHistory[0].parts[0].text.slice(0, 30) + "...",
          timestamp: new Date().toISOString(),
          messages: chatHistory
        };
        
        setPreviousConversations(prev => [newConversation, ...prev]);
      }
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

  // Toggle speech recognition
  const toggleListening = () => {
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  // Handle editing message
  const handleEditMessage = () => {
    setPreviousQuestion(question);
    setIsEditing(true);
  };

  // Cancel editing
  const cancelEdit = () => {
    setQuestion(previousQuestion);
    setIsEditing(false);
  };

  // Generate answer from AI
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
      setChatHistory(prevHistory => {
        const newHistory = [...prevHistory, aiMessage];
        
        // If this is an existing conversation, update it in the database
        if (activeConversationId !== "current" && dbConnected) {
          updateConversation(activeConversationId, { messages: newHistory })
            .catch(err => console.error("Failed to update conversation:", err));
        }
        
        return newHistory;
      });
      
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
            deleteConversation={deleteConversationHandler}
            isLoading={isLoading}
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
                
                <div className="flex justify-between items-center mt-4">
                  {isEditing ? (
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                      >
                        Update
                      </button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={clearConversation}
                        className="px-4 py-2 bg-teal-700 text-white rounded-md hover:bg-teal-800 transition-colors"
                        disabled={chatHistory.length === 0}
                      >
                        New Chat
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                        disabled={generatingAnswer}
                      >
                        {generatingAnswer ? "Generating..." : "Ask"}
                      </button>
                    </div>
                  )}
                </div>
              </form>
              
              {/* Database connection status */}
              {!dbConnected && (
                <div className="mt-4 p-2 bg-yellow-600 text-white rounded-md text-sm">
                  Using local storage mode. MongoDB connection failed.
                </div>
              )}
              
              {/* Share buttons */}
              {chatHistory.length > 0 && (
                <div className="mt-6 w-full md:w-4/5 lg:w-3/4 xl:w-2/3">
                  <ShareButtons conversation={chatHistory} />
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}

export default App;