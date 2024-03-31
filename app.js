/**********************************************
 * STARTER CODE
 **********************************************/

/**
 * shuffle()
 * Shuffle the contents of an array
 *   depending the datatype of the source
 * Makes a copy. Does NOT shuffle the original.
 * Based on Steve Griffith's array shuffle prototype
 * @Parameters: Array or string
 * @Return: Scrambled Array or string, based on the provided parameter
 */
function shuffle (src) {
  const copy = [...src]

  const length = copy.length
  for (let i = 0; i < length; i++) {
    const x = copy[i]
    const y = Math.floor(Math.random() * length)
    const z = copy[y]
    copy[i] = z
    copy[y] = x
  }

  if (typeof src === 'string') {
    return copy.join('')
  }

  return copy
}

/**********************************************
 * YOUR CODE BELOW
 **********************************************/
const { useState, useEffect } = React;

const wordList = [
  "opposite",
  "metaphor",
  "symbolism",
  "introvert",
  "extrovert",
  "introspection",
  "relief",
  "perception",
  "dandelions",
  "dream",
]

// function to use useEffect hook to set and get items to and from the local storage. Update the local storage item everytime the value of that item changes (to avoid having multiple similar useEffect hooks)
function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

// function containing the game logic
function useGameLogic(wordList) {
  // get the shuffled list of words from the local storage & store it in a state variable. If not available, use the default shuffled array.
  const [words, setWords] = useLocalStorage("shuffledWords", shuffle(wordList));
  const [points, setPoints] = useLocalStorage("points", 0);
  const [strikes, setStrikes] = useLocalStorage("strikes", 0);
  const [passes, setPasses] = useLocalStorage("passes", 3);
  const [gameOver, setGameOver] = useState(false);
  // set the maximum number of strikes
  const strikesLimit = 3;
  // state variable to use to control the visibility of message in InputForm
  const [isMessageVisible, setMessageVisible] = useState(true);

  // when the user enters the correct answer, the current chosenWord is removed from the list; and the points goes up by 1
  const handleCorrect = () => {
    if (words.length > 0) {
      setWords((prevWords) => prevWords.slice(1));
      setPoints((prevPoints) => prevPoints + 1);
    } else {
      checkGameOver();
    }
  };

  const handleStrikes = () => {
    setStrikes((prevStrikes) => prevStrikes + 1);
  };

  // when the pass button is clicked, the current chosenWord is removed, the next word is shown, and the passes go down by 1
  const handlePasses = () => {
    setWords((prevWords) => prevWords.slice(1));
    setPasses((prevPasses) => prevPasses - 1);
    // Hide the message containers in InputForm when pass button is clicked
    setMessageVisible(false);
  };

  // set gameOver to true if there's no more word in the words array, or if the player receives the maximum number of strikes
  const checkGameOver = () => {
    if (words.length === 0 || strikes >= strikesLimit) {
      setGameOver(true);
    }
  };

  // Function to handle game restart
  const restartGame = () => {
    // Reset all necessary state variables
    setWords(shuffle(wordList));
    setPoints(0);
    setStrikes(0);
    setPasses(3);
    setGameOver(false);
  };

  // use useEffect to check game over condition on each word change or strike update
  useEffect(() => {
    checkGameOver();
  }, [words, strikes]);

  return {
    words,
    points,
    strikes,
    strikesLimit,
    passes,
    isMessageVisible,
    setMessageVisible,
    gameOver,
    handleCorrect,
    handleStrikes,
    handlePasses,
    restartGame,
  };
}

