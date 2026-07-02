interface IconNumberProps {
  number: 1 | 2 | 3 | 4 | 5 | 6;
}

export default function IconNumber({ number }: IconNumberProps) {
  return (
    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-400 text-white font-bold text-lg flex-shrink-0">
      {number}
    </div>
  );
}
