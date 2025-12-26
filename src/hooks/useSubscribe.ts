import { useMutation } from "@tanstack/react-query";
import { subscribersApi } from "@/lib/api";
import { toast } from "sonner";

const LIMIT_KEY = "fitapp_v1_limit";

export const useSubscribe = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      // 1. Check local rate limit (anti-spam protection)
      const now = Date.now();
      const storage = JSON.parse(localStorage.getItem(LIMIT_KEY) || "[]");
      const recentAttempts = storage.filter(
        (ts: number) => now - ts < 3600000
      );

      if (recentAttempts.length >= 4) {
        throw new Error("LIMIT_LOCAL");
      }

      // 2. Save to database (upsert)
      // Use "Subscriber" as default name since no name input exists yet
      await subscribersApi.insertIfNotExists(email, "Subscriber");

      // 3. Update local limit record
      recentAttempts.push(now);
      localStorage.setItem(LIMIT_KEY, JSON.stringify(recentAttempts));

      return { status: "success" };
    },
    onSuccess: () => {
      // Aligned with passwordless flow: no email confirmation required
      toast.success("Subscription Successful!", {
        description: "Your email has been added to our newsletter list.",
      });
    },
    onError: (error: any) => {
      if (error.message === "LIMIT_LOCAL") {
        toast.warning("Too Many Attempts", {
          description:
            "For security reasons, please try subscribing again in 1 hour.",
        });
        return;
      }

      toast.error("Subscription Failed", {
        description:
          "This email may already be registered or there was a connection issue.",
      });
    },
  });
};