// Component for input form
function InputForm({currentWord, handleCorrect, handleStrikes, isMessageVisible, setMessageVisible}) {
  const [inputValue, setInputValue] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [isIncorrect, setIsIncorrect] = useState(false);

  const handleSubmit = (e) => {
    // Save the inputValue and convert it to lowercase to compare with correct answer.
    const submitValue = inputValue.toLowerCase();
    e.preventDefault();
    // Clear the input field after submission
    setInputValue('');
    // console.log("Form Submitted.", submitValue)
    // Make the message visible after submission
    setMessageVisible(true);

    if(submitValue === currentWord) {
      setIsCorrect(true);
      setIsIncorrect(false);
      handleCorrect();
    } 
    else{
      setIsCorrect(false);
      setIsIncorrect(true);
      handleStrikes();
    }
  };

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  useEffect(() => {
    if (!isMessageVisible) {
      setInputValue('');
    }
  }, [isMessageVisible]);

  return (
    <div className="form-container">
      {/* show message containers only if isMessageVisible is true */}
      {isMessageVisible && (
        <>
        {/* show this message if user enters the correct word */}
        {isCorrect && 
          <div className="correct-msg-container msg-container">
            <p className="correct-msg">Correct, good job! Next word.</p>
          </div>
        }

        {/* show this message if the user enters incorrect word */}
        {isIncorrect && 
          <div className="incorrect-msg-container msg-container">
            <p className="incorrect-msg">Opp...That's incorret. Let's try again!</p>
          </div>
        }
        </>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          placeholder="Type the word and press Enter or click Submit"
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

// Component to display the scrambled word
function ScrambleWord({chosenWord}) {
  // scramble the word
  const scrambledWord = shuffle(chosenWord);

  return (
    <p className="scrambled-word">{scrambledWord}</p>
  )
}

function PassBtn({handlePasses}) {
  return (
    <button className="pass-btn" onClick={handlePasses}>Pass</button>
  )
}

function PointsContainer({points}) {
  return (
    <div className="points-container">
      <p>{points}</p>
      <p>POINTS</p>
    </div>
  )
}

function StrikesContainer({strikes, strikesLimit}) {
  return (
    <div className="strikes-container">
      <p>{strikes}/{strikesLimit}</p>
      <p>STRIKES</p>
    </div>
  )
}

function PassesContainer({passes}) {
  return (
    <div className="passes-container">
      <p>{passes}</p>
      <p>PASSES</p>
    </div>
  )
}

function GameOverContainer({strikes, strikesLimit, restartGame}) {
  return (
    <div className="game-over-container">
      <div className={strikes >= strikesLimit ? "msg-container game-over-msg-container" : "msg-container win-msg-container"}>
        <p className={strikes >= strikesLimit ? "game-over-msg" : "win-msg"}>
          {strikes >= strikesLimit
            ? "Game over. You received the maximum number of strikes."
            : "Congratulations! You completed all the words."}
        </p>
      </div>
      {/* Render restart button */}
      <button onClick={restartGame} className="restart-btn">Restart</button>
    </div>
  )
}

// shuffle the wordList at the start of the game
const shuffledWords = shuffle(wordList);
function App() {
  // retrieve variables from useGameLogic function
  const {
    words,
    points,
    strikes,
    strikesLimit,
    passes,
    isMessageVisible,
    setMessageVisible,
    gameOver,
    handleCorrect,
    handleStrikes,
    handlePasses,
    restartGame,
  } = useGameLogic(wordList);

  // set the chosenWord to the first word in teh words array
  const chosenWord = words.length > 0 ? words[0] : "";

  return (
    <div className="container">
      <h2>Welcome to Scramble.</h2>
      <div className="point-strike-container">
        <PointsContainer points={points} />
        <StrikesContainer strikes={strikes} strikesLimit={strikesLimit} />
        <PassesContainer passes={passes} />
      </div>

      {/* If the game is over, hide the scrambled word, the input form, and the pass button. */}
      {(!gameOver) && 
        <>
        <ScrambleWord chosenWord={chosenWord}/>
          <InputForm 
            currentWord={chosenWord}
            handleCorrect={handleCorrect}
            handleStrikes={handleStrikes}
            isMessageVisible={isMessageVisible}
            setMessageVisible={setMessageVisible} />
          {passes > 0 && <PassBtn handlePasses={handlePasses} />}
        </>
      }
      {/* Render game end message and restart button if game is over */}
      {gameOver && (
        <GameOverContainer strikes={strikes} strikesLimit={strikesLimit} restartGame={restartGame} />
      )}
    </div>

  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);