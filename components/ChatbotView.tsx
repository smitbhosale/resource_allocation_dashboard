import '../css/components/ChatbotView.css';
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
        if (true) {
            console.log("Auto-submitting analyzed report:", response.analysis);
            onSubmit({
                description: userMsg.text,
                disasterType: response.analysis.disasterType,
                severity: response.analysis.severity,
                resourceNeeded: response.analysis.resourceNeeded,
                priorityScore: response.analysis.emotionalUrgency * 10 
            });
            
            setTimeout(() => {
                alert('EMERGENCY RESPONSE TRIGGERED:\n\nAuthorities have successfully received your report and are dispatching units to your location.');
                setMessages(prev => [...prev, {
                    id: (Date.now() + 2).toString(),
                    sender: 'bot',
                    text: '✅ **REQUEST SENT SUCCESSFULLY**\n\nYour incident report has been securely broadcasted to the live emergency network. Authorities are evaluating your location now.',
                    timestamp: new Date()
                }]);
            }, 1000);
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
    <div className="chatbotview-element-1">
      {/* Header */}
      <div className="chatbotview-element-2">
        <div className="chatbotview-element-3">
          <Bot className="chatbotview-element-4" />
        </div>
        <div>
          <h2 className="chatbotview-element-5">AI Response Unit</h2>
          <div className="chatbotview-element-6">
            <span className="chatbotview-element-7" />
            <span className="chatbotview-element-8">Online • ML Active</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="chatbotview-element-9">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-slate-200' : 'bg-indigo-100'}`}>
              {msg.sender === 'user' ? <User className="chatbotview-element-10" /> : <Shield className="chatbotview-element-11" />}
            </div>
            
            <div className={`max-w-[80%] space-y-2`}>
              <div className={`p-4 rounded-2xl shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-slate-800 text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
              }`}>
                {msg.image && (
                  <div className="chatbotview-element-12">
                    <img 
                      src={URL.createObjectURL(msg.image)} 
                      alt="Uploaded proof" 
                      className="chatbotview-element-13"
                    />
                  </div>
                )}
                <p className="chatbotview-element-14">{msg.text}</p>
              </div>

              {/* Analysis Card if available */}
              {msg.analysis && (
                <div className="chatbotview-element-15">
                    <div className="chatbotview-element-16">
                        <Activity className="chatbotview-element-17" />
                        <span className="chatbotview-element-18">Analysis Result</span>
                    </div>
                    <div className="chatbotview-element-19">
                        <div className="chatbotview-element-20">
                            <span className="chatbotview-element-21">Type</span>
                            <span className="chatbotview-element-22">{msg.analysis.disasterType}</span>
                        </div>
                        <div className={`p-2 rounded-lg ${msg.analysis.severity === Severity.CRITICAL ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-800'}`}>
                            <span className="chatbotview-element-23">Severity</span>
                            <span className="chatbotview-element-24">{msg.analysis.severity}</span>
                        </div>
                        <div className="chatbotview-element-25">
                            <span className="chatbotview-element-26">Resource Identified</span>
                            <span className="chatbotview-element-27">{msg.analysis.resourceNeeded}</span>
                        </div>
                    </div>
                </div>
              )}
              
              <span className="chatbotview-element-28">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="chatbotview-element-29">
            <div className="chatbotview-element-30">
              <Shield className="chatbotview-element-31" />
            </div>
            <div className="chatbotview-element-32">
              <Loader className="chatbotview-element-33" />
              <span className="chatbotview-element-34">Analyzing input...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chatbotview-element-35">
        {selectedImage && (
          <div className="chatbotview-element-36">
            <img 
              src={URL.createObjectURL(selectedImage)} 
              alt="Preview" 
              className="chatbotview-element-37"
            />
            <button 
              onClick={() => setSelectedImage(null)}
              className="chatbotview-element-38"
            >
              <X className="chatbotview-element-39" />
            </button>
          </div>
        )}
        <form onSubmit={handleSend} className="chatbotview-element-40">
          <input
            type="file"
            accept="image/*"
            className="chatbotview-element-41"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files?.[0]) setSelectedImage(e.target.files[0]);
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="chatbotview-element-42"
            title="Upload Photo Proof"
          >
            <Camera className="chatbotview-element-43" />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={selectedImage ? "Describe this photo..." : "Type your emergency..."}
            className="chatbotview-element-44"
          />
          <button 
            type="submit"
            className="chatbotview-element-45"
            disabled={(!input.trim() && !selectedImage) || isTyping}
          >
            <Send className="chatbotview-element-46" />
          </button>
        </form>
      </div>
    </div>
  );
};
