import { api } from '@/lib/api/api'

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)

  // We rely on axios to set the correct Content-Type with boundary for FormData
  const response = await api.post('/workspaces/upload-logo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  // Backend should return the full Cloudinary result object
  console.log('image url', response.data.secure_url)
  return response.data.secure_url
}
