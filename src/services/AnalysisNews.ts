import * as request from 'superagent'
import { CryptoPanicLink } from '../constants'
import { Response } from 'superagent'
import Scoring, { PostAnalysisResult } from './NewsAnalysis/Scoring'

interface AnalysisNewsInput {
  symbols: string[]
}

interface CryptoPanicPost {
  kind: string;
  domain: string;
  created_at: string;
  votes: { important: number; toxic: number; negative: number; saved: number; lol: number; positive: number; disliked: number; liked: number };
  source: { path: null; domain: string; title: string; region: string };
  id: number;
  title: string;
  published_at: string;
  slug: string;
  url: string;
  currencies: { code: string; title: string; slug: string; url: string }[]
}

interface SymbolAnalysisTotals {
  weightedVotes: PostAnalysisResult[],
  ages: number[]
  postWeightsTotal: number,
  votesTotal: number,
  agesTotal: number
}

interface IAnalysisNews {
  symbolAnalysis: { [symbol: string]: number }
  run(): Promise<void>
}

class AnalysisNews implements IAnalysisNews{

  private readonly symbols: string[] = []

  private readonly pages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  private readonly cryptoPanicApi = (symbols: string[], page: number): Promise<CryptoPanicPost[]> => request.get(CryptoPanicLink(symbols, page))
  .then((response: Response): CryptoPanicPost[] => response.body.results)
  .catch(error => {
    console.error(`CryptoPanic offline: ${error.toString()}`)
    return [] as CryptoPanicPost[]
  })

  private symbolAnalysisTotals: { [symbol: string]: SymbolAnalysisTotals } = {}
  public symbolAnalysis: { [symbol: string]: number }

  constructor({ symbols }: AnalysisNewsInput) {
    this.symbols = symbols
    this.symbolAnalysisTotals = symbols.reduce((acc, symbol) => {
      acc[symbol] = {
        weightedVotes: [],
        ages: [],
        postWeightsTotal: 0,
        votesTotal: 0,
        agesTotal: 0
      }
      return acc
    }, {})

    this.symbolAnalysis = symbols.reduce((acc, symbol) => {
      acc[symbol] = 0
      return acc
    }, {})
  }

  public run() {
    return Promise.all(this.pages.map((page: number) => {
      return new Promise(resolve => setTimeout(() => {
        resolve(this.cryptoPanicApi(this.symbols, page)
        .then((posts: CryptoPanicPost[]) => {
          posts.forEach(post => {
            post.currencies.forEach(({ code: symbol }) => {
              if (this.symbols.includes(symbol)) {
                const postScore: PostAnalysisResult = Scoring(post.votes)
                const age = Date.now() - Date.parse(post.published_at)
                this.symbolAnalysisTotals[symbol].weightedVotes.push(postScore)
                this.symbolAnalysisTotals[symbol].ages.push(age)
                this.symbolAnalysisTotals[symbol].postWeightsTotal += postScore._postWeight
                this.symbolAnalysisTotals[symbol].votesTotal += postScore._totalVotes
                this.symbolAnalysisTotals[symbol].agesTotal += age
              }
            })
          })
        }))
      }, Math.floor((page - 1) / 5) * 1000))
    }))
    .then(() => {
      this.symbols.forEach(symbol => {
        this.symbolAnalysisTotals[symbol].weightedVotes.forEach((value, idx, src) => {
          const score = {
            post: value._score * value._postWeight / this.symbolAnalysisTotals[symbol].postWeightsTotal,
            vote: value._score * value._totalVotes / this.symbolAnalysisTotals[symbol].votesTotal,
            ages: value._score * (this.symbolAnalysisTotals[symbol].agesTotal - this.symbolAnalysisTotals[symbol].ages[idx]) / this.symbolAnalysisTotals[symbol].agesTotal
          }
          this.symbolAnalysis[symbol] += (score.post + score.vote + score.ages) / src.length
        })
      })
    })
  }
}

export default AnalysisNews