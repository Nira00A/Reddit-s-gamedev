import { CirclePicker, ColorResult } from 'react-color';

interface PalletProps {
  setCurrentColor: (color: string) => void;
}

export function Pallet({ setCurrentColor }: PalletProps) {
  function AddingColor(color: ColorResult) {
    setCurrentColor(color.hex);
  }

  return <CirclePicker onChange={AddingColor} />;
}
