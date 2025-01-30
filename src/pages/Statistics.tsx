import { useNavigate } from "react-router-dom";
import Home from "../images/home.png";
import { LottoData } from "../types";
import { getLastLottoData, runSpecificDataSearching } from "../api/dataProcessing";
import { useEffect, useState } from "react";

export function Statistics() {
  const nav = useNavigate();
  const goHome = () => {
    nav('/');
  };

  const [tables, setTables] = useState<JSX.Element[]>([]);
  const [toggle, setToggle] = useState<boolean>(true);
  const [data, setData] = useState<LottoData[]>([]);

  let trClass = "text-xl border border-[#171624]";
  let thClass = "text-2xl border border-[#171624]";
  let tdClass = "w-24 text-base border border-[#171624]";
  let toggleClass = "pretendard bg-[#3D35A4] h-8 w-20 text-[#F2F2F2] font-bold text-sm"

  const makeTable = async (): Promise<JSX.Element[]> => {
    const lastTimes = await getLastLottoData();
    const data: LottoData[] = [await runSpecificDataSearching(lastTimes)];

    for (let i = 1; i < 15; i++) {
      data.push(await runSpecificDataSearching(lastTimes - i));
    }

    // console.log(data);
    setData(data);

    const table: JSX.Element[] = [];
    data.forEach((data, idx) => {
      table.push(
        <tr key={data.times} className={trClass + " text-center h-10" + (idx % 2 === 0 ? " bg-[#32304A]" : " bg-[#3A3862]")}>
          <td className={"text-[#9B7777] font-mono"}>{data.times}</td>
          <td className={tdClass}>{data.numbers[0]}</td>
          <td className={tdClass}>{data.numbers[1]}</td>
          <td className={tdClass}>{data.numbers[2]}</td>
          <td className={tdClass}>{data.numbers[3]}</td>
          <td className={tdClass}>{data.numbers[4]}</td>
          <td className={tdClass}>{data.numbers[5]}</td>
        </tr>
      )
    })

    return table;
  }

  const drawHistogram = (data: number[], idx: number) => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    const width = 1000;
    const height = 700;
    const barWidth = 10;
    const barMargin = 5;
    const max = Math.max(...data);
    const ratio = height / max;
    const gamma = 80;

    const totalGraphWidth = data.length * (barWidth + barMargin) - barMargin;
    const startX = (width - totalGraphWidth) / 2 - 6*22.5;
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    data.forEach((value, index) => {
      if (index == idx-1) return;
      const x = startX + (barWidth + barMargin + 6) * (index);
      const y = height - value * ratio - 30 + gamma;
      const color = `rgba(233, 169, 119, ${value / max})`;

      if (!ctx) return;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth, value * ratio - gamma);
      ctx.fillStyle = `rgba(242, 242, 242, 1)`;
      ctx.font = "14px Arial";
      ctx.fillText(String(index + 1), x, height - 10);
    });
  }

  useEffect(() => {
    async function init() {
      const table = await makeTable();
      setTables(table);
    }

    init();
  }, []);

  useEffect(() => {
    if (!toggle && data.length > 0) {
      const array: number[] = new Array(45).fill(0);
      data.forEach((data) => {
        for (let i = 0; i < 6; i++) {
          array[data.numbers[i] - 1]++;
        }
      });

      // console.log(array)
      drawHistogram(array, 0);
    }
  }, [toggle, data]); 

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

      <div className="relative pretendard text-white h-[820px] w-[1180px] flex gap-3 justify-center items-center border-2 border-[#3E3C62] bg-[#2A293F] rounded-lg mb-10">
        {toggle ?
          <table className="border-2 rounded-2xl border-[#171624] w-2/3">
            <tr className={trClass + " h-[3.125rem] bg-[#343256]"}>
              <th className={thClass} scope="col">회차</th>
              <th className={thClass} scope="col" colSpan={6}>번호</th>
            </tr>
            {tables && tables.map((table) => table)}
          </table> : <canvas id="canvas" width="1000" height="700"></canvas>
        }

        <div className="absolute flex flex-row justify-center items-center top-8 rounded-lg">
          <button
            className={toggleClass + " rounded-l-lg border-r-1" + (toggle ? " bg-[#2C2675]" : "")}
            onClick={() => setToggle(true)}
          >
            Table
          </button>
          <button
            className={toggleClass + " rounded-r-lg border-l-1" + (!toggle ? " bg-[#2C2675]" : "")}
            onClick={() => setToggle(false)}
          >
            Chart
          </button>
        </div>
      </div>
    </div>
  );
}