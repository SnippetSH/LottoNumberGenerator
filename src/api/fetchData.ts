const fetchData = async (time: number) => {
    try {
        const data = await window.ipcRenderer.fetchLottoData(time);
        // console.log(data);
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export { fetchData };