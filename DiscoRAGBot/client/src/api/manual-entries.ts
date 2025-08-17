import api from './api';

// Description: Get manual entries list
// Endpoint: GET /api/manual-entries
// Request: {}
// Response: { entries: Array<{ _id: string, title: string, content: string, category: string, tags: string[], createdDate: string, updatedDate: string }> }
export const getManualEntries = async () => {
  console.log("Fetching manual entries list")
  try {
    const response = await api.get('/api/manual-entries');
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
}

// Description: Create a new manual entry
// Endpoint: POST /api/manual-entries
// Request: { title: string, content: string, category: string, tags: string[] }
// Response: { success: boolean, message: string, entryId: string }
export const createManualEntry = async (data: { title: string; content: string; category: string; tags: string[] }) => {
  console.log("Creating manual entry:", data.title)
  try {
    const response = await api.post('/api/manual-entries', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
}

// Description: Update a manual entry
// Endpoint: PUT /api/manual-entries/:id
// Request: { id: string, title: string, content: string, category: string, tags: string[] }
// Response: { success: boolean, message: string }
export const updateManualEntry = async (id: string, data: { title: string; content: string; category: string; tags: string[] }) => {
  console.log(`Updating manual entry with id: ${id}`)
  try {
    const response = await api.put(`/api/manual-entries/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
}

// Description: Delete a manual entry
// Endpoint: DELETE /api/manual-entries/:id
// Request: { id: string }
// Response: { success: boolean, message: string }
export const deleteManualEntry = async (id: string) => {
  console.log(`Deleting manual entry with id: ${id}`)
  try {
    const response = await api.delete(`/api/manual-entries/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
}