"use client";

import { Pie, PieChart } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";

const shotTypes = [
  "P&R BH",
  "Spot Up",
  "Transition",
  "Isolation",
  "Off Screen",
  "Cut",
  "Post-up",
  "Hand Off",
  "Put Back",
  "P&R Roll Man",
  "Misc.",
] as const;

type ShotType = (typeof shotTypes)[number];

interface ShotData {
  frequency: number;
  percentile: number;
}

const initShotValue = shotTypes.reduce((prev, curr) => {
  return {
    ...prev,
    [curr]: {
      frequency: 0,
      percentile: 0,
    },
  };
}, {} as Record<ShotType, ShotData>);

interface ShotContextProvider {
  shotData: Record<ShotType, ShotData>;
  updateFrequency: (key: ShotType, value: number) => void;
  updatePercentile: (key: ShotType, value: number) => void;
}

const ShotContext = createContext<ShotContextProvider>({
  shotData: initShotValue,
  updateFrequency: () => {
    throw new Error("Not implemented.");
  },
  updatePercentile: () => {
    throw new Error("Not implemented.");
  },
});

function InputTable() {
  const { updateFrequency, updatePercentile } = useContext(ShotContext);

  return (
    <Table className="w-full">
      <TableHeader>
        <TableRow>
          <TableHead>Shot Type</TableHead>
          <TableHead>% of Shots</TableHead>
          <TableHead>Percentile</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {shotTypes.map((type) => (
          <TableRow key={type}>
            <TableCell>{type}</TableCell>
            <TableCell>
              <Input
                onChange={(e) =>
                  updateFrequency(type, parseInt(e.currentTarget.value))
                }
                placeholder="%"
              />
            </TableCell>
            <TableCell>
              <Input
                onChange={(e) =>
                  updatePercentile(type, parseInt(e.currentTarget.value))
                }
                placeholder="%"
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function ShotFrequencyChart() {
  const { shotData } = useContext(ShotContext);
  const chartRef = useRef<HTMLDivElement>(null);

  const exportChart = useCallback(() => {
    if (chartRef.current) {
      html2canvas(chartRef.current, { backgroundColor: null }).then(
        (canvas) => {
          const pngUrl = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          downloadLink.href = pngUrl;
          downloadLink.download = "chart.png";
          downloadLink.click();
        }
      );
    }
  }, [chartRef]);

  function determineFill(percentile: number) {
    if (percentile >= 75) {
      return "#238823";
    }
    if (percentile <= 25) {
      return "#d2222d";
    }
    return "#ffbf00";
  }

  const chartData = useMemo(() => {
    return Object.entries(shotData).map(([key, value]) => {
      return {
        shotType: key,
        frequency: value.frequency,
        fill: determineFill(value.percentile),
      };
    });
  }, [shotData]);

  const chartConfig = useMemo(() => {
    return Object.keys(shotData).reduce(
      (agg, curr) => ({
        ...agg,
        [curr]: {
          label: curr,
        },
      }),
      {}
    );
  }, [shotData]);

  return (
    <div className="w-full flex flex-col">
      <div className="mx-auto" ref={chartRef}>
        <ChartContainer
          className="aspect-square w-[500px]"
          config={chartConfig}
        >
          <PieChart>
            <Pie
              isAnimationActive={false}
              data={chartData}
              dataKey="frequency"
              nameKey="shotType"
              label={(dp) => (dp.frequency ? dp.shotType : undefined)}
              labelLine={(dp) => dp.frequency && true}
              stroke="#eee"
              innerRadius={60}
              strokeWidth={1}
              outerRadius={150}
            ></Pie>
          </PieChart>
        </ChartContainer>
      </div>
      <Button className="w-fit" onClick={exportChart}>
        Download Chart
      </Button>
    </div>
  );
}

export default function Home() {
  const [shotData, setShotData] = useState(initShotValue);

  const updateFrequency = (key: ShotType, value: number) => {
    setShotData((curr) => ({
      ...curr,
      [key]: {
        ...curr[key],
        frequency: value,
      },
    }));
  };

  const updatePercentile = (key: ShotType, value: number) => {
    setShotData((curr) => ({
      ...curr,
      [key]: {
        ...curr[key],
        percentile: value,
      },
    }));
  };

  const sumFrequencies = useMemo(() => {
    return Object.values(shotData).reduce(
      (agg, curr) => agg + curr.frequency,
      0
    );
  }, [shotData]);

  return (
    <ShotContext.Provider
      value={{ shotData, updateFrequency, updatePercentile }}
    >
      <div className="flex flex-col lg:flex-row-reverse p-8 gap-4">
        <div className="w-full lg:w-1/2">
          <ShotFrequencyChart />
        </div>
        <div className="w-full lg:w-1/2">
          <InputTable />
          {sumFrequencies !== 100 && (
            <span className="text-red-500 text-sm">
              Warning: sum of frequencies does not equal 100
            </span>
          )}
        </div>
      </div>
    </ShotContext.Provider>
  );
}
