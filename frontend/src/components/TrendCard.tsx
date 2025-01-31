import { Card, CardContent, Typography } from "@mui/material";

const TrendCard = ({ title, traffic, image, isBreaking }) => {
  return (
    <Card
      sx={{
        border: isBreaking ? "2px solid red" : "1px solid #ddd", // 🔥 Subtle border for all cards
        boxShadow: isBreaking
          ? "0 4px 10px rgba(255, 0, 0, 0.3)"
          : "0 2px 5px rgba(0, 0, 0, 0.1)", // 🔥 Light shadow for all cards
        borderRadius: "12px",
        transition: "transform 0.2s ease-in-out",
        "&:hover": {
          transform: "scale(1.05)",
          boxShadow: "0 6px 15px rgba(0, 0, 0, 0.2)",
        },
      }}
    >
      {image && <img src={image} alt={title} width="100%" height="auto" />}
      <CardContent>
        <Typography
          className="trend-title"
          sx={{ fontWeight: 600, fontFamily: "Prompt, sans-serif" }}
        >
          {title}
        </Typography>
        <Typography
          className="trend-searches"
          sx={{ color: "#FF5722", fontWeight: 500 }}
        >
          🔥 {traffic} searches
        </Typography>
        {isBreaking && (
          <Typography sx={{ color: "red", fontWeight: 700 }}>
            🚨 Breaking News
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default TrendCard;
