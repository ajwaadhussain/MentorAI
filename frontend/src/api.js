import axios from 'axios';

const API_URL = "http://127.0.0.1:8000";

// 1. Upload the PDF to the Backend
export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await axios.post(`${API_URL}/upload`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Upload Error:", error);
        throw error;
    }
};

// 2. Send a Question to the Backend
export const chatWithAI = async (question) => {
    try {
        const response = await axios.post(`${API_URL}/chat`, {
            question: question,
        });
        return response.data.answer; // Returns the text answer from Gemini
    } catch (error) {
        console.error("Chat Error:", error);
        throw error;
    }
};