import os
import faiss
import pickle
import numpy as np
from pypdf import PdfReader
import google.generativeai as genai
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Constants for Persistence
INDEX_PATH = "mentor_ai.index"
DOCSTORE_PATH = "docstore.pkl"

embedder = SentenceTransformer('all-MiniLM-L6-v2') 
EMBEDDING_DIM = 384 

class MentorRAG:
    def __init__(self):
        self.index = None
        self.docstore = [] # Now stores: {"text": ..., "filename": ..., "page": ...}
        self.load_index()

    def load_index(self):
        """Loads index from disk on startup"""
        if os.path.exists(INDEX_PATH) and os.path.exists(DOCSTORE_PATH):
            self.index = faiss.read_index(INDEX_PATH)
            with open(DOCSTORE_PATH, "rb") as f:
                self.docstore = pickle.load(f)
            print("✅ Loaded existing brain from disk.")
        else:
            self.index = faiss.IndexFlatL2(EMBEDDING_DIM)

    def save_index(self):
        """Saves current state to disk"""
        faiss.write_index(self.index, INDEX_PATH)
        with open(DOCSTORE_PATH, "wb") as f:
            pickle.dump(self.docstore, f)

    def ingest_file(self, file_path):
        filename = os.path.basename(file_path)
        reader = PdfReader(file_path)
        new_chunks = []
        new_metadata = []

        # Extract text with Page Numbers
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if not text: continue
            
            # Simple chunking
            words = text.split()
            for j in range(0, len(words), 100):
                chunk_text = " ".join(words[j : j + 110])
                new_chunks.append(chunk_text)
                new_metadata.append({
                    "text": chunk_text,
                    "filename": filename,
                    "page": i + 1
                })

        if not new_chunks: return False

        # Vectorize and Add to FAISS
        vectors = embedder.encode(new_chunks)
        self.index.add(np.array(vectors).astype('float32'))
        self.docstore.extend(new_metadata)
        
        self.save_index() # Persist after upload
        return True

    def get_files(self):
        """Returns unique filenames for the sidebar"""
        return list(set(item["filename"] for item in self.docstore))

    def delete_all(self):
        """Deletes everything to start fresh"""
        self.index = faiss.IndexFlatL2(EMBEDDING_DIM)
        self.docstore = []
        if os.path.exists(INDEX_PATH): os.remove(INDEX_PATH)
        if os.path.exists(DOCSTORE_PATH): os.remove(DOCSTORE_PATH)
        return True

    def ask_gemini(self, query):
        if self.index.ntotal == 0:
            return "Please upload a PDF first!"

        query_vector = embedder.encode([query])
        distances, indices = self.index.search(np.array(query_vector).astype('float32'), k=3)
        
        context = ""
        for idx in indices[0]:
            if idx < len(self.docstore):
                item = self.docstore[idx]
                context += f"[Source: {item['filename']}, Page {item['page']}]: {item['text']}\n...\n"

        prompt = f"""
        You are a supportive AI Tutor. Answer using the context. 
        Cite your sources as (Source: Page X).
        CONTEXT: {context}
        QUESTION: {query}
        """
        model = genai.GenerativeModel('gemini-flash-latest')
        return model.generate_content(prompt).text

# Export a single instance
mentor_rag = MentorRAG()