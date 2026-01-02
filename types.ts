
export type DataSet = number[][];
export type History = DataSet[];

export interface Candidate {
    sequence: number[]; 
    confidence: number; 
}

export interface SpecificPrediction {
    value: string;
    confidence: number;
}

export interface AdvancedPredictions {
    hundreds: SpecificPrediction[];
    tens: SpecificPrediction[];
    eliteTens: SpecificPrediction[]; 
    superTens: SpecificPrediction[]; 
}

export interface HitRecord {
    id: string;
    type: 'Milhar' | 'Centena' | 'Dezena';
    status: 'Acerto' | 'Quase Acerto';
    value: string;
    position: number; // Rank de 1 a 5
    timestamp: number;
}

export interface RectificationRecord {
    id: string;
    type: 'Milhar' | 'Centena' | 'Dezena';
    generated: string;
    actual: string;
    rankLabel: string;
    timestamp: number;
}

export interface AppSettings {
    entropy: number; 
    voiceEnabled: boolean;
}

export interface AnalysisResult {
    rowSums: number[];
    rowEvenOdd: { evens: number; odds: number }[];
    rowDigitFreq: { [key: number]: number }[];
    colDigitFreq: { [key: number]: number }[];
    globalDigitFreq: { [key: number]: number };
    firstPrizeFreq: { [key: number]: number };
    totalEvenOdd: { evens: number; odds: number };
}

export interface CombinedAnalysis {
    inputAnalysis: AnalysisResult;
    historicalAnalysis: { 
        historicalDigitFreq: { [key: number]: number };
    };
}
