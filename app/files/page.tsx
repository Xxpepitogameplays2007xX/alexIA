'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Files() {
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    const loadImages = async () => {
      const { data, error } = await supabase.storage
        .from('avatars')
        .list()

      if (error) {
        console.log('ERROR STORAGE:', error)
        return
      }

      console.log('FILES:', data)

      const urls = data
        .filter((file) => file.name && !file.name.includes('.emptyFolderPlaceholder'))
        .map((file) => {
          const { data } = supabase.storage
            .from('avatars')
            .getPublicUrl(file.name)

          return data.publicUrl
        })

      setImages(urls)
      console.log('URLS:', urls)
    }

    loadImages()
  }, [])

  return (
    <div style={{ padding: '20px' }}>
      <h1>Mis archivos 📁</h1>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {images.map((url, i) => (
          <img key={i} src={url} width="200" />
        ))}
      </div>
    </div>
  )
}