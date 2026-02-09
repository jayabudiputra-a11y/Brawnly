import { useMutation } from "@tanstack/react-query";
import { subscribersApi } from "@/lib/api";
import { toast } from "sonner";

const _0xlimit = [
    'brawnly_v1_limit', 
    'LIMIT_LOCAL',      
    'Subscriber',       
    'status'            
] as const;

const _l = (i: number) => _0xlimit[i] as any;

export const useSubscribe = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const now = Date.now();
      const _K = _l(0);
      const storage = JSON.parse(localStorage.getItem(_K) || "[]");
      
      const recentAttempts = storage.filter(
        (ts: number) => now - ts < 3600000
      );

      if (recentAttempts.length >= 4) {
        throw new Error(_l(1));
      }

      await subscribersApi.insertIfNotExists(email, _l(2));

      recentAttempts.push(now);
      localStorage.setItem(_K, JSON.stringify(recentAttempts));

      return { [_l(3)]: "success" };
    },
    onSuccess: () => {
      toast.success("Subscription Successful!", {
        description: "Your sequence has been bound to our notification node.",
      });
    },
    onError: (error: any) => {
      if (error.message === _l(1)) {
        toast.warning("Access Restricted", {
          description:
            "Multiple attempts detected. Node locked for 60 minutes for security.",
        });
        return;
      }

      toast.error("Transmission Error", {
        description:
          "The signal could not be processed. Please verify your ID_SEQUENCE.",
      });
    },
  });
};