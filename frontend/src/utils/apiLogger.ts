const API_URL = "http://127.0.0.1:8000";

export const createSession = async () => {
  try {
    const res = await fetch(`${API_URL}/sessions/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });
    if (!res.ok) throw new Error("Backend connection failed");
    const data = await res.json();
    return data.id; // Returns the DB primary key for the new session
  } catch(err) {
    console.error("FastAPI Backend Offline:", err);
    return null;
  }
};

export const logTelemetryEvent = async (sessionId: number, type: string) => {
  try {
    const res = await fetch(`${API_URL}/events/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        event_type: type,
        latitude: 34.050,
        longitude: -118.243
      })
    });
    if (res.ok) {
       console.log(`[API SUCCESS] Logged ${type} to FastAPI Database!`);
    }
  } catch(err) {
    console.error("Failed to reach FastAPI Backend:", err);
  }
};
