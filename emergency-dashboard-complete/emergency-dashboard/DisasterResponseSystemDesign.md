# Disaster Response Intelligence System Design

## 1. System Architecture

The system follows a modular architecture designed for real-time processing and scalability.

```mermaid
graph TD
    User[User / Victim] -->|Chat Interface| ChatbotUI[Chatbot Client]
    ChatbotUI -->|Raw Text| API[API Gateway]
    API -->|Message Stream| NLP[NLP Preprocessing Pipeline]
    
    subgraph "Intelligence Core (ML)"
        NLP -->|Tokens| Sentiment[Sentiment Analysis Model]
        NLP -->|Features| Classifier[Disaster Classifier]
        NLP -->|NER| NER[Entity Extractor (Location/Resource)]
    end
    
    Sentiment -->|Urgency Score| PriorityEngine[Priority Scoring Engine]
    Classifier -->|Severity Level| PriorityEngine
    NER -->|Loc/Res Data| PriorityEngine
    
    PriorityEngine -->|Scored Event| EventQueue[Event Queue / DB]
    
    EventQueue -->|High Priority| AdminDash[Admin Dashboard]
    EventQueue -->|Critical| AlertSys[Emergency Alert System]
    EventQueue -->|Medium/Low| Monitor[Monitoring Queue]
    
    AdminDash -->|Dispatch| ResouceAlloc[Resource Allocation]
```

### Components
- **Chatbot Interface**: A lightweight React component for collecting unstructured reports.
- **NLP Pipeline**: Cleans text, removes stop words, and tokenizes input.
- **Intelligence Core**:
    - *Sentiment Analysis*: Detects panic/distress (e.g., "Help!", "Scared").
    - *Disaster Classifier*: Identifies event type (Flood, Fire).
    - *NER (Named Entity Recognition)*: Extracts locations ("Main St") and requested resources ("Water", "Boat").
- **Priority Engine**: A weighted algorithm combining severity, emotional urgency, and location risk.
- **Admin Dashboard**: Real-time visualization of incoming high-priority events.

## 2. Model Pipeline Steps

1.  **Input**: "We are trapped on the roof! Water is rising fast near Central Park. Please send a boat!"
2.  **Preprocessing**: Lowercase, tokenization -> `["trapped", "roof", "water", "rising", "fast", "central", "park", "send", "boat"]`.
3.  **Classification**:
    -   *Model*: Transformer-based classifier (e.g., DistilBERT trained on disaster tweets).
    -   *Output*: `Disaster Type: Flood`, `Confidence: 0.98`.
4.  **Sentiment/Urgency Analysis**:
    -   *Model*: Sentiment intensity analyzer (VADER or LSTM).
    -   *Output*: `Emotion: Panic`, `Urgency Score: 0.9` (High).
5.  **Entity Extraction**:
    -   *Model*: spaCy NER.
    -   *Output*: `Location: Central Park`, `Resource: Boat`.
6.  **Severity Assessment**: inferred from keywords ("trapped", "rising fast") -> `Severity: High`.

## 3. Priority Decision Logic

The priority score $P$ (0-100) is calculated as:

$$ P = (W_s \times S) + (W_u \times U) + (W_r \times R) $$

Where:
-   $S$ = Severity Score (0-10) [Low=2, Med=5, High=8, Critical=10]
-   $U$ = Urgency/Sentiment Score (0-10) [Calm=1 ... Panic=10]
-   $R$ = Resource Risk Score (0-10) [Based on availability vs demand]
-   $W$ = Weights (e.g., $W_s=0.5, W_u=0.3, W_r=0.2$)

**Thresholds:**
-   **P > 8.0**: Critical Alert -> Immediate Push Notification to Admin + Auto-dispatch suggestion.
-   **5.0 < P <= 8.0**: High Priority -> Dashboard Highlight.
-   **P <= 5.0**: Standard Queue.

## 4. Technology Stack

-   **Frontend**: React + Vite (Existing Dashboard).
-   **ML Frameworks**:
    -   *Preferred*: TensorFlow.js (for client-side offline capability) or Python (FastAPI + PyTorch/spaCy) for server-side.
    -   *Current Implementation*: Simulation/Mocking for Hackathon Demo, extensible to OpenAI/Gemini API.
-   **NLP**: spaCy (Entities), HuggingFace Transformers (Classification).
-   **State Management**: React Context / Redux.

## 5. Future Scalability Improvements

1.  **Voice-to-Text**: Integrate Whisper model for processing voice notes from panic situations.
2.  **Multimodal Input**: Allow users to upload photos; use CNNs to estimate damage severity from images.
3.  **Federated Learning**: Train models locally on user devices to preserve privacy and improve offline prediction.
4.  **Geo-spatial Clustering**: Use DBSCAN to cluster nearby reports to identify a single large-scale event vs multiple isolated incidents.
