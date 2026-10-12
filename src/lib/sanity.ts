import { getCredential } from './api-credentials'

const envOrCredential = async (key: string) => {
  const value = process.env[key] || await getCredential(`sanity.${key.toLowerCase()}`)
  return value?.trim() || ''
}

async function config() {
  const projectId = await envOrCredential('SANITY_PROJECT_ID')
  const dataset = await envOrCredential('SANITY_DATASET')
  const token = await envOrCredential('SANITY_API_TOKEN')
  if (!projectId || !dataset || !token) return null
  return { projectId, dataset, token }
}

const documentId = (pageId: string | undefined, slug: string) =>
  `snitinav-page-${pageId || slug.replace(/[^a-z0-9-]/gi, '-')}`
const draftId = (id: string) => `drafts.${id}`
const headers = (token: string) => ({ Authorization: `Bearer ${token}` })

async function mutate(current: NonNullable<Awaited<ReturnType<typeof config>>>, mutations: unknown[]) {
  const response = await fetch(
    `https://${current.projectId}.api.sanity.io/v2025-01-01/data/mutate/${current.dataset}`,
    {
      method: 'POST',
      headers: { ...headers(current.token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ mutations }),
      cache: 'no-store',
    },
  )
  if (!response.ok) throw new Error(`Sanity write failed (${response.status})`)
  return response.json()
}

export async function sanityStatus() {
  const current = await config()
  return { available: Boolean(current), missing: current ? [] : ['SANITY_PROJECT_ID', 'SANITY_DATASET', 'SANITY_API_TOKEN'] }
}

export async function getSanityPage(slug: string, options: { includeDraft?: boolean } = {}) {
  const current = await config()
  if (!current) return null
  const filter = options.includeDraft
    ? '*[_type == "snitinavPage" && slug == $slug] | order(_id match "drafts.**" desc)[0]'
    : '*[_type == "snitinavPage" && slug == $slug && !(_id in path("drafts.**")) && status == "published"][0]'
  const query = encodeURIComponent(`${filter}{_id, title, content, slug, status}`)
  const url = `https://${current.projectId}.api.sanity.io/v2025-01-01/data/query/${current.dataset}?query=${query}&$slug=${encodeURIComponent(JSON.stringify(slug))}`
  const response = await fetch(url, { headers: headers(current.token), cache: 'no-store' })
  if (!response.ok) throw new Error(`Sanity read failed (${response.status})`)
  return (await response.json()).result || null
}

export async function saveSanityPage(input: { pageId?: string; slug: string; title: string; content: string; publish: boolean }) {
  const current = await config()
  if (!current) throw new Error('Sanity is not configured')
  const id = documentId(input.pageId, input.slug)
  const targetId = input.publish ? id : draftId(id)
  const document = { _id: targetId, _type: 'snitinavPage', title: input.title, slug: input.slug, content: input.content, status: input.publish ? 'published' : 'draft' }
  const mutations: unknown[] = [{ createOrReplace: document }]
  if (input.publish) mutations.push({ delete: { id: draftId(id) } })
  await mutate(current, mutations)
  return { id, published: input.publish, draftId: input.publish ? null : draftId(id) }
}

export async function unpublishSanityPage(input: { pageId?: string; slug: string }) {
  const current = await config()
  if (!current) throw new Error('Sanity is not configured')
  const id = documentId(input.pageId, input.slug)
  const published = await getSanityPage(input.slug)
  const mutations: unknown[] = []
  if (published) {
    mutations.push({ createOrReplace: { ...published, _id: draftId(id), status: 'draft' } })
    mutations.push({ delete: { id } })
  }
  if (mutations.length) await mutate(current, mutations)
  return { id, published: false }
}

export async function deleteSanityPage(input: { pageId?: string; slug: string }) {
  const current = await config()
  if (!current) throw new Error('Sanity is not configured')
  const id = documentId(input.pageId, input.slug)
  await mutate(current, [{ delete: { id } }, { delete: { id: draftId(id) } }])
  return { id, deleted: true }
}
