import LazyImageComponent from "@/components/common/LazyImageComponent";
import { isFinishedStatus, isLiveStatus } from "@/api/services/liveService";
import { Match } from "@/types/api";
import { convertUtcToKst } from "@/utils/dateUtils";
import { Box, Card, Typography, useMediaQuery } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ModalComponent from "../common/ModalComponent";

interface Props {
  match: Match;
  currentTeamId: number;
}

export const MatchCard = ({ match, currentTeamId }: Props) => {
  const router = useRouter();
  const isMatchFinished = isFinishedStatus(match.fixtureStatusShort) && match.goalsHome != null;
  const isMatchLive = isLiveStatus(match.fixtureStatusShort);
  const hasScore = isMatchFinished || isMatchLive;
  const isSmallScreen = useMediaQuery("(max-width:670px)");
  const liveClock =
    match.fixtureStatusShort === "HT"
      ? "HT"
      : match.fixtureStatusElapsed != null
        ? `${match.fixtureStatusElapsed}'${match.fixtureStatusExtra ? `+${match.fixtureStatusExtra}` : ""}`
        : "LIVE";

  let winnerTeamId = null;
  if (isMatchFinished) {
    if (match.goalsHome > match.goalsAway) {
      winnerTeamId = match.teamsHomeId;
    } else if (match.goalsAway > match.goalsHome) {
      winnerTeamId = match.teamsAwayId;
    }
  }

  const isDraw = isMatchFinished && match.goalsHome === match.goalsAway;
  const isSelectedTeamWinner = winnerTeamId === currentTeamId;
  const isSelectedTeamLoser =
    isMatchFinished &&
    !isSelectedTeamWinner &&
    !isDraw &&
    (match.teamsHomeId === currentTeamId || match.teamsAwayId === currentTeamId);

  const { date, time } = convertUtcToKst(match.fixtureDate);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleCardClick = () => {
    if (!hasScore) {
      setIsModalOpen(true); // 아직 시작하지 않은 경기만 모달 안내
      return;
    }
    router.push(
      `/team/${currentTeamId}/matches/detail/${match.fixtureId}?season=${match.leagueSeason}&teamId=${currentTeamId}`
    );
  };

  return (
    <>
      <Card
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px",
          cursor: "pointer",
          backgroundColor: isSelectedTeamWinner
            ? "#E3F2FD"
            : isSelectedTeamLoser
              ? "#FFEBEE"
              : isDraw
                ? "#E0E0E0"
                : "white",
          borderLeft: isMatchLive
            ? "6px solid #2E7D32"
            : isSelectedTeamWinner
              ? "6px solid #1976D2"
              : isSelectedTeamLoser
                ? "6px solid #D32F2F"
                : isDraw
                  ? "6px solid #757575"
                  : "6px solid transparent",
          "&:hover": {
            backgroundColor: isSelectedTeamWinner
              ? "#BBDEFB"
              : isSelectedTeamLoser
                ? "#FFCDD2"
                : isDraw
                  ? "#BDBDBD"
                  : "#f5f5f5",
          },
        }}
        onClick={handleCardClick}
      >
        {/* 홈 팀 (왼쪽 정렬) */}
        <Box sx={{ display: "flex", alignItems: "center", width: "35%", justifyContent: "flex-start", gap: 1 }}>
          <LazyImageComponent src={match.teamsHomeLogo} alt={match.teamsHomeName} size={35} />
          {!isSmallScreen && (
            <Typography fontWeight={winnerTeamId === match.teamsHomeId ? "bold" : "normal"} sx={{ fontSize: "16px" }}>
              {match.teamsHomeName}
            </Typography>
          )}
        </Box>

        {/* 경기 정보 (가운데 정렬) */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "30%",
          }}
        >
          {isMatchLive && (
            <Box sx={{ display: "flex", alignItems: "center", gap: "6px", mb: "2px" }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "#2E7D32",
                  animation: "livePulse 1.2s ease-in-out infinite",
                  "@keyframes livePulse": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.3 } },
                }}
              />
              <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#2E7D32", letterSpacing: "0.5px" }}>
                {liveClock}
              </Typography>
            </Box>
          )}
          <Typography
            sx={{
              fontSize: isMatchLive ? "18px" : "16px",
              fontWeight: "bold",
              color: isMatchLive ? "#1B5E20" : isMatchFinished ? (isDraw ? "#616161" : "#D32F2F") : "#333",
            }}
          >
            {hasScore ? `${match.goalsHome ?? 0} - ${match.goalsAway ?? 0}` : "VS"}
          </Typography>

          {!hasScore && (
            <Box sx={{ textAlign: "center" }}>
              <Typography sx={{ fontSize: "13px", color: "#666" }}>{date}</Typography>
              {!isSmallScreen && (
                <Typography sx={{ fontSize: "14px", fontWeight: "bold", color: "#666" }}>{time}</Typography>
              )}
            </Box>
          )}

          <Typography sx={{ fontSize: "12px", color: "#888" }}>{match.leagueRound}</Typography>
        </Box>

        {/* 원정 팀 (오른쪽 정렬) */}
        <Box sx={{ display: "flex", alignItems: "center", width: "35%", justifyContent: "flex-end", gap: 1 }}>
          {!isSmallScreen && (
            <Typography fontWeight={winnerTeamId === match.teamsAwayId ? "bold" : "normal"} sx={{ fontSize: "16px" }}>
              {match.teamsAwayName}
            </Typography>
          )}
          <LazyImageComponent src={match.teamsAwayLogo} alt={match.teamsAwayName} size={35} />
        </Box>
      </Card>
      <ModalComponent
        open={isModalOpen}
        onClose={handleCloseModal}
        title="경기 상세정보 없음"
        content={
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box>아직 시작하지 않은 경기입니다.</Box>
            <Box>킥오프 후 실시간 스코어와 이벤트가 표시됩니다.</Box>
          </Box>
        }
      />
    </>
  );
};
