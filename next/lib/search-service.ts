import axios from 'axios'

interface SearchResult {
  url: string
  title: string
  authors: string[]
  abstract: string
  keywords: string[]
  citation: string
  source: string
  doi?: string
}

export class SearchService {
  private static instance: SearchService
  private apiKeys: Record<string, string>

  private constructor() {
    this.apiKeys = {
      ieee: process.env.IEEE_API_KEY || '',
      springer: process.env.SPRINGER_API_KEY || '',
      sciencedirect: process.env.SCIENCEDIRECT_API_KEY || '',
      arxiv: process.env.ARXIV_API_KEY || ''
    }
  }

  public static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService()
    }
    return SearchService.instance
  }

  private async searchIEEE(query: string, dateRange: { start: Date; end: Date }): Promise<SearchResult[]> {
    try {
      const response = await axios.get('https://ieeexploreapi.ieee.org/api/v1/search/articles', {
        params: {
          apikey: this.apiKeys.ieee,
          querytext: query,
          start_year: dateRange.start.getFullYear(),
          end_year: dateRange.end.getFullYear(),
          max_records: 10
        }
      })
      return response.data.articles.map((article: any) => ({
        url: article.html_url,
        title: article.title,
        authors: article.authors.authors.map((a: any) => a.full_name),
        abstract: article.abstract,
        keywords: article.index_terms.ieee_terms.terms,
        citation: article.citation,
        source: 'IEEE Xplore',
        doi: article.doi
      }))
    } catch (error) {
      console.error('IEEE search error:', error)
      return []
    }
  }

  public async searchArxiv(query: string, dateRange: { start: Date; end: Date }): Promise<any[]> {
    try {
      const response = await fetch(`https://export.arxiv.org/api/query?search_query=${encodeURIComponent(query)}&start=0&max_results=10`)
      const text = await response.text()
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(text, 'text/xml')
      
      const entries = xmlDoc.querySelectorAll('entry')
      const results = Array.from(entries).map(entry => {
        const title = entry.querySelector('title')?.textContent || ''
        const summary = entry.querySelector('summary')?.textContent || ''
        const authors = Array.from(entry.querySelectorAll('author name')).map(el => el.textContent || '')
        const published = entry.querySelector('published')?.textContent || ''
        const updated = entry.querySelector('updated')?.textContent || ''
        const pdfLink = entry.querySelector('link[title="pdf"]')?.getAttribute('href') || ''
        const arxivId = entry.querySelector('id')?.textContent?.split('/').pop() || ''

        return {
          arxivId,
          title,
          summary,
          authors,
          published,
          updated,
          pdfLink
        }
      })

      return results
    } catch (error) {
      console.error('Error searching Arxiv:', error)
      throw error
    }
  }

  private async searchGoogleScholar(query: string, dateRange: { start: Date; end: Date }): Promise<SearchResult[]> {
    // Note: Google Scholar doesn't have a public API
    // We'll need to use a scraping service or alternative
    return []
  }

  public async search(
    researchQuestions: string[],
    targetDatabases: string[],
    publicationDateRange: { start: Date; end: Date }
  ): Promise<SearchResult[]> {
    const query = researchQuestions.join(' OR ')
    const results: SearchResult[] = []

    const searchPromises = targetDatabases.map(async (db) => {
      switch (db.toLowerCase()) {
        case 'ieee xplore':
          return this.searchIEEE(query, publicationDateRange)
        case 'arxiv':
          return this.searchArxiv(query, publicationDateRange)
        case 'google scholar':
          return this.searchGoogleScholar(query, publicationDateRange)
        default:
          return []
      }
    })

    const dbResults = await Promise.all(searchPromises)
    return results.concat(...dbResults)
  }

  async getArxivPaper(arxivId: string): Promise<any> {
    try {
      const response = await fetch(`https://export.arxiv.org/api/query?id_list=${arxivId}`)
      const text = await response.text()
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(text, 'text/xml')
      
      const entry = xmlDoc.querySelector('entry')
      if (!entry) {
        throw new Error('No paper found with the given Arxiv ID')
      }

      const title = entry.querySelector('title')?.textContent || ''
      const summary = entry.querySelector('summary')?.textContent || ''
      const authors = Array.from(entry.querySelectorAll('author name')).map(el => el.textContent || '')
      const published = entry.querySelector('published')?.textContent || ''
      const updated = entry.querySelector('updated')?.textContent || ''
      const pdfLink = entry.querySelector('link[title="pdf"]')?.getAttribute('href') || ''

      return {
        arxivId,
        title,
        summary,
        authors,
        published,
        updated,
        pdfLink
      }
    } catch (error) {
      console.error('Error fetching Arxiv paper:', error)
      throw error
    }
  }
} 