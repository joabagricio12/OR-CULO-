
import type { DataSet } from './types';

// Calibração de segurança para evitar crash em estado vazio
export const INITIAL_HISTORY: DataSet[] = [
    [[1,2,3,4], [5,6,7,8], [9,0,1,2], [3,4,5,6], [7,8,9,0], [1,3,5,7], [2,4,6]]
];
