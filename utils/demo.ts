export const DEMO_STOP_MESSAGE =
  "Autonews 已停止运营，目前仅作为演示：只有首页推荐的头条可以查看缓存的回答。This project has stopped operating. It is a demo now, and only the recommended headlines return cached answers.";

// Demo mode stays on unless DEMO_MODE is explicitly "false", so a deploy can't spend API credits by accident.
export const isDemoMode = () => process.env.DEMO_MODE?.trim().toLowerCase() !== "false";
