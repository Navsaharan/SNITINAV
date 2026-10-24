import { describe, expect, it } from '@jest/globals'
import { isAllowedStorageBucket, resolveMediaUrl } from './media-url'

describe('media URL handling', () => {
  it('keeps existing public URLs unchanged', async () => {
    await expect(resolveMediaUrl('https://cdn.example.test/photo.jpg')).resolves.toBe('https://cdn.example.test/photo.jpg')
    await expect(resolveMediaUrl('/images/photo.jpg')).resolves.toBe('/images/photo.jpg')
  })

  it('rejects untrusted storage references instead of exposing them', async () => {
    await expect(resolveMediaUrl('storage://unknown-bucket/uploads/photo.jpg')).resolves.toBe('')
    await expect(resolveMediaUrl('storage://Pics/../secrets.txt')).resolves.toBe('')
    await expect(resolveMediaUrl('storage://Pics//absolute.jpg')).resolves.toBe('')
  })

  it('only allows the application storage buckets', () => {
    expect(isAllowedStorageBucket('faculty-photos')).toBe(true)
    expect(isAllowedStorageBucket('Pics')).toBe(true)
    expect(isAllowedStorageBucket('arbitrary-bucket')).toBe(false)
  })
})
