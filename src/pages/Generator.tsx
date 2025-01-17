import { useNavigate } from 'react-router-dom';
import Home from '../images/home.png';
import { useEffect, useState } from 'react';
import { runDataSearching } from '../api';

export const Generator = () => {
  const nav = useNavigate();
  const goHome = () => {
    nav('/');
  };

  const [isRunClicked, setIsRunClicked] = useState(0);
  const [userNum, setUserNum] = useState(0);
  const [randomNum, setRandomNum] = useState<number[]>([]);
  const [isDesc, setIsDesc] = useState(false);

  // 숫자 입력 필드 처리
  function manageInputBox(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (value === '') return;
    if (Number(value) < 1) e.target.value = '1';
    if (Number(value) > 45) e.target.value = '45';
    setUserNum(Number(e.target.value));
  }

  const generateRandomNumbers = (range: number) => {
    const newRandoms: number[] = [];
    while (newRandoms.length < 6) {
      const num = Math.floor(Math.random() * range) + 1;
      if (!newRandoms.includes(num)) {
        newRandoms.push(num);
      }
    }
    return newRandoms;
  };

  useEffect(() => {
    async function run() {
      if (isRunClicked === 1) {
        const newRandomNumbers = generateRandomNumbers(45);
        setRandomNum(newRandomNumbers);
      }
  
      if (isRunClicked === 2) {
        const newRandomNumbers = await getNumbersFromDistribution();
        setRandomNum(newRandomNumbers);
      }
    }
    run();
  }, [isRunClicked]);

  function getSortedMap(arr: number[]) {
    const sortedMap = arr
              .map((value, index) => ({ value, index }))
              .sort((a, b) => (isDesc ? b.value - a.value : a.value - b.value));

    return sortedMap;
  }

  async function getNumbersFromDistribution() {
    const { result } = await runDataSearching(userNum);

    const sortedMap = getSortedMap(result);
    let indexes: number[] = sortedMap.slice(0, 11).map((value) => value.index + 1);
    indexes = indexes.filter((num) => num !== userNum);
    console.log(indexes);

    const randomIndexes = generateRandomNumbers(indexes.length-1);
    
    const newRandomNumbers = [userNum, ...randomIndexes.map((index) => indexes[index])];
    newRandomNumbers.pop();

    return newRandomNumbers;
  }

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center bg-[#1F1D36]/[0.97]">
      {/* 홈 버튼 */}
      <div className="absolute top-1 left-1 flex justify-center items-center">
        <button
          className="pretendard text-[#f2f2f2] text-xl h-10 font-bold bg-[#474464]/[0.4] hover:bg-[#3C3A55] rounded-lg"
          onClick={goHome}
        >
          <img
            src={Home}
            alt="home"
            className="w-6 h-6 m-2"
            style={{ filter: 'invert(1)' }}
          />
        </button>
      </div>

      <div className="text-[#f2f2f2] text-2xl font-bold mb-4">
        번호 추첨
      </div>

      {/* 1) 아직 추첨 전 */}
      {isRunClicked === 0 ? (
        <div className="h-[810px] w-[1180px] flex gap-2 justify-center items-center border-2 border-[#3E3C62] bg-[#2A293F] rounded-lg mb-10">
          {/* 무작위 번호 생성 영역 */}
          <div className="flex flex-col justify-center items-center w-1/2 h-4/5 relative">
            <h2 className="absolute pretendard text-[#f2f2f2] font-bold text-xl top-[10rem]">
              무작위 번호 생성
            </h2>
            <button
              className="pretendard bg-[#6757C8] hover:bg-[#584AAB] h-10 w-28 rounded-lg text-[#F2F2F2] mx-2 font-bold text-base"
              onClick={() => setIsRunClicked(1)}
            >
              추첨
            </button>
          </div>

          {/* 사용자 입력 기반 번호 생성 영역 */}
          <div className="flex flex-col justify-center items-center w-1/2 h-4/5 relative gap-5">
            <h2 className="absolute pretendard text-[#f2f2f2] font-bold text-xl top-[10rem]">
              1~45 시작 번호 선택
            </h2>
            <div>
              <button className={`pretendard ${isDesc ? "bg-[#5B791E]" : "bg-[#293F2A]"} h-10 w-32 rounded-lg text-[#F2F2F2] mx-2 font-bold text-base ${isDesc ? 'bg-[#584AAB]' : ''}`} onClick={() => setIsDesc(false)}>
                낮은 빈도 선택
              </button>
              <button className={`pretendard ${!isDesc ? "bg-[#A0522D]" : "bg-[#674343]"}  h-10 w-32 rounded-lg text-[#F2F2F2] mx-2 font-bold text-base ${isDesc ? 'bg-[#584AAB]' : ''}`} onClick={() => setIsDesc(true)}>
                높은 빈도 선택
              </button>
            </div>
            <input
              type="number"
              placeholder="1~45"
              className="pretendard bg-[#595778] h-10 w-28 rounded-lg text-[#F2F2F2] mx-2 font-bold text-center text-base"
              onChange={manageInputBox}
            />
            <button
              className="pretendard bg-[#6757C8] hover:bg-[#584AAB] h-10 w-28 rounded-lg text-[#F2F2F2] mx-2 font-bold text-base"
              onClick={() => setIsRunClicked(2)}
            >
              추첨
            </button>
          </div>
        </div>
      ) : null}

      {/* 2) 무작위 번호 생성 후 */}
      {isRunClicked === 1 && (
        <div className="h-[810px] w-[1180px] flex flex-col gap-2 justify-center items-center border-2 border-[#3E3C62] bg-[#2A293F] rounded-lg mb-10 relative">
          <div className="flex gap-4">
            {randomNum.map((num, idx) => (
              <div key={idx} className="pretendard text-[#f2f2f2] w-24 h-24 border-[#E3E2E6] border-2 rounded-lg text-center flex justify-center items-center text-2xl font-bold">
                {num}
              </div>
            ))}
          </div>

          <div className='absolute bottom-10 text-xl text-[#f2f2f2]'>
            <button className='pretendard bg-red-400 hover:bg-[#D46060] h-10 w-28 rounded-lg text-[#F2F2F2] mx-2 font-bold text-base' onClick={() => setIsRunClicked(0)}>
              back
            </button>
          </div>

        </div>
      )}

      {/* 3) 사용자 입력 기반 번호 생성 후 (시연용) */}
      {isRunClicked === 2 && (
        <div className="h-[810px] w-[1180px] flex flex-col gap-2 justify-center items-center border-2 border-[#3E3C62] bg-[#2A293F] rounded-lg mb-10 relative">
          <div className="flex gap-4">
            {randomNum.map((num, idx) => (
              <div key={idx} className="pretendard text-[#f2f2f2] w-24 h-24 border-[#E3E2E6] border-2 rounded-lg text-center flex justify-center items-center text-2xl font-bold">
                {num}
              </div>
            ))}
          </div>

          <div className='absolute bottom-10 text-xl text-[#f2f2f2]'>
            <button className='pretendard bg-red-400 hover:bg-[#D46060] h-10 w-28 rounded-lg text-[#F2F2F2] mx-2 font-bold text-base' onClick={() => setIsRunClicked(0)}>
              back
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
