window.addEventListener('DOMContentLoaded', () => {

    const url = "http://localhost:3000/questions";
    const questionHolder = document.querySelector('.question-holder');
    let questionsBlocks = document.querySelectorAll('.question');
    const startButton = document.querySelector('.start-btn');
    const questionBtnsBlock = document.querySelector('.questions-btns');
    const prevBtn = document.querySelector('.prev-btn'),
          nextBtn = document.querySelector('.next-btn'),
          resultsBtn = document.querySelector('.results-btn'),
          repeatBtn = document.querySelector('.repeat__btn');
    
    let currentQuestion = 0;
    
    repeatBtn.style.display = 'none';

    (function(){
        questionsBlocks.forEach(q => {
            q.style.display = 'none';
        })
    })();


    //Чистим storage после перезагрузки
    (function() {
        localStorage.clear();
    })();


    //Стартим квиз при загрузке
    function startQuiz() {
        questionsBlocks[currentQuestion].style.display = 'flex';
        
        questionBtnsBlock.style.display = 'flex';
        startButton.style.display = 'none';
    }
    
    //Следующий вопрос
    function showNextQuestion() {
        questionsBlocks[currentQuestion].style.display = 'none';
        currentQuestion++;
        questionsBlocks[currentQuestion].style.display = 'flex';
    }
    
    //Предыдущий вопрос
    function showPreviousQuestion() {
        questionsBlocks[currentQuestion].style.display = 'none';
        currentQuestion--;
        questionsBlocks[currentQuestion].style.display = 'flex';
    }

    //Сейвим ответы пользователя
    function saveAnswers(questionNumber, answer) {
        const localStorageKey = `question_${questionNumber}`;
        localStorage.setItem(localStorageKey, answer);
    }

    //Получаем выбранный пользователем ответ
    function getSelectedAnswer() {
        const selectedRadioButton = document.querySelector(`input[name="group-${currentQuestion + 1}"]:checked`);
        
        //Проверяем ответил ли на ответ пользователь
        if(selectedRadioButton) {
            //Если он ответил, то важно удалить надпись
            let errorMessage = document.querySelector('.error-message');
            if(errorMessage) {
                errorMessage.remove();
            }
            return selectedRadioButton.value;
        } else { // Если он не выбрал, логично его заблокировать на этом вопросе пока он не ответит
            let pClone = document.querySelector('.error-message');
            if(pClone) {
                return null;
            }
            let p = document.createElement('p');
            p.classList.add('error-message');
            p.textContent = 'Ошибка! Ответьте пожалуйста на вопрос!'
            questionHolder.append(p);
            return null;
        }
    }

    //Тупо показываем кнопку "Результаты"
    function showResultsBtn() {
        nextBtn.style.display = 'none';
        prevBtn.style.display = 'none';
        resultsBtn.style.display = 'block';
    }

    // Генерим блок с результами
    function generateResults(rightAnswersNum) {
        resultsBtn.style.display = 'none';
        questionsBlocks[currentQuestion].style.display = 'none';

        const resultsBlock = `
            <div class="results">
                <p class="results__text">Ваш результат - ${rightAnswersNum}/${questionsBlocks.length}</p>
            </div>
        `;

        questionHolder.innerHTML += resultsBlock;
    }

    // Запрос к DB
    async function getData() {
        return await fetch(url)
            .then(response => response.json())
    }

    //Делаем запрос, получаем ответ, выводим на экран c проверками
    function showResults() {
        getData()
            .then((result) => {
                const questions = result;
                let correctAnswers = 0;

                for(let i = 0; i < questions.length; i++) {
                    const localStorageKey = `question_${i + 1}`;
                    const userAnswer = localStorage.getItem(localStorageKey);

                    if(userAnswer !== null && userAnswer === questions[i].rightAnswer) {
                        correctAnswers++;
                    }   
                }
                return correctAnswers;
            })
            .then(correctAnswers => {
                generateResults(correctAnswers);
            })
            .catch(e => {
                console.log('Something went wrong: ', e);
            })
    }

    //Релоад РАДИО при рестарте
    function resetRadioButtons() {
        const radioButtons = document.querySelectorAll('input[type="radio"]');
        radioButtons.forEach(button => {
            button.checked = false;
        });
    }

    startButton.addEventListener('click', () => {
        startQuiz();
    });

    nextBtn.addEventListener('click', () => {
        //Проверяем не закончились ли у нас вопросы
        if(currentQuestion === questionsBlocks.length - 1) {
            const selectedAnswer = getSelectedAnswer();
            if(selectedAnswer !== null) {
                saveAnswers(currentQuestion + 1, getSelectedAnswer());
                showResultsBtn();
            }
        } else {
            const selectedAnswer = getSelectedAnswer();
            if(selectedAnswer !== null) {
                saveAnswers(currentQuestion + 1, getSelectedAnswer());
                showNextQuestion();
            }
        }
    });

    prevBtn.addEventListener('click', () => {
        if(currentQuestion === 0) {
            return;
        } else {
            showPreviousQuestion();
        }
    });

    resultsBtn.addEventListener('click', () => {
        showResults();
        repeatBtn.style.display = 'block';
        
    })

    document.addEventListener('click', (e) => {
        if(e.target.classList.contains('repeat__btn')) {
            location.reload();
        }
    })

    resetRadioButtons();
})