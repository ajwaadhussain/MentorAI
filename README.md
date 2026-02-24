Here is the complete content for your README.md file. You can copy and paste this directly into a new file named README.md in your project's root directory.

MentorAI 🧠 | Custom Full-Stack RAG AI Tutor
MentorAI is a Retrieval-Augmented Generation (RAG) application that transforms static PDF documents into interactive, intelligent learning experiences. Built specifically as an AI Tutor, it allows students to upload textbooks or assignments and receive context-aware answers with precise source citations.

Unlike standard AI wrappers, MentorAI uses a custom-built pipeline without high-level frameworks like LangChain, ensuring low latency and total architectural control.

🎯 Purpose
The goal of this project is to bridge the gap between static learning materials and interactive AI. It solves the problem of "AI hallucinations" by grounding every answer in the uploaded document’s text, providing a reliable study assistant for technical and scientific subjects.

🛠️ Tech Stack & Softwares Used
Frontend
React (Vite): Fast, component-based UI development.

Axios: Bridge for communication between Frontend and FastAPI.

React-Markdown & Rehype-Katex: For beautiful rendering of AI responses and LaTeX math formulas.

Lucide-React: Modern, lightweight iconography.

Backend
FastAPI (Python): High-performance asynchronous API framework.

Google Gemini 1.5 Flash: State-of-the-art LLM for rapid reasoning and generation.

FAISS (Facebook AI Similarity Search): High-speed vector database for semantic search.

Sentence-Transformers: Used all-MiniLM-L6-v2 for generating 384-dimensional dense embeddings.

PyPDF2: For robust text extraction from PDF files.

🧠 System Architecture
Ingestion: PDFs are uploaded, extracted, and split into semantic chunks with context-preserving overlaps.

Vectorization: Chunks are converted into vectors and stored in a persistent FAISS index.

Retrieval: When a user asks a question, the system finds the top most relevant chunks using similarity search.

Generation: The context is injected into a custom prompt for Gemini, which generates a supportive, tutored response.

🚀 How to RunPrerequisitesPython 3.9+Node.js & npmGoogle Gemini API Key1. Backend SetupNavigate to the backend folder: cd backendCreate a virtual environment: python -m venv venvActivate venv:Windows: .\venv\Scripts\activateMac/Linux: source venv/bin/activateInstall dependencies: pip install -r requirements.txtCreate a .env file and add: GOOGLE_API_KEY=your_key_hereStart the server: uvicorn main:app --reload2. Frontend SetupNavigate to the frontend folder: cd frontendInstall dependencies: npm installStart the dev server: npm run devOpen http://localhost:5173 in your browser.✨ Key FeaturesGlassmorphism UI: Modern, sleek design with transparent blurred backgrounds.Persistence: AI "remembers" your documents even after a server restart thanks to disk-based indexing.Dynamic Sidebar: Track uploaded files in real-time and reset the knowledge base with one click.LaTeX Support: Perfectly renders mathematical equations ($E=mc^2$) for STEM education.Persona-Driven: Prompt-engineered to act as a supportive mentor, not just a chatbot.
