"use client";

import type { NextPage } from "next";
import { WeatherDashboard } from "~~/components/Dashboard";

const DashboardPage: NextPage = () => {
  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <WeatherDashboard />
    </div>
  );
};

export default DashboardPage; 