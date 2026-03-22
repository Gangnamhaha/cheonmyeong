/* eslint-disable no-console */

const fs = require('fs')
const https = require('https')

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function fileExists(filePath) {
  try {
    fs.accessSync(filePath)
    return true
  } catch {
    return false
  }
}

function requestJson({ method, path, token, body }) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null
    const req = https.request(
      {
        hostname: 'api.vercel.com',
        path,
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(data
            ? {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data),
              }
            : {}),
        },
      },
      (res) => {
        let raw = ''
        res.on('data', (c) => (raw += c))
        res.on('end', () => {
          let parsed = null
          try {
            parsed = raw ? JSON.parse(raw) : null
          } catch {
            parsed = raw
          }
          resolve({ status: res.statusCode ?? 0, body: parsed })
        })
      },
    )

    req.on('error', reject)
    if (data) req.write(data)
    req.end()
  })
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function main() {
  const args = new Set(process.argv.slice(2))
  const skipWait = args.has('--skip-wait')

  const token = process.env.VERCEL_TOKEN
  if (!token) {
    console.error('Missing VERCEL_TOKEN environment variable.')
    process.exit(1)
  }

  // Prefer env vars (CI), fallback to local .vercel/project.json (dev)
  const vercelProjectPath = '.vercel/project.json'
  const projectConfig = fileExists(vercelProjectPath) ? readJson(vercelProjectPath) : null

  const projectId = process.env.VERCEL_PROJECT_ID || projectConfig?.projectId
  const teamId = process.env.VERCEL_TEAM_ID || projectConfig?.orgId
  const projectName = process.env.VERCEL_PROJECT_NAME || projectConfig?.projectName

  if (!projectId || !teamId || !projectName) {
    console.error(
      'Missing Vercel project identifiers. Provide VERCEL_PROJECT_ID, VERCEL_TEAM_ID, VERCEL_PROJECT_NAME as env vars (recommended for CI).',
    )
    process.exit(2)
  }

  // Fetch project link info (repoId + production branch)
  const projectRes = await requestJson({
    method: 'GET',
    path: `/v9/projects/${encodeURIComponent(projectId)}?teamId=${encodeURIComponent(teamId)}`,
    token,
  })
  if (projectRes.status !== 200) {
    console.error('Failed to fetch Vercel project info:', projectRes.status)
    process.exit(2)
  }

  const link = projectRes.body?.link
  const repoId = link?.repoId
  const ref = link?.productionBranch || 'master'
  const type = link?.type
  if (!repoId || !type) {
    console.error('Project is not linked to a Git repository.')
    process.exit(3)
  }

  const createRes = await requestJson({
    method: 'POST',
    path: `/v13/deployments?teamId=${encodeURIComponent(teamId)}`,
    token,
    body: {
      name: projectName,
      project: projectId,
      target: 'production',
      gitSource: {
        type,
        repoId,
        ref,
      },
    },
  })

  if (createRes.status < 200 || createRes.status >= 300) {
    console.error('Failed to create deployment:', createRes.status)
    process.exit(4)
  }

  const deploymentId = createRes.body?.id || createRes.body?.uid
  const deploymentUrl = createRes.body?.url
  const initialState = createRes.body?.readyState || createRes.body?.state || createRes.body?.status
  console.log(JSON.stringify({ deploymentId, deploymentUrl, state: initialState }, null, 2))

  if (skipWait) return

  // Poll until READY
  const started = Date.now()
  const timeoutMs = 10 * 60_000
  while (Date.now() - started < timeoutMs) {
    await sleep(2000)
    const r = await requestJson({
      method: 'GET',
      path: `/v13/deployments/${encodeURIComponent(deploymentId)}?teamId=${encodeURIComponent(teamId)}`,
      token,
    })
    if (r.status !== 200) continue
    const state = r.body?.readyState || r.body?.status || r.body?.state
    if (state === 'ERROR') {
      console.error('Deployment failed.')
      process.exit(5)
    }
    if (state === 'READY') {
      console.log(JSON.stringify({ ready: true, url: r.body?.url ?? deploymentUrl }, null, 2))
      return
    }
  }

  console.error('Timed out waiting for deployment to become READY.')
  process.exit(6)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err))
  process.exit(99)
})
