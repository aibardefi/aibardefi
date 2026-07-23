import { MOCK_POSITIONS } from "@/lib/sb/constants";
import PositionDetail from "./PositionDetail";

export function generateStaticParams() {
  return MOCK_POSITIONS.map((p) => ({ id: String(p.id) }));
}

export default function PositionPage() {
  return <PositionDetail />;
}
