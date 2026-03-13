import { Star, Shield, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ReputationBadgeProps {
  score: number;
  reviews: number;
  verified?: boolean;
  size?: "sm" | "md";
}

const ReputationBadge = ({ score, reviews, verified, size = "md" }: ReputationBadgeProps) => {
  const level = score >= 4.5 ? "excellent" : score >= 4.0 ? "très bien" : score >= 3.5 ? "bien" : "nouveau";
  const levelColor = score >= 4.5 ? "bg-primary" : score >= 4.0 ? "bg-trust" : score >= 3.5 ? "bg-secondary" : "bg-muted";

  return (
    <div className={`flex items-center gap-2 ${size === "sm" ? "text-xs" : "text-sm"}`}>
      <div className="flex items-center gap-1 text-golden">
        <Star className={`fill-current ${size === "sm" ? "h-3 w-3" : "h-4 w-4"}`} />
        <span className="font-bold text-foreground">{score.toFixed(1)}</span>
        <span className="text-muted-foreground">({reviews})</span>
      </div>
      <Badge className={`${levelColor} text-primary-foreground capitalize ${size === "sm" ? "text-[10px] px-1.5 py-0" : ""}`}>
        {level}
      </Badge>
      {verified && (
        <Badge className="bg-primary text-primary-foreground gap-1">
          <Shield className={`${size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"}`} />
          Certifié
        </Badge>
      )}
    </div>
  );
};

export default ReputationBadge;
