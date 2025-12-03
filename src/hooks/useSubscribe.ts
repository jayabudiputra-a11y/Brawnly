// src/hooks/useSubscribe.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { subscribersApi } from '../lib/api'
import { toast } from 'sonner'
import type { Subscriber } from '../types'

export const useSubscribe = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Subscriber) => subscribersApi.subscribe(data),
    onSuccess: () => {
      toast.success('Successfully subscribed!')
      queryClient.invalidateQueries({ queryKey: ['subscribers'] })
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.info('You\'re already subscribed!')
      } else {
        toast.error('Something went wrong. Please try again.')
      }
    },
  })
}