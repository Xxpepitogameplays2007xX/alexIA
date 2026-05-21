'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Upload() {
  const [file, setFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const handleUpload = async () => {
    if (!file) {
      alert('Selecciona un archivo primero')
      return
    }

    const fileName = Date.now() + '-' + file.name

    const { error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file)

    if (error) {
      alert('Error al subir: ' + error.message)
      return
    }

    // 🔥 Obtener URL pública
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    setImageUrl(data.publicUrl)
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Subir imagen</h1>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <br /><br />

      <button onClick={handleUpload}>
        Subir
      </button>

      <br /><br />

      {imageUrl && (
        <div>
          <h2>Imagen subida:</h2>
          <img src={imageUrl} alt="preview" width="300" />
        </div>
      )}
    </div>
  )
}