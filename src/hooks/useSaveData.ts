import { useState, useEffect } from 'react'
import type { SaveDataPreference } from '../types'

export const useSaveData = () => {
  const [saveData, setSaveData] = useState<SaveDataPreference>(() => {
    const saved = localStorage.getItem('saveDataPreference')
    return saved
      ? JSON.parse(saved)
      : { enabled: false, quality: 'high' as const }
  })

  useEffect(() => {
    // Check for Save-Data header support
    const connection = (navigator as any).connection
    const saveDataFromBrowser = connection?.saveData || false

    if (saveDataFromBrowser && !saveData.enabled) {
      setSaveData({ enabled: true, quality: 'low' })
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('saveDataPreference', JSON.stringify(saveData))
  }, [saveData])

  const toggleSaveData = () => {
    setSaveData((prev) => ({
      ...prev,
      enabled: !prev.enabled,
      quality: !prev.enabled ? 'low' : 'high',
    }))
  }

  const setQuality = (quality: 'low' | 'medium' | 'high') => {
    setSaveData((prev) => ({ ...prev, quality }))
  }

  return {
    saveData,
    toggleSaveData,
    setQuality,
    isEnabled: saveData.enabled,
  }
}