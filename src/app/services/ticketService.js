import api from './api';

export const ticketService = {
  // Get all tickets (with filters)
  getTickets: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    const response = await api.get(`/tickets?${params.toString()}`);
    return response.data;
  },

  // Get single ticket by ID
  getTicketById: async (id) => {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },

  // Create new ticket
  createTicket: async (ticketData) => {
    const response = await api.post('/tickets', ticketData);
    return response.data;
  },

  // Update ticket
  updateTicket: async (id, updateData) => {
    const response = await api.patch(`/tickets/${id}`, updateData);
    return response.data;
  },

  // Delete ticket
  deleteTicket: async (id) => {
    const response = await api.delete(`/tickets/${id}`);
    return response.data;
  },

  // Get ticket statistics
  getTicketStats: async () => {
    const response = await api.get('/tickets/stats');
    return response.data;
  },

  // Assign ticket to user
  assignTicket: async (ticketId, userId) => {
    const response = await api.patch(`/tickets/${ticketId}/assign`, { assignedTo: userId });
    return response.data;
  },

  // Upload attachment
  uploadAttachment: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};