import os
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
# Import the specific instance from rag.py
from rag import mentor_rag

app = FastAPI()

# --- CORS ---
# Ensures your React frontend (port 5173) can communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATA MODELS ---
class ChatRequest(BaseModel):
    question: str

# --- 1. UPLOAD ENDPOINT ---
@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """Saves PDF locally and triggers the RAG ingestion pipeline"""
    try:
        os.makedirs("temp_files", exist_ok=True)
        file_path = f"temp_files/{file.filename}"

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Trigger Ingestion with Metadata tracking
        success = mentor_rag.ingest_file(file_path)
        
        if success:
            return {"status": "success", "filename": file.filename}
        else:
            return {"status": "error", "message": "Failed to read PDF content"}

    except Exception as e:
        print(f"Upload Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- 2. CHAT ENDPOINT ---
@app.post("/chat")
async def chat_with_ai(request: ChatRequest):
    """Retrieves context from FAISS and generates an answer via Gemini"""
    try:
        # Get response from the RAG instance
        answer = mentor_rag.ask_gemini(request.question)
        return {"answer": answer}
    except Exception as e:
        print(f"Chat Error: {e}")
        raise HTTPException(status_code=500, detail="AI generation failed")

# --- 3. SIDEBAR: LIST FILES ---
@app.get("/files")
async def list_files():
    """Returns a unique list of uploaded filenames for the React sidebar"""
    try:
        files = mentor_rag.get_files()
        return {"files": files}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not retrieve file list")

# --- 4. SIDEBAR: DELETE ALL ---
@app.delete("/files")
async def delete_all_files():
    """Wipes the FAISS index and docstore from memory and disk"""
    try:
        mentor_rag.delete_all()
        return {"message": "All documents cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to clear data")

@app.get("/")
def read_root():
    return {"message": "MentorAI Brain is Active 🧠"}