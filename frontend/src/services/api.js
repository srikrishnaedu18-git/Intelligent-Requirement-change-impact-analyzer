const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const withQuery = (path, params = {}) => {
  const url = new URL(`${API_BASE_URL}${path}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
};

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

export const getProjects = async () => {
  const response = await fetch(`${API_BASE_URL}/projects`);
  return handleResponse(response);
};

export const createProject = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
};

export const getRequirements = async (projectId) => {
  const response = await fetch(withQuery("/requirements", { projectId }));
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

export const getTraceabilityLinks = async (projectId) => {
  const response = await fetch(withQuery("/traceability-links", { projectId }));
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

export const analyzeImpact = async (requirementId, projectId) => {
  const response = await fetch(
    withQuery(`/change-requests/analyze-impact/${requirementId}`, { projectId })
  );
  return handleResponse(response);
};

export const getChangeRequests = async (projectId) => {
  const response = await fetch(withQuery("/change-requests", { projectId }));
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

export const getAuditLogs = async (projectId) => {
  const response = await fetch(withQuery("/audit-logs", { projectId }));
  return handleResponse(response);
};
