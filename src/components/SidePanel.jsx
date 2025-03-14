import React from 'react';

function SidePanel({ 
  isOpen, 
  previousConversations, 
  activeConversationId, 
  loadConversation, 
  deleteConversation,
  isLoading = false
}) {
  return (
    <div className={`fixed md:static top-20 bottom-0 left-0 z-20 w-64 bg-teal-900 shadow-xl transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} overflow-y-auto`}>
      <div className="p-4 border-b border-teal-700">
        <h2 className="text-xl font-semibold text-emerald-300">Conversations</h2>
      </div>
      
      <div className="p-2">
        <button 
          onClick={() => loadConversation("current")}
          className={`w-full text-left p-3 rounded-md mb-2 transition-colors ${activeConversationId === "current" ? 'bg-emerald-700 text-white' : 'text-emerald-300 hover:bg-teal-800'}`}
        >
          New Conversation
        </button>
        
        {isLoading ? (
          <div className="text-center p-4 text-emerald-300">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-emerald-300 border-r-2 border-emerald-300 border-b-2 border-transparent"></div>
            <p className="mt-2">Loading conversations...</p>
          </div>
        ) : (
          previousConversations.map(conv => (
            <div 
              key={conv.id} 
              onClick={() => loadConversation(conv.id)}
              className={`relative w-full text-left p-3 rounded-md mb-2 transition-colors cursor-pointer group ${activeConversationId === conv.id ? 'bg-emerald-700 text-white' : 'text-emerald-300 hover:bg-teal-800'}`}
            >
              <div className="pr-8 truncate">{conv.title}</div>
              <button 
                onClick={(e) => deleteConversation(conv.id, e)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-emerald-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Delete conversation"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default SidePanel;