import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, AlertTriangle, Loader, Shield, Activity, Camera, X, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { chatbotService } from '../services/chatbotService';
import { EmergencyRequest, Severity } from '../types';

interface ChatbotViewProps {
  onSubmit: (data: Partial<EmergencyRequest>) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  image?: File;
  analysis?: any;
  timestamp: Date;
}

export const ChatbotView: React.FC<ChatbotViewProps> = ({ onSubmit }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      sender: 'bot', 
      text: 'I am the AI Disaster Response Assistant. Describe your situation or upload a photo of the incident.', 
      timestamp: new Date() 
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() && !selectedImage) return;

    const userMsg: Message = { 
        id: Date.now().toString(), 
        sender: 'user', 
        text: input, 
        image: selectedImage || undefined,
        timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSelectedImage(null);
    setIsTyping(true);

    try {
      const response = await chatbotService.processMessage(userMsg.text, userMsg.image);
      
      const botMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        sender: 'bot', 
        text: response.text, 
        analysis: response.analysis,
        timestamp: new Date() 
      };
      
      setMessages(prev => [...prev, botMsg]);

      // Auto-submit if analysis is present
      if (response.analysis) {
        // We only auto-submit if it looks like a real report attempt
        if (userMsg.text.length > 5) {
            console.log("Auto-submitting analyzed report:", response.analysis);
            onSubmit({
                description: userMsg.text,
                disasterType: response.analysis.disasterType,
                severity: response.analysis.severity,
                resourceNeeded: response.analysis.resourceNeeded,
                priorityScore: response.analysis.emotionalUrgency * 10 
            });
        }
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: 'err', sender: 'bot', text: "I'm having trouble connecting to HQ. Please try again or use the manual report form.", timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4 flex items-center gap-3 shadow-sm z-10">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-slate-900">AI Response Unit</h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-slate-500 font-medium">Online • ML Active</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-slate-200' : 'bg-indigo-100'}`}>
              {msg.sender === 'user' ? <User className="w-5 h-5 text-slate-500" /> : <Shield className="w-5 h-5 text-indigo-600" />}
            </div>
            
            <div className={`max-w-[80%] space-y-2`}>
              <div className={`p-4 rounded-2xl shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-slate-800 text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
              }`}>
                {msg.image && (
                  <div className="mb-2">
                    <img 
                      src={URL.createObjectURL(msg.image)} 
                      alt="Uploaded proof" 
                      className="rounded-lg max-h-48 border border-white/20"
                    />
                  </div>
                )}
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>

              {/* Analysis Card if available */}
              {msg.analysis && (
                <div className="bg-white border border-indigo-100 rounded-xl p-3 shadow-md animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-2">
                        <Activity className="w-4 h-4 text-indigo-500" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Analysis Result</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-50 p-2 rounded-lg">
                            <span className="block text-slate-400 mb-1">Type</span>
                            <span className="font-bold text-slate-800">{msg.analysis.disasterType}</span>
                        </div>
                        <div className={`p-2 rounded-lg ${msg.analysis.severity === Severity.CRITICAL ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-800'}`}>
                            <span className="block opacity-60 mb-1">Severity</span>
                            <span className="font-bold">{msg.analysis.severity}</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg col-span-2">
                            <span className="block text-slate-400 mb-1">Resource Identified</span>
                            <span className="font-bold text-slate-800">{msg.analysis.resourceNeeded}</span>
                        </div>
                    </div>
                </div>
              )}
              
              <span className="text-[10px] text-slate-400 px-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
              <Loader className="w-4 h-4 text-indigo-500 animate-spin" />
              <span className="text-xs text-slate-400">Analyzing input...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-200">
        {selectedImage && (
          <div className="mb-4 relative inline-block">
            <img 
              src={URL.createObjectURL(selectedImage)} 
              alt="Preview" 
              className="h-24 w-auto rounded-lg border border-slate-200 shadow-sm"
            />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        <form onSubmit={handleSend} className="relative flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files?.[0]) setSelectedImage(e.target.files[0]);
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
            title="Upload Photo Proof"
          >
            <Camera className="w-5 h-5" />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={selectedImage ? "Describe this photo..." : "Type your emergency..."}
            className="flex-1 pl-5 pr-14 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all font-medium placeholder:text-slate-400"
          />
          <button 
            type="submit"
            className="absolute right-2 top-2 bottom-2 aspect-square bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={(!input.trim() && !selectedImage) || isTyping}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
