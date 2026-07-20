import { Sparkles } from "lucide-react";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export default function AiPage() {
  return (
    <ComingSoon
      icon={Sparkles}
      title="AI"
      description="Dagplanning, wekelijkse review en coach-feedback via Claude — uitgeschakeld totdat er een Anthropic API-budget is vastgesteld (dit kost per gebruik)."
      phase="Later te activeren"
    />
  );
}
