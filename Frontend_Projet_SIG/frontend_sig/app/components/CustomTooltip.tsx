import React from "react";

export function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: any[];
}) {
  if (active && payload && payload.length) {
    const data = payload[0].payload; // Les données associées à la section survolée
    const totalVotes = payload[0].payload.totalVotes; // Le total global de votes passé dans les données
    const percentage = ((data.votes / totalVotes) * 100).toFixed(2); // Calcul du pourcentage

    return (
      <div
        style={{
          backgroundColor: "white",
          border: "1px solid #ddd",
          borderRadius: "4px",
          padding: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        }}
      >
        <h4 style={{ margin: 0, fontSize: "14px" }}>{data.name}</h4>
        <p style={{ margin: "4px 0", fontSize: "12px" }}>
          <strong>Votes :</strong> {data.votes}
        </p>
        <p style={{ margin: "4px 0", fontSize: "12px" }}>
          <strong>Pourcentage :</strong> {percentage}%
        </p>
      </div>
    );
  }
  return null;
}
