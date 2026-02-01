import { DisasterType, Severity, ResourceType } from '../types';

interface MLAnalysisResult {
  disasterType: DisasterType;
  severity: Severity;
  resourceNeeded: ResourceType;
  emotionalUrgency: number; // 0-10
  locationDescription?: string;
  confidence: number;
  // Verification Fields
  trustScore?: number;
  visualVerification?: {
    detectedObjects: string[];
    matchConfidence: number;
    manipulationRisk: 'Low' | 'Medium' | 'High';
  };
}

// Keyword dictionaries
const KEYWORDS: Record<DisasterType, string[]> = {
  [DisasterType.WILDFIRE]: ['fire', 'smoke', 'burn', 'flames', 'forest'],
  [DisasterType.FLOOD]: ['flood', 'water', 'rising', 'drowning', 'rain', 'river'],
  [DisasterType.EARTHQUAKE]: ['quake', 'shake', 'ground', 'collapse', 'rubble'],
  [DisasterType.CHEMICAL_SPILL]: ['gas', 'leak', 'smell', 'chemical', 'fumes', 'toxic'],
  [DisasterType.HURRICANE]: ['storm', 'wind', 'hurricane', 'cyclone'],
  [DisasterType.ACCIDENT]: ['accident', 'crash', 'collision', 'car', 'bus', 'train'],
  [DisasterType.MEDICAL_EMERGENCY]: ['heart attack', 'stroke', 'bleeding', 'unconscious', 'breathing', 'pain'],
  [DisasterType.OTHER]: ['help', 'emergency']
};

const SEVERITY_KEYWORDS: Record<Severity, string[]> = {
  [Severity.CRITICAL]: ['dying', 'death', 'trapped', 'emergency', 'critical', 'blood', 'severe', 'now'],
  [Severity.HIGH]: ['hurt', 'injured', 'fast', 'urgent', 'danger', 'help'],
  [Severity.MEDIUM]: ['stuck', 'worry', 'concerned', 'need'],
  [Severity.LOW]: ['safe', 'ok', 'inform', 'minor'],
};

const RESOURCE_KEYWORDS: Record<ResourceType, string[]> = {
  [ResourceType.AMBULANCE]: ['hurt', 'injured', 'blood', 'hospital', 'doctor', 'medic'],
  [ResourceType.FOOD_SUPPLY]: ['hungry', 'food', 'water', 'drink', 'starving'],
  [ResourceType.RESCUE_UNIT]: ['trapped', 'stuck', 'boat', 'helicopter', 'rescue'],
  [ResourceType.MEDICAL_TEAM]: ['sickness', 'disease', 'many injured', 'outbreak'],
};

export class ChatbotService {
  private static instance: ChatbotService;

  private constructor() {}

  public static getInstance(): ChatbotService {
    if (!ChatbotService.instance) {
      ChatbotService.instance = new ChatbotService();
    }
    return ChatbotService.instance;
  }

  public async processMessage(message: string, image?: File): Promise<{ text: string; analysis?: MLAnalysisResult }> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
      return { text: "Hello. I am the Disaster Response AI. Please describe your emergency or upload a photo so I can verify and alert the nearest units." };
    }

    if (lowerMsg.length < 5 && !image) {
      return { text: "Please provide more details about the situation or a photo proof." };
    }

    const analysis = this.analyzeText(lowerMsg);

    if (image) {
        const visualResult = this.simulateComputerVision(analysis.disasterType);
        analysis.visualVerification = visualResult;
        
        let score = analysis.confidence * 40; 
        
        if (visualResult.matchConfidence > 0.8) score += 40;
        else if (visualResult.matchConfidence > 0.5) score += 20;
        
        // Use string comparison safely
        const risk = visualResult.manipulationRisk;
        if (risk === 'High') score -= 50;
        else if (risk === 'Medium') score -= 20;

        analysis.trustScore = Math.min(Math.max(score, 0), 100);
    }

    let responseText = '';
    
    if (analysis.trustScore !== undefined) {
        if (analysis.trustScore >= 80) {
            responseText = `✅ **VERIFIED CRITICAL INCIDENT** (Trust Score: ${analysis.trustScore.toFixed(0)})\n\nVisual analysis confirms ${analysis.visualVerification?.detectedObjects.join(', ')}. \n\n🚀 dispatching ${analysis.resourceNeeded} IMMEDIATELY to your GPS location. stay safe!`;
        } else if (analysis.trustScore >= 50) {
            responseText = `⚠️ **Review Needed** (Trust Score: ${analysis.trustScore.toFixed(0)})\n\nWe received your report of ${analysis.disasterType}, but visual match is partial. A human operator is reviewing this now.`;
        } else {
            responseText = `❌ **Verification Failed** (Trust Score: ${analysis.trustScore.toFixed(0)})\n\nOur system detected high manipulation risk or inconsistency. Please upload a clearer photo.`;
        }
    } else {
        responseText = `I have logged a potential ${analysis.disasterType} situation (${analysis.severity} Priority). \n\n📸 **Verification Request**: Please upload a photo to expedite emergency dispatch.`;
    }

    return {
      text: responseText,
      analysis: analysis
    };
  }

  private simulateComputerVision(expectedType: DisasterType): MLAnalysisResult['visualVerification'] {
      let objects: string[] = [];
      const rand = Math.random();
      
      switch (expectedType) {
          case DisasterType.WILDFIRE: objects = ['Fire', 'Smoke', 'Trees']; break;
          case DisasterType.FLOOD: objects = ['Water', 'Submerged Car', 'Flooded House']; break;
          case DisasterType.EARTHQUAKE: objects = ['Rubble', 'Cracked Wall', 'Debris']; break;
          case DisasterType.ACCIDENT: objects = ['Crashed Vehicle', 'Glass', 'Road']; break;
          case DisasterType.MEDICAL_EMERGENCY: objects = ['Person', 'Injury', 'Blood']; break;
          default: objects = ['Unidentified Object']; break;
      }

      // Randomize risk for simulation variety (mostly low risk)
      let risk: 'Low' | 'Medium' | 'High' = 'Low';
      if (rand > 0.9) risk = 'High';
      else if (rand > 0.8) risk = 'Medium';

       // Actually return valid Verification object (implicit type match via return type annotation)
      return {
          detectedObjects: objects,
          matchConfidence: 0.85 + (Math.random() * 0.1),
          manipulationRisk: risk
      } as any;
  }

  private analyzeText(text: string): MLAnalysisResult {
    let bestDisaster: DisasterType = DisasterType.OTHER;
    let maxDisasterScore = 0;

    (Object.entries(KEYWORDS) as [DisasterType, string[]][]).forEach(([type, words]) => {
      let score = 0;
      words.forEach(w => { if (text.includes(w)) score++; });
      if (score > maxDisasterScore) {
        maxDisasterScore = score;
        bestDisaster = type;
      }
    });

    let severity: Severity = Severity.LOW;
    let maxSevScore = 0;
    (Object.entries(SEVERITY_KEYWORDS) as [Severity, string[]][]).forEach(([sev, words]) => {
        let score = 0;
        words.forEach(w => { if (text.includes(w)) score += 2; });
        if (score > maxSevScore) {
            maxSevScore = score;
            severity = sev;
        }
    });
    
    // Explicit type check to avoid overlap errors by casting or ensuring valid enum comparison
    if (maxSevScore === 0) {
        if (bestDisaster === DisasterType.EARTHQUAKE || bestDisaster === DisasterType.WILDFIRE) severity = Severity.HIGH;
    }

    let resource = ResourceType.RESCUE_UNIT; 
    let maxResScore = 0;
    (Object.entries(RESOURCE_KEYWORDS) as [ResourceType, string[]][]).forEach(([res, words]) => {
        let score = 0;
        words.forEach(w => { if (text.includes(w)) score++; });
        if (score > maxResScore) {
            maxResScore = score;
            resource = res;
        }
    });

    let urgency = 0;
    if (text.includes('!')) urgency += 2;
    if (text.includes('!!')) urgency += 3;
    if (severity === Severity.CRITICAL) urgency += 5;
    if (severity === Severity.HIGH) urgency += 3;
    urgency = Math.min(urgency, 10);

    return {
      disasterType: bestDisaster,
      severity: severity,
      resourceNeeded: resource,
      emotionalUrgency: urgency,
      confidence: 0.85 + (Math.random() * 0.1) 
    };
  }
}

export const chatbotService = ChatbotService.getInstance();
