import React from "react";

const SuggestedStudyPlan: React.FC = () => {
  // Dummy current study plan table data
  const tableData = [
    { date: "2025-10-15", time: "08:00 AM", subject: "Biology - Cell Structure", duration: "2 hrs", endingTime: "10:00 AM" },
    { date: "2025-10-15", time: "10:30 AM", subject: "Chemistry - Organic Basics", duration: "1.5 hrs", endingTime: "12:00 PM" },
    { date: "2025-10-15", time: "01:00 PM", subject: "Math - Algebra Review", duration: "2 hrs", endingTime: "03:00 PM" },
    { date: "2025-10-16", time: "08:00 AM", subject: "Physics - Mechanics", duration: "2 hrs", endingTime: "10:00 AM" },
  ];

  // Dummy suggested study plan table data
  const suggestions = [
    { subject: "Biology - Cell Structure", duration: "2 hrs" },
    { subject: "Chemistry - Organic Basics", duration: "1.5 hrs" },
    { subject: "Math - Algebra Review", duration: "2 hrs" },
  ];

  // Styles
  const tableContainerStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto 30px auto",
    overflowX: "auto",
    border: "1px solid #ccc",
    borderRadius: "8px",
  };

  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed",
  };

  const thStyle: React.CSSProperties = {
    borderBottom: "2px solid #ccc",
    padding: "20px 10px",
    textAlign: "center",
    backgroundColor: "#f3f3f3",
    fontSize: "18px",
  };

  const tdStyle: React.CSSProperties = {
    padding: "20px 10px",
    borderBottom: "1px solid #ccc",
    textAlign: "center",
    fontSize: "16px",
  };

  const hoverStyle: React.CSSProperties = {
    backgroundColor: "white",
    cursor: "default",
  };

  return (
    <div style={{ width: "100%", padding: "20px" }}>
      {/* Current Study Plan Header */}
      <h2 style={{ fontSize: "22px", fontWeight: "600", marginBottom: "15px" }}>
        Current Study Plan
      </h2>

      {/* Full-width current study plan table */}
      <div style={tableContainerStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Time</th>
              <th style={thStyle}>Subject</th>
              <th style={thStyle}>Duration</th>
              <th style={thStyle}>Ending Time</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr
                key={index}
                style={hoverStyle}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f0f0")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
              >
                <td style={tdStyle}>{row.date}</td>
                <td style={tdStyle}>{row.time}</td>
                <td style={tdStyle}>{row.subject}</td>
                <td style={tdStyle}>{row.duration}</td>
                <td style={tdStyle}>{row.endingTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Suggested Study Plan Header */}
      <h2 style={{ fontSize: "22px", fontWeight: "600", margin: "30px 0 15px 0" }}>
        Suggested Study Plan
      </h2>

      {/* Suggested Study Plan table */}
      <div style={tableContainerStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Subject</th>
              <th style={thStyle}>Duration</th>
            </tr>
          </thead>
          <tbody>
            {suggestions.map((s, i) => (
              <tr
                key={i}
                style={hoverStyle}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0f0f0")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
              >
                <td style={tdStyle}>{s.subject}</td>
                <td style={tdStyle}>{s.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuggestedStudyPlan;
