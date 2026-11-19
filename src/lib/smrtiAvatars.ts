export type SmrtiPose =
  | "default"
  | "greeting"
  | "thinking"
  | "explaining"
  | "success"
  | "listening";

export const SMRTI_AVATARS: Record<SmrtiPose, string> = {
  default: "/images/assistant/smrti-default.png",
  greeting: "/images/assistant/smrti-greeting.png",
  thinking: "/images/assistant/smrti-thinking.png",
  explaining: "/images/assistant/smrti-explaining.png",
  success: "/images/assistant/smrti-success.png",
  listening: "/images/assistant/smrti-listening.png",
};

export function smrtiPoseFromMood(mood?: string): SmrtiPose {
  switch ((mood || "").toLowerCase()) {
    case "welcome":
      return "greeting";
    case "focus":
      return "explaining";
    case "celebrate":
      return "success";
    case "encourage":
    default:
      return "default";
  }
}
