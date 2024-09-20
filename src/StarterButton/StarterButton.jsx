import '../styles.css';

const StarterButton = ({ onMouseDown, onMouseUp }) => {
  return (
    <button
      className="starter-button"
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      START
    </button>
  );
};


export default StarterButton;