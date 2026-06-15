"use client";

import dynamic from "next/dynamic";

const ReportsMapClient = dynamic(() => import("./ReportsMapClient"), {
  ssr: false,
});

export default ReportsMapClient;