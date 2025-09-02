import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Star } from "lucide-react";

interface RatingSliderProps {
  /** Nilai rating saat ini (contoh: 3.7) */
  value: number;
  /** Fungsi yang dipanggil saat nilai rating berubah */
  onChange: (newValue: number) => void;
  /** Nilai rating minimum, default 0 */
  min?: number;
  /** Nilai rating maksimum, default 5 */
  max?: number;
  /** Langkah perubahan nilai slider, default 0.1 untuk desimal */
  step?: number;
}

export const RatingSlider: React.FC<RatingSliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 5,
  step = 0.1,
}) => {
  // Slider dari shadcn/ui mengembalikan nilai dalam bentuk array,
  // jadi kita perlu mengambil elemen pertamanya.
  const handleSliderChange = (sliderValue: number[]) => {
    onChange(sliderValue[0]);
  };

  return (
    <>
      <div className="flex justify-start space-x-1" aria-hidden="true">
        {[...Array(max)].map((_, i) => {
          const filledPercentage = Math.max(0, Math.min(1, value - i)) * 100;
          return (
            <div key={i} className="relative">
              <Star
                className="w-4 h-4 text-gray-300 dark:text-gray-600"
                fill="currentColor"
              />

              <div
                className="absolute top-0 left-0 h-full overflow-hidden"
                style={{ width: `${filledPercentage}%` }}
              >
                <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
              </div>
            </div>
          );
        })}
        <Label className="text-sm text-muted-foreground ml-2">
          {value.toFixed(1)}
        </Label>
      </div>

      <Slider
        id="rating-slider"
        value={[value]}
        max={max}
        min={min}
        step={step}
        onValueChange={handleSliderChange}
        className="w-full"
        aria-label={`Rating slider, nilai saat ini ${value.toFixed(
          1
        )} dari ${max}`}
      />
    </>
  );
};
