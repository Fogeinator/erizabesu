import { h, Component, cloneElement } from 'preact';
import './style.css';

export default class Erizabesu extends Component {
  static defaultProps = {
    autoplay: true,
    autoplaySpeed: 3000,
    allowMouseSwipe: true,
    infinite: true
  };
  state = { boardIndex: 0, transition: true };

  componentDidMount() {
    this.autoPlay();
    this.dataLength = this.props.data.length;

    this.boards.addEventListener('mousedown', this.onMouseDown);
    this.boards.addEventListener('touchstart', this.onSwipeStart);
    this.boards.addEventListener('touchmove', this.onSwipeMove);
    this.boards.addEventListener('touchend', this.onSwipeEnd);
  }

  componentWillReceiveProps(nextProps) {
    this.dataLength = nextProps.data.length;
  }

  componentWillUnmount() {
    this.clearAutoPlay();

    this.boards.removeEventListener('mousedown', this.onMouseDown);
    this.boards.removeEventListener('touchstart', this.onSwipeStart);
    this.boards.removeEventListener('touchmove', this.onSwipeMove);
    this.boards.removeEventListener('touchend', this.onSwipeEnd);
  }

  autoPlay = () => {
    if (this.props.autoplay && !this.interval) {
      this.interval = setInterval(this.nextBoard, this.props.autoplaySpeed);
    }
  };

  clearAutoPlay = () => {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  };

  nextBoard = () => {
    const boardIndex = (this.state.boardIndex + 1) % this.dataLength;
    if (this.props.infinite && boardIndex === 0) {
      setTimeout(() => {
        this.setState({ boardIndex: 0, transition: false });
      }, 500);
      this.setState({ boardIndex: this.dataLength, transition: true });
    } else {
      this.setState({ boardIndex, transition: true });
    }
  };

  onSwipeStart = e => {
    this.clearAutoPlay();
    this.setState({ transition: false });
    this.startX = getX(e);
    this.startIndex = this.state.boardIndex;
  };

  onSwipeMove = e => {
    const deltaX = getX(e) - this.startX;
    let boardIndex = this.startIndex - deltaX / this.boards.clientWidth;
    if (this.props.infinite) {
      if (boardIndex >= this.dataLength) {
        boardIndex -= this.dataLength;
      } else if (boardIndex <= 0) {
        boardIndex += this.dataLength;
      }
    }
    this.setState({
      boardIndex
    });
  };

  onSwipeEnd = e => {
    this.autoPlay();
    this.setState({ transition: true });
    let boardIndex = this.state.boardIndex;
    if (boardIndex < 0) {
      boardIndex = 0;
    } else if (boardIndex > this.dataLength - 1) {
      boardIndex = this.dataLength - 1;
    } else {
      boardIndex = Math.round(this.state.boardIndex);
    }
    this.setState({ boardIndex });
  };

  onMouseDown = e => {
    e.preventDefault();
    if (this.props.allowMouseSwipe) {
      this.mouseDown = true;
      document.addEventListener('mouseup', this.onMouseUp);
      document.addEventListener('mousemove', this.onMouseMove);
      this.onSwipeStart(e);
    }
  };

  onMouseMove = e => {
    if (this.mouseDown) {
      this.onSwipeMove(e);
    }
  };

  onMouseUp = e => {
    this.mouseDown = false;
    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('mousemove', this.onMouseMove);
    this.onSwipeEnd(e);
  };

  onBoardClick = e => {
    if (this.startX !== getX(e)) {
      e.preventDefault();
    }
  };

  swipeBoard = boardIndex => {
    this.clearAutoPlay();
    this.setState({ boardIndex, transition: true });
    this.autoPlay();
  };

  render(
    { data, className, infinite, children, ...props },
    { boardIndex, transition }
  ) {
    const style = { transform: `translateX(${-boardIndex * 100}%)` };
    if (transition) style.transition = 'transform 0.5s ease';
    return (
      <div
        {...props}
        class={['erizabesu', props.class, className].filter(Boolean).join(' ')}
      >
        <div ref={c => (this.boards = c)} class="boards" style={style}>
          {data
            .concat(infinite ? [data[0]] : [])
            .map(board => (
              <a
                class="board"
                href={board.href}
                target={board.target}
                onClick={this.onBoardClick}
                style={{ backgroundImage: `url(${board.img})` }}
              />
            ))}
        </div>
        {children.map(child =>
          cloneElement(child, {
            num: data.length,
            index: boardIndex === data.length ? 0 : boardIndex,
            swipeBoard: this.swipeBoard
          })
        )}
      </div>
    );
  }
}

function getX(e) {
  if ('touches' in e) {
    return e.touches[0].pageX;
  }
  return e.screenX;
}
