import { useEffect, useState } from 'react';
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";

function ImageCarousel(props: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [props.images]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? props.images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === props.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="image-carousel">
      <div className="carousel-image-container">
        <img
          src={props.images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          className="carousel-image"
        />
      </div>
      <div className="carousel-controls">
        <button className="carousel-button left" onClick={goToPrevious}>
          <FaAngleLeft style={{ width: 20, height: 20 }} />
        </button>
        <button className="carousel-button right" onClick={goToNext}>
          <FaAngleRight style={{ width: 20, height: 20 }} />
        </button>
      </div>
      <div className="carousel-indicators">
        {props.images.map((_, index) => (
          <span
            key={index}
            className={`carousel-indicator ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
          ></span>
        ))}
      </div>
    </div>
  );
}

export default ImageCarousel;