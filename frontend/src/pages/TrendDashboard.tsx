import { useEffect, useState, useRef } from "react";
import { Grid, Container, Typography, Box } from "@mui/material";
import { fetchTrends } from "../api";
import TrendCard from "../components/TrendCard";

const TrendDashboard = () => {
  const [trends, setTrends] = useState([]);
  const scrollRef = useRef(null);
  const isUserScrolling = useRef(false);
  const userScrollTimeout = useRef(null);

  // Load trends from API
  useEffect(() => {
    const loadTrends = async () => {
      const data = await fetchTrends();

      // Remove duplicates based on title
      const uniqueTrends = Array.from(
        new Map(data.map((item) => [item.title, item])).values()
      );

      setTrends(uniqueTrends);
    };

    loadTrends();
  }, []);

  // Smooth Auto-Scrolling Effect (Continuous + Looping)
  useEffect(() => {
    let scrollSpeed = 50; // Adjust scroll speed (1px per frame)
    let animationFrameId;

    const startScrolling = () => {
      if (scrollRef.current && !isUserScrolling.current) {
        // Move scroll position by scrollSpeed per frame
        scrollRef.current.scrollTop += scrollSpeed;

        // Reset to top smoothly when reaching the bottom
        if (
          scrollRef.current.scrollTop >=
          scrollRef.current.scrollHeight - scrollRef.current.clientHeight
        ) {
          // Instantly reset scroll position to top to prevent stopping
          scrollRef.current.scrollTop = 0;
        }
      }

      animationFrameId = requestAnimationFrame(startScrolling);
    };

    // Start auto-scrolling
    animationFrameId = requestAnimationFrame(startScrolling);

    // Pause scrolling when user manually interacts
    const handleUserScroll = () => {
      if (userScrollTimeout.current) {
        clearTimeout(userScrollTimeout.current);
      }
      isUserScrolling.current = true;
      userScrollTimeout.current = setTimeout(() => {
        isUserScrolling.current = false;
      }, 3000); // Resume scrolling after 3 seconds of inactivity
    };

    // Add scroll event listener to detect manual scrolling
    scrollRef.current?.addEventListener("scroll", handleUserScroll);

    return () => {
      cancelAnimationFrame(animationFrameId);
      scrollRef.current?.removeEventListener("scroll", handleUserScroll);
      if (userScrollTimeout.current) clearTimeout(userScrollTimeout.current);
    };
  }, []);

  return (
    <Container
      maxWidth={false}
      sx={{
        height: "90vh",
        width: "80vw",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Title */}
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          color: "#000",
          fontFamily: "Prompt, sans-serif",
          fontWeight: "600",
          animation: "fadeIn 1.5s ease-in-out", // Fade-in effect
        }}
      >
        🚀 ชาวเน็ตกำลังสนใจอะไรกัน
        <br />
        <span
          style={{
            color: "#ff5733",
            fontWeight: "bold",
            fontSize: "1.2em",
          }}
        >
          ในช่วง 24 ชั่วโมงที่ผ่านมา?
        </span>
      </Typography>

      {/* Scrolling Box */}
      <Box
        ref={scrollRef}
        sx={{
          height: "75vh",
          overflowY: "hidden", // Hide scrollbar
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        <Grid
          container
          spacing={3}
          justifyContent="center"
          alignItems="stretch"
        >
          {trends.map((trend, index) => (
            <Grid
              item
              key={`${trend.title}-${index}`}
              xs={12}
              sm={6}
              md={4}
              lg={3}
            >
              <TrendCard {...trend} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default TrendDashboard;
