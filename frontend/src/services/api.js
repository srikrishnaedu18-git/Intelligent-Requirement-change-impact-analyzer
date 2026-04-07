const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = "Something went wrong while contacting the server.";

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }

    throw new Error(errorMessage);
  }

  return response.json();
};

export const getRequirements = async () => {
  const response = await fetch(`${API_BASE_URL}/requirements`);
  return handleResponse(response);
};

export const createRequirement = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/requirements`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
};

export const updateRequirement = async (id, payload) => {
  const response = await fetch(`${API_BASE_URL}/requirements/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
};

export const deleteRequirement = async (id) => {
  const response = await fetch(`${API_BASE_URL}/requirements/${id}`, {
    method: "DELETE"
  });

  return handleResponse(response);
};

export const getTraceabilityLinks = async () => {
  const response = await fetch(`${API_BASE_URL}/traceability-links`);
  return handleResponse(response);
};

export const createTraceabilityLink = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/traceability-links`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
};

export const updateTraceabilityLink = async (id, payload) => {
  const response = await fetch(`${API_BASE_URL}/traceability-links/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
};

export const deleteTraceabilityLink = async (id) => {
  const response = await fetch(`${API_BASE_URL}/traceability-links/${id}`, {
    method: "DELETE"
  });

  return handleResponse(response);
};

export const analyzeImpact = async (requirementId) => {
  const response = await fetch(
    `${API_BASE_URL}/change-requests/analyze-impact/${requirementId}`
  );
  return handleResponse(response);
};

export const getChangeRequests = async () => {
  const response = await fetch(`${API_BASE_URL}/change-requests`);
  return handleResponse(response);
};

export const createChangeRequest = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/change-requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
};

export const updateChangeRequest = async (id, payload) => {
  const response = await fetch(`${API_BASE_URL}/change-requests/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
};

export const deleteChangeRequest = async (id) => {
  const response = await fetch(`${API_BASE_URL}/change-requests/${id}`, {
    method: "DELETE"
  });

  return handleResponse(response);
};

export const getAuditLogs = async () => {
  const response = await fetch(`${API_BASE_URL}/audit-logs`);
  return handleResponse(response);
};
