import { getCredential } from './api-credentials'

const envOrCredential = async (key: string) => process.env[key] || await getCredential(`sanity.${key.toLowerCase()}`)

async function config() {
  const projectId = await envOrCredential('SANITY_PROJECT_ID')
  const dataset = await envOrCredential('SANITY_DATASET')
  const token = await envOrCredential('SANITY_API_TOKEN')
  if (!projectId || !dataset || !token) return null
  return { projectId, dataset, token }
}

const documentId = (pageId: string | undefined, slug: string) => `snitinav-page-${pageId || slug.replace(/[^a-z0-9-]/gi, '-')}`

export async function sanityStatus() {
  const current = await config()
  return { available: Boolean(current), missing: current ? [] : ['SANITY_PROJECT_ID', 'SANITY_DATASET', 'SANITY_API_TOKEN'] }
}

export async function getSanityPage(slug: string) {
  const current = await config()
  if (!current) return null
  const query = encodeURIComponent('*[_type == "snitinavPage" && slug == $slug][0]{title, content, slug}')
  const url = `https://${current.projectId}.api.sanity.io/v2025-01-01/data/query/${current.dataset}?query=${query}&$slug=${encodeURIComponent(JSON.stringify(slug))}`
  const response = await fetch(url, { headers: { Authorization: `Bearer ${current.token}` }, next: { revalidate: 60 } })
  if (!response.ok) throw new Error(`Sanity read failed (${response.status})`)
  return (await response.json()).result || null
}

export async function saveSanityPage(input: { pageId?: string; slug: string; title: string; content: string; publish: boolean }) {
  const current = await config()
  if (!current) throw new Error('Sanity is not configured')
  const id = documentId(input.pageId, input.slug)
  const mutation = { mutations: [{ createOrReplace: { _id: id, _type: 'snitinavPage', title: input.title, slug: input.slug, content: input.content, status: input.publish ? 'published' : 'draft' } }] }
  const response = await fetch(`https://${current.projectId}.api.sanity.io/v2025-01-01/data/mutate/${current.dataset}`, { method: 'POST', headers: { Authorization: `Bearer ${current.token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(mutation) })
  if (!response.ok) throw new Error(`Sanity write failed (${response.status})`)
  return { id, published: input.publish }
}
