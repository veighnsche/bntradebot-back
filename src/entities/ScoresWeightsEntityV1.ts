import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

export interface MoveBackSW {
  [maLengthNumber: number]: {
    w: number
    s: number
  }
}

export interface CrossSW {
  w: number
  s: number
}

export interface OscillatorSW {
  [oscilatorNumber: number]: {
    w: number
    s: number
  }
}

export interface CandleStickBullBear {
  bullish: {
    [bullishNumber: number]: {
      w: number
      s: number
    }
  }
  bearish: {
    [bearishNumber: number]: {
      w: number
      s: number
    }
  }
}

export interface CandleStickLevelSW {
  w: number
  s: number
  a: CandleStickBullBear
}

export interface CandleStickData {
  [depthLevelNumber: number]: CandleStickLevelSW
}

export interface TechAnalysis {
  oscillators: {
    w: number
    s: number
    a: OscillatorSW
  }
  candlesticks: {
    w: number
    s: number
    a: CandleStickData
  }
  moveBack: {
    w: number
    s: number
    a: MoveBackSW
  }
  cross: CrossSW
  priceChange: {
    w: number
    s: number
  }
}

export interface IntervalDataSWA {
  w: number
  s: number
  a: {
    tech: {
      w: number
      s: number
      a: TechAnalysis
    }
  }
}

export interface IntervalData {
  [interval: string]: IntervalDataSWA
}

export interface PairData {
  o: number,
  s: number
  a: IntervalData
}

export interface ScoresWeightsEntityV1Model {
  names: {
    oscillators: { [oscilatorName: string]: number }
    candlesticks: {
      bullish: { [bullishName: string]: number }
      bearish: { [bearishName: string]: number }
    }
    moveBack: { [moveBackName: string]: number }
  },
  pairs: {
    [pair: string]: PairData
  }
  symbols: {
    [symbol: string]: {
      news: {
        w: number
        s: number
      }
    }
  }
  market: {
    [market: string]: {
      w: number
      s: number
    }
  }
}

@Entity()
class ScoresWeightsEntityV1 extends BaseEntity {

  @PrimaryGeneratedColumn()
  public id: number

  @Column('simple-json')
  public scoresWeights: ScoresWeightsEntityV1Model

}

export default ScoresWeightsEntityV1