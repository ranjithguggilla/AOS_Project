import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

export default function Rating({ value, text }: { value: number; text?: string }) {
  return (
    <div className="rating">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i}>
          {value >= i ? <FaStar /> : value >= i - 0.5 ? <FaStarHalfAlt /> : <FaRegStar />}
        </span>
      ))}
      {text && <span className="ms-1">{text}</span>}
    </div>
  );
}
