"use client";

import { useQuery } from "react-query";
import { leagueService } from "@/api/services/leagueService";
import { Country, League, Team } from "@/types/api";
import { Spinner } from "@/components/common/Spinner";
import Header from "@/components/common/Header";
import SeasonSelector from "@/components/common/SeasonSelector";
import { Suspense, useState } from "react";
import { Box, Container } from "@mui/material";
import CountryCard from "@/components/card/CountryCard";
import Image from "next/image";
import LeagueCard from "@/components/card/LeagueCard";
import SelectionBreadcrumb from "@/components/common/SelectionBreadcrumb";
import TeamCard from "@/components/card/TeamCard";
import { useRouter } from "next/navigation";

/** 유럽 시즌은 7~8월에 시작하므로 7월 이후면 올해, 그 전이면 작년이 현재 시즌 */
const currentSeason = (() => {
  const now = new Date();
  return now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
})();

export default function Home() {
  const [selectedSeason, setSelectedSeason] = useState(String(currentSeason));
  const [selectedCountry, setSelectedCountry] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const router = useRouter(); // Next.js router 사용

  const { data: countries, isLoading: isLoadingCountries } = useQuery<
    Country[]
  >(["countries", selectedSeason], () =>
    leagueService.getCountries(selectedSeason)
  );

  const { data: leagues, isLoading: isLoadingLeagues } = useQuery<League[]>(
    ["leagues", selectedCountry?.id, selectedSeason],
    () => {
      if (!selectedCountry?.id) return Promise.resolve([]); // countryId가 없으면 빈 배열 반환
      return leagueService.getLeaguesByCountry(
        selectedCountry?.id,
        selectedSeason
      );
    },
    {
      enabled: !!selectedCountry?.id, // countryId가 있을 때만 호출
    }
  );

  const { data: teams, isLoading: isLoadingTeams } = useQuery<Team[]>(
    ["teams", selectedCountry?.id, selectedLeague?.id],
    () => {
      if (!selectedCountry?.id || !selectedLeague?.id) return Promise.resolve([]);
      return leagueService.getTeamsByLeague(
        selectedCountry?.id,
        selectedLeague?.id,
        selectedSeason
      );
    },
    {
      enabled: !!selectedCountry?.id && !!selectedLeague?.id,
      staleTime: 1000 * 60 * 10, // 10분 동안 캐싱 유지
    }
  );


  if (isLoadingCountries || isLoadingLeagues || isLoadingTeams)
    return <Spinner />;
  // if (error) return <div>에러가 발생했습니다</div>;

  const seasons = Array.from({ length: 14 }, (_, i) => (currentSeason - i).toString());

  return (
    <Suspense fallback={<Spinner />}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mt: 4, mb: 4 }}>
          <SeasonSelector
            seasons={seasons}
            selectedSeason={selectedSeason}
            onSeasonChange={setSelectedSeason}
          />
        </Box>
        <Box>
          <SelectionBreadcrumb
            selectedSeason={selectedSeason}
            selectedCountry={selectedCountry}
            selectedLeague={selectedLeague}
            onSeasonClick={() => {
              setSelectedCountry(null);
              setSelectedLeague(null);
            }}
            onCountryClick={() => {
              setSelectedLeague(null);
              // setSelectedCountry({ id: countryId, name: "국가 이름" }); // Replace with actual name
            }}
            onLeagueClick={() => {
              // setSelectedLeague({ id: leagueId, name: "리그 이름" }); // Replace with actual name
            }}
            onReset={() => {
              setSelectedSeason(String(currentSeason));
              setSelectedCountry(null);
              setSelectedLeague(null);
            }}
          />
        </Box>
        {selectedSeason && !selectedCountry?.id && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "16px",
            }}
          >
            {countries?.map((country) => (
              <CountryCard
                key={country.countryId}
                countryName={country.countryName}
                countryFlag={country.countryFlag}
                countryId={country.countryId}
                onCountrySelect={() =>
                  setSelectedCountry({
                    id: country.countryId,
                    name: country.countryName,
                  })
                } // CountryCard 클릭 시 countryId 설정
              />
            ))}
          </Box>
        )}
        {selectedCountry?.id && !selectedLeague?.id && (
          <Box sx={{ mt: 4 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "16px",
              }}
            >
              {leagues?.map((league) => (
                <LeagueCard
                  key={league.leagueId}
                  leagueName={league.leagueName}
                  leagueLogo={league.leagueLogo}
                  leagueId={league.leagueId}
                  onLeagueSelect={() =>
                    setSelectedLeague({
                      id: league.leagueId,
                      name: league.leagueName,
                    })
                  } // LeagueCard 클릭 시 leagueId 설정
                />
              ))}
            </Box>
          </Box>
        )}
        {selectedCountry?.id && selectedLeague?.id && (
          <Box sx={{ mt: 4 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "16px",
              }}
            >
              {teams?.map((team) => (
                <TeamCard
                  key={team.teamId}
                  teamId={team.teamId}
                  teamName={team.teamName}
                  teamLogo={team.teamLogo}
                  onTeamSelect={() => {
                    router.push(
                      `/team/${team.teamId}?season=${selectedSeason}&league=${selectedLeague?.id}&country=${selectedCountry?.id}`
                    )
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
      </Container>
    </Suspense>
  );
}
