import { useEffect, useState } from "react";
import { fetchData, runDataParsing, runDataSearching, getLastLottoData, updateData } from "./api"
import { LottoData } from "./types";
import { useNavigate } from "react-router-dom";

interface BarData {
  "x": number;
  "y": number;
  "width": number;
  "height": number;
  "value": number;
  "index": number;
}

export default function App() {
  const [isDefault, setIsDefault] = useState(true);
  const [searchNum, setSearchNum] = useState(0);
  const [bars, setBars] = useState<BarData[]>([]);
  const [lastDate , setLastDate] = useState<number>(0);

  const showTooltip = (e: MouseEvent, bar: BarData) => {
    const tooltip = document.getElementById("tooltip");
    if (!tooltip) return;

    tooltip.style.display = "block";
    tooltip.innerHTML = `번호: ${bar.index + 1} <br> 빈도: ${bar.value}`;
    tooltip.style.top = `${e.clientY + 10}px`;
    tooltip.style.left = `${e.clientX + 10}px`;
  }

  const hideTooltip = () => {
    const tooltip = document.getElementById("tooltip");
    if (!tooltip) return;

    tooltip.style.display = "none";
  }

  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false); // 애니메이션 상태 관리

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setIsVisible(true); // 알림 표시 시작
    setTimeout(() => {
      setIsVisible(false); // 알림 서서히 사라지게 설정
    }, 2000); // 3초 후에 opacity를 0으로
    setTimeout(() => {
      setAlertMessage(null); // DOM에서 완전히 제거
    }, 3500); // 애니메이션 지속 시간(300ms) 후 제거
  };

  const fetchDataWrapper = async () => {
    while(true) {
      const lastData = await getLastLottoData();
      setLastDate(lastData);
      const result = await fetchData(lastData + 1);
  
      if(result.returnValue === "fail") {
        showAlert("데이터 동기화가 완료됐습니다.");
        break;
      } else {
        const newData: LottoData = {
          "times": result.drwNo,
          "numbers": [Number(result.drwtNo1), Number(result.drwtNo2), Number(result.drwtNo3), Number(result.drwtNo4), Number(result.drwtNo5), Number(result.drwtNo6), Number(result.bnusNo)]
        }
        updateData(newData).then(() => console.log(result.drwNo + " 데이터 동기화 완료."));
  
        setLastDate(result.drwNo);
        console.log(newData);
      }
    }
  }

  useEffect(() => {
    let data: number;
    const init = async () => {
      data = await getLastLottoData();
      setLastDate(data);
    }
    init();
  }, [])

  useEffect(() => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    let hoveredBar: BarData;

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      for (let i = 0; i < bars.length; i++) {
        const bar = bars[i];
        if (x >= bar.x && x <= bar.x + bar.width && y >= bar.y && y <= bar.y + bar.height) {
          hoveredBar = bar;
          break;
        }
      }

      if (hoveredBar) {
        showTooltip(e, hoveredBar);
      } else {
        hideTooltip();
      }
    }

    const onMouseOut = () => {
      hideTooltip();
    }

    canvas.addEventListener("mousemove", onMouseMove)
    canvas.addEventListener("mouseout", onMouseOut)
  }, [bars])

  const drawHistogram = (data: number[], idx: number, length?: number) => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    const width = 1000;
    const height = 750;
    const barWidth = 10;
    const barMargin = 5;
    const max = Math.max(...data);
    const ratio = height / max;
    const gamma = (idx === 0) ? 0 : 80;

    canvas.width = width;
    canvas.height = height;

    if (idx !== 0 && length) {
      if (!ctx) return;
      document.fonts.load('20px Pretendard').then(() => {
        ctx.font = 'bold 20px Pretendard'; 
        ctx.fillStyle = '#F2F2F2'; 

        const text = `${idx} 등장횟수: ${length}`;
        const textWidth = ctx.measureText(text).width;
        ctx.fillText(text, (width - textWidth) / 2, 20); 
      })
    }

    const totalGraphWidth = data.length * (barWidth + barMargin) - barMargin;
    const startX = (width - totalGraphWidth) / 2 - 6*22.5;

    const bars: BarData[] = [];
    data.forEach((value, index) => {
      if (index == idx-1) return;
      const x = startX + (barWidth + barMargin + 6) * (index);
      const barHeight = value * ratio;
      const y = height - value * ratio - 30 + gamma;
      const color = `rgba(233, 169, 119, ${value / max})`;

      if (!ctx) return;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth, value * ratio - gamma);
      ctx.fillStyle = `rgba(242, 242, 242, 1)`;
      ctx.font = "14px Arial";
      ctx.fillText(String(index + 1), x, height - 10);

      bars.push({
        x,
        y,
        width: barWidth,
        height: barHeight,
        value,
        index
      })
    });

    setBars(bars);
  }

  const defaultDraw = async () => {
    const data = await runDataParsing();
    drawHistogram(data, 0);
  }

  const searchDraw = async () => {
    const {result, length} = await runDataSearching(searchNum);
    drawHistogram(result, searchNum, length);
  }

  const checkNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value);
    if (num < 1 || num > 45) {
      setTimeout(() => {
        e.target.value = "";
      }, 500)
    } else {
      setSearchNum(num);
    }
  }

  const navigate = useNavigate();
  const switchRoute = () => {
    navigate("/generator");
  }

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center bg-[#1F1D36]/[0.97]">
      <h1 className="pretendard text-[#F2F2F2] text-2xl font-bold mb-10">현재 동기화된 회차 {lastDate}</h1>
      <div className="h-[810px] w-[1180px] flex justify-center items-center border-2 border-[#3E3C62] bg-[#2A293F] rounded-lg mb-10">
        <canvas id="canvas"></canvas>
      </div>

      {alertMessage && (
        <div
          className={`fixed top-32 bg-[#3E3C62] text-[#F2F2F2] p-4 rounded-lg shadow-lg z-50 transition-opacity duration-300 
            ${isVisible ? "opacity-100" : "opacity-0"}`}
        >
          {alertMessage}
        </div>
      )}

      <div className="flex justify-center items-center">
        <button 
          onClick={fetchDataWrapper}
          className="pretendard bg-[#6757C8] hover:bg-[#584AAB] h-10 w-28 rounded-lg text-[#F2F2F2] mx-2 font-bold text-base"
        >
          데이터 동기화
        </button>
      
      {
        isDefault ? (
          <div className="flex justify-center items-center"> 
            <button className="pretendard bg-[#3E3C62] hover:bg-[#353354] h-10 w-32 rounded-lg text-[#F2F2F2] mx-2 font-bold text-base" onClick={defaultDraw}>번호별 누적 통계</button>
            <button className="pretendard bg-[#3E3C62] hover:bg-[#353354] h-10 w-32 rounded-lg text-[#F2F2F2] mx-2 font-bold text-base" onClick={() => setIsDefault(false)}>특정 번호 통계</button>
          </div>
        ): (
          <div className="flex justify-center items-center">
            <input type="number" placeholder="1~45" className="pretendard bg-[#595778] h-10 w-20 rounded-lg text-[#F2F2F2] mx-2 font-bold text-center text-base" onChange={(e)=>checkNumber(e)} />
            <button className="pretendard bg-[#3E3C62] hover:bg-[#353354] h-10 w-20 rounded-lg text-[#F2F2F2] mx-2 font-bold text-base" onClick={searchDraw}>조회</button>
            <button className="pretendard bg-red-400 hover:bg-[#D46060] h-10 w-14 font-bold rounded-lg" onClick={() => setIsDefault(true)}>메인</button>
          </div>
        )
      }
      <div className="flex justify-center items-center px-3 rounded-lg ">
        <button 
          className="pretendard bg-[#3E3C62] hover:bg-[#353354] m-1 h-10 w-32 rounded-lg text-[#F2F2F2] mx-2 font-bold text-base"
          onClick={switchRoute}
        >번호 추첨</button>
      </div>
      </div>

      <div
        id="tooltip"
        className="absolute bg-[#3E3C62] text-[#F2F2F2] rounded-lg p-2"
        style={{ display: 'none' }}
      >
      </div>

    </div>
  )
}