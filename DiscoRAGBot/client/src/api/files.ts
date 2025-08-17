import api from './api';

// Description: Get uploaded files list
// Endpoint: GET /api/files
// Request: {}
// Response: { files: Array<{ _id: string, name: string, size: number, uploadDate: string, status: 'processing' | 'ready' | 'failed', type: string }> }
export const getFiles = async () => {
  try {
    console.log("Fetching files list")
    const response = await api.get('/api/files');
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
}

// Description: Upload a new file
// Endpoint: POST /api/files/upload
// Request: FormData with file
// Response: { success: boolean, message: string, fileId: string }
export const uploadFile = async (formData: FormData) => {
  try {
    console.log("Uploading file")
    console.log("FormData contents:", Array.from(formData.entries()));
    
    const response = await api.post('/api/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000 // 30 second timeout for file uploads
    });
    
    console.log("Upload response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Upload error details:", error);
    console.error("Error response:", error?.response);
    console.error("Error response data:", error?.response?.data);
    
    // Handle specific error cases
    if (error?.response?.status === 413) {
      throw new Error('File too large. Please try a smaller file.');
    }
    
    // If the error response contains HTML (like the 413 error page), extract meaningful message
    if (error.message.includes('Unexpected') && error.response?.data?.includes('413')) {
      throw new Error('File too large. The server cannot process files of this size.');
    }
    
    throw new Error(error?.response?.data?.error || error.message);
  }
}

// Description: Delete a file
// Endpoint: DELETE /api/files/:id
// Request: { id: string }
// Response: { success: boolean, message: string }
export const deleteFile = async (id: string) => {
  try {
    console.log(`Deleting file with id: ${id}`)
    const response = await api.delete(`/api/files/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
}