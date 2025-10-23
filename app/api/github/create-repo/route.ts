import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

type CreateRepoRequest = {
  competitionId: string
  competitionTitle: string
  username: string
}

export async function POST(request: Request) {
  try {
    const body: CreateRepoRequest = await request.json()
    const { competitionId, competitionTitle, username } = body

    if (!competitionId || !competitionTitle || !username) {
      return NextResponse.json({ 
        success: false, 
        error: 'Dados obrigatórios não fornecidos' 
      }, { status: 400 })
    }

    // Get GitHub token from environment
    const githubToken = process.env.GITHUB_TOKEN
    
    if (!githubToken) {
      console.error('[v0] GITHUB_TOKEN not configured')
      return NextResponse.json({ 
        success: false, 
        error: 'GitHub token não configurado' 
      }, { status: 500 })
    }

    // Create a clean repo name from competition title
    const cleanTitle = competitionTitle
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50)
    
    const repoName = `skillar-${cleanTitle}-${username}-${competitionId.slice(0, 8)}`

    console.log('[v0] Creating GitHub repository:', repoName)

    // Create repository using GitHub API
    const response = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify({
        name: repoName,
        description: `Projeto para o desafio: ${competitionTitle} - Participante: ${username}`,
        private: false,
        auto_init: true,
        gitignore_template: 'Node', // Can be customized based on competition type
        license_template: 'mit'
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('[v0] GitHub API error:', response.status, errorData)
      
      // Handle specific errors
      if (response.status === 422 && errorData.errors?.some((e: any) => e.message?.includes('already exists'))) {
        return NextResponse.json({ 
          success: false, 
          error: 'Repositório já existe' 
        }, { status: 409 })
      }
      
      return NextResponse.json({ 
        success: false, 
        error: `Erro ao criar repositório: ${errorData.message || 'Erro desconhecido'}` 
      }, { status: response.status })
    }

    const repoData = await response.json()
    
    console.log('[v0] GitHub repository created successfully:', repoData.html_url)

    // Add a README with competition info
    const readmeContent = Buffer.from(`# ${competitionTitle}

## Desafio Skillar

**Participante:** ${username}  
**Competição ID:** ${competitionId}

---

## 📋 Sobre este Repositório

Este repositório foi criado automaticamente pela plataforma **Skillar** para hospedar o seu projeto do desafio "${competitionTitle}".

## 🚀 Como Começar

1. Clone este repositório:
   \`\`\`bash
   git clone ${repoData.clone_url}
   cd ${repoName}
   \`\`\`

2. Desenvolva o seu projeto seguindo os requisitos do desafio

3. Faça commit e push das suas alterações:
   \`\`\`bash
   git add .
   git commit -m "feat: implementar solução"
   git push origin main
   \`\`\`

## 📝 Estrutura Sugerida

\`\`\`
/
├── src/          # Código fonte
├── tests/        # Testes
├── docs/         # Documentação
└── README.md     # Este arquivo
\`\`\`

## ✅ Checklist

- [ ] Ler os requisitos do desafio
- [ ] Planejar a solução
- [ ] Implementar funcionalidades
- [ ] Testar o código
- [ ] Documentar o projeto
- [ ] Submeter para avaliação

---

**Boa sorte! 🎯**

*Gerado automaticamente por [Skillar](https://42skillar.vercel.app)*
`).toString('base64')

    // Create README.md file
    await fetch(`https://api.github.com/repos/${repoData.full_name}/contents/README.md`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify({
        message: 'docs: adicionar README do desafio',
        content: readmeContent
      })
    })

    return NextResponse.json({ 
      success: true, 
      repositoryUrl: repoData.html_url,
      cloneUrl: repoData.clone_url,
      repoName: repoData.name
    })
  } catch (err) {
    console.error('[v0] Create repo error:', err)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno ao criar repositório' 
    }, { status: 500 })
  }
}
