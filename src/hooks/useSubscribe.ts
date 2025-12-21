import { useMutation, useQueryClient } from '@tanstack/react-query'
import { subscribersApi } from '@/lib/api'
import { toast } from 'sonner'
import type { Subscriber } from '../types/index'


export const useSubscribe = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      await subscribersApi.insertIfNotExists(email)
    },
    onSuccess: () => {
      toast.success('Successfully subscribed!')
    },
    onError: () => {
      toast.error('Please login first')
    },
  })
}
