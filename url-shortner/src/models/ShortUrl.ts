import { createHash } from 'crypto'

export const compute_shortCode = (longUrl: URL): string => {

  // Generate MD5 hash of the input URL
  const md5Hash = createHash("sha256").update(longUrl.toString()).digest("hex")

  // Use the first 8 characters of the hash as the short code
  // Take first 8 characters of the hash and append them to a base URL
  const shortCode = md5Hash.slice(0, 8)

  return shortCode
}

export const reverse_shortUrl = (shortUrl: URL): URL => {

  // Extract the MD5 hash from the short URL
  const md5Hash = shortUrl.pathname.substr(1)

  // Reconstruct the full MD5 hash by adding leading zeros if necessary
  const fullMd5Hash = md5Hash.padStart(32, "0")

  // Reconstruct the original URL by decoding the MD5 hash
  const originalUrl = createHash("md5").update(Buffer.from(fullMd5Hash, "hex")).digest("hex")

  return new URL(originalUrl)
}
