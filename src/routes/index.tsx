import { createFileRoute } from "@tanstack/react-router";
import { LineApp } from "@/components/line/app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <LineApp />;
}
