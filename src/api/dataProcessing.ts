import type { LottoData, ResultData } from '../types';
// import fs from 'fs';
// import path from 'path';

// const filePath = path.join(__dirname, '../data/lotto.json');

const readLottoData = async () => {
    try {
        return await window.ipcRenderer.readLottoData();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const getLastLottoData = async () => {
    const data: LottoData[] = await readLottoData();
    
    let times = 0;
    for(let i = 0; i < data.length; i++) {
        if (data[i].times > times) times = data[i].times;
    }

    return times;
}

const updateData = async (data: LottoData) => {
    try {
        await window.ipcRenderer.updateLottoData(data);
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const runDataParsing = async () => {
    const data: LottoData[] = await readLottoData();
    const array: number[] = new Array(45).fill(0);
    data.forEach((data) => {
        for (let i = 0; i < 6; i++) {
            array[data.numbers[i] - 1]++;
        }
    });

    return array;
}

const runDataSearching = async (num: number): Promise<ResultData> => {
    const data: LottoData[] = await readLottoData();
    const resultData = data.filter((data) => data.numbers.includes(num));

    const result: number[] = new Array(45).fill(0);
    for (let i = 0; i < resultData.length; i++) {
        for (let j = 0; j < 7; j++) {
            if (resultData[i].numbers[j] === num) continue;
            result[resultData[i].numbers[j] - 1]++;
        }
    }

    return {"result": result, "length": resultData.length};
}

export { runDataParsing, runDataSearching, getLastLottoData, updateData };