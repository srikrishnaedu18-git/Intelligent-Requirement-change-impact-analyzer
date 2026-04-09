export const formatTimestamp = (timestamp) =>
  new Date(timestamp).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });
