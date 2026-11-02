"use client";

import Header from "@/components/common/Header";
import styled from "styled-components";
import { Providers } from "./providers";
import { useEffect, useRef } from 'react';
import { teamStore } from '@/stores/teamStore';
import { LiveUpdatesBridge } from '@/hooks/useLiveUpdates';

const LayoutContainer = styled.div`
  min-height: auto;
  flex-direction: column;
  max-height: calc(100% - 70px); /* 스크롤 가능한 영역 높이 제한 */
  overflow-y: auto;
  padding-bottom: 0;

  /* 둥근 스크롤바 디자인 */
  &::-webkit-scrollbar {
    width: 10px;
  }
  &::-webkit-scrollbar-track {
    background: transparent; /* 배경 제거 */
  }
  &::-webkit-scrollbar-thumb {
    background-color: #888;
    border-radius: 10px; /* 스크롤바를 둥글게 */
    border: 3px solid transparent;
    background-clip: padding-box; /* 내부 여백 유지 */
  }
  &::-webkit-scrollbar-thumb:hover {
    background-color: #555;
  }
`;

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const layoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (layoutRef.current) {
        teamStore.setIsScrolled(layoutRef.current.scrollTop > 130);
      }
    };

    if (layoutRef.current) {
      layoutRef.current.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (layoutRef.current) {
        layoutRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return (
    <Providers>
      <LiveUpdatesBridge />
      <Header platformName="SNAP-SEARCH" />
      <LayoutContainer ref={layoutRef}>{children}</LayoutContainer>
    </Providers>
  );
}
