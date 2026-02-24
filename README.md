# MentorAI 🧠 | Precision RAG Engine & Educational Interface

**MentorAI** is an advanced Retrieval-Augmented Generation (RAG) system engineered to solve the "context-gap" in educational AI. By prioritizing architectural control over high-level abstractions, this project implements a custom pipeline for high-fidelity document retrieval and pedagogical generation.

---

## 🤖 The AI Engineering Perspective

Unlike standard implementations that rely on generic wrappers, MentorAI is built with a focus on the underlying mechanics of Information Retrieval (IR).

### 1. Custom RAG Pipeline (No LangChain)
I intentionally bypassed high-level frameworks to minimize abstraction overhead and optimize latency. 
* **Semantic Vectorization**: Utilizes `all-MiniLM-L6-v2` to map document chunks into a 384-dimensional hyperspace.
* **FAISS Integration**: Employs an `IndexFlatL2` Euclidean distance metric for highly efficient exhaustive search.
* **Contextual Persistence**: Implemented a serialized metadata store (Pickle) to map vector results back to specific PDF coordinates (Page/Filename).

### 2. Generative Logic & Prompt Engineering
* **Model Selection**: Powered by **Gemini 1.5 Flash** for its superior context window and reasoning speed.
* **System Prompting**: Engineered a "Supportive Tutor" persona that enforces grounded truth. The model is constrained to only answer based on retrieved context, effectively eliminating hallucinations.

[Image of a RAG system architecture showing the flow from PDF text to chunks, embeddings, and vector database storage]

---

## 🎨 Design & UX Architecture

AI tools often fail due to poor usability. MentorAI bridges the gap between complex backend logic and a seamless student experience.

### 1. Modern Glassmorphism UI
* **Visual Hierarchy**: A sleek, dark-themed interface using blurred backdrops and high-contrast typography to reduce cognitive load.
* **Responsive Sidebar**: A real-time state manager that tracks the AI's current "Knowledge Base" (uploaded documents).

### 2. STEM-First Rendering
* **Mathematical Precision**: Integrated `React-Markdown` with `rehype-katex` to ensure that complex equations ($E=mc^2$) render with textbook clarity.
* **Thinking State**: Custom CSS animations provide immediate visual feedback during token generation, improving perceived latency.

---

## 📂 System File Structure
```text
MentorAI/
├── backend/
│   ├── main.py          # FastAPI Orchestration & API Gateways
│   ├── rag.py           # Vector Indexing, Search, & LLM Logic
│   ├── mentor_ai.index  # Persistent Vector Database
│   └── docstore.pkl     # Metadata & Text Persistence
└── frontend/
    ├── src/
    │   ├── App.jsx      # State Machine & UI Logic
    │   └── App.css      # Glassmorphism Design System
