import { toActual } from "@/helpers";

export function initChart() {
  const canvas = document.querySelector("canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;

  const dpr = window.devicePixelRatio || 1;
  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);

  return function drawChart(enabled: boolean, sliderVol: number | null): void {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#fafafa";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const frac = i / 4;

      ctx.strokeStyle = "#e8e8e8";
      ctx.beginPath();
      ctx.moveTo(frac * canvas.width, 0);
      ctx.lineTo(frac * canvas.width, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, frac * canvas.height);
      ctx.lineTo(canvas.width, frac * canvas.height);
      ctx.stroke();
    }

    ctx.strokeStyle = "#ccc";
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#bbb";
    ctx.lineWidth = 1.5;
    if (enabled) ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(canvas.width, 0);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = enabled ? "#cc0000" : "#e0a0a0";
    ctx.lineWidth = 2;
    if (!enabled) ctx.setLineDash([4, 4]);
    ctx.beginPath();
    for (let px = 0; px <= canvas.width; px++) {
      const cy = canvas.height - toActual(px / canvas.width) * canvas.height;
      px === 0 ? ctx.moveTo(px, cy) : ctx.lineTo(px, cy);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = enabled ? "rgba(204,0,0,0.06)" : "rgba(200,200,200,0.08)";
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    for (let px = 0; px <= canvas.width; px++) {
      ctx.lineTo(
        px,
        canvas.height - toActual(px / canvas.width) * canvas.height,
      );
    }
    for (let px = canvas.width; px >= 0; px--) {
      ctx.lineTo(px, canvas.height - (px / canvas.width) * canvas.height);
    }
    ctx.closePath();
    ctx.fill();

    if (sliderVol !== null) {
      const mx = sliderVol * canvas.width;
      const my = enabled
        ? canvas.height - toActual(sliderVol) * canvas.height
        : canvas.height - sliderVol * canvas.height;

      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(mx, my);
      ctx.lineTo(mx, canvas.height);
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(mx, my, 4, 0, Math.PI * 2);
      ctx.fillStyle = enabled ? "#cc0000" : "#000";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  };
}
