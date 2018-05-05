$(function () {   
    /**
     * application global constants
     */
    const appConstants = {
        match: "match",
        open: "open",
        cardPrefix: "fa-",
        cards: [
            "fa-diamond", "fa-paper-plane-o", "fa-anchor", "fa-bomb",
            "fa-bicycle", "fa-bolt", "fa-cube", "fa-leaf",
            "fa-diamond", "fa-paper-plane-o", "fa-anchor", "fa-bomb",
            "fa-bicycle", "fa-bolt", "fa-cube", "fa-leaf"
        ],
        totalCount: 16,
        numberOfMovesToChangeRating: 15,
        initialStarRating: 3,
        timerIntervalInms: 1000,
        completionMsgShowDelayInMs: 1500
    };
    const timerText = $("#timer");
    const starHtml = `
    <li>
        <i class="fa fa-star"></i>
    </li>`;
  
    let timeElapsed = 0,
        moveCounter = 0,
        newOpenCard = false,
        openCards = [];

    let timer, starRating = appConstants.initialStarRating;    
    
    /*
     * Display the cards on the page
     *   - shuffle the list of cards using the provided "shuffle" method below
     *   - loop through each card and create its HTML
     *   - add each card's HTML to the page
     */

    // Shuffle function from http://stackoverflow.com/a/2450976
    function shuffle(array) {
        var currentIndex = array.length,
            temporaryValue, randomIndex;

        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    /**
     * adds the card to the deck in html
     * @param {*} cardClass fa css class for the image of the card to be added
     */
    function addCard(cardClass) {
        let cardHtml = `
    <li class="card">
        <i class="fa ${cardClass}"></i>
    </li>`;
        $(".deck").append(cardHtml);
    }

    /**
     * checks if the existing clicked pair is already open and not matched.
     */
    function isExistingCardPairOpen() {
        let count = 0;
        let cardItems = $(".card");
        
        for (const item of cardItems) {
            const card = $(item);
            if (isOpen(card) && !isMatched(card)) {
                count++;
                if (count >= 2) {
                    break;
                }
            }
        }

        return count >= 2;
    }

    /**
     * gets the card string value of class that is attached to the i
     * @param {*} card card 
     */
    function getCardValue(card) {
        let result;
        const classList = card.children().first().prop("classList");

        for (const item of classList) {
            if (item.startsWith(appConstants.cardPrefix)) {
                result = item;
                break;
            }
        }

        return result;
    }

    /**
     * returns the last opened card
     */
    function getLastOpenedCard() {
        let result;

        if (!openCards || openCards.length === 0) {
            return null;
        }

        for (const item of openCards) {
            if (item.state === appConstants.open) {
                result = item;
                break;
            }
        }
        return result;
    }

    /**
     * adds the card and state to the opened card list
     * @param {*} state state of the card
     * @param {*} card card
     */
    function addToOpenedCards(state, card) {
        openCards.push({
            state: state,
            card: card
        });
    }

    /**
     * clear open cards
     */
    function clearOpenCards() {
        openCards.length = 0;
    }

    /**
     * animate the card
     * @param {*} card card
     */
    function animateCard(card) {
        card.animate({
            opacity: 0.4
        }, "medium");

        card.animate({
            opacity: 1
        }, "medium");
    }

    /**
     * timer is cleared and initialized
     */
    function initializeTimer() {
        timeElapsed = 0;

        if (timer) {
            clearInterval(timer);
        }

        timer = setInterval(function () {
            timeElapsed++;
            updateTimer(timeElapsed);
        }, appConstants.timerIntervalInms);        
    }

    function updateTimer(timeElapsedInSec) {
        timerText.text(timeElapsedInSec);
    }
    /**
     * This method returns the time elapsed in seconds.
     */
    function getTimeELapsedInSeconds() {
        return timeElapsed;
    }

    /**
     * checks when the game is finished
     */
    function isGameFinished() {
        let count = 0;

        for (const item of openCards) {
            if (item.state === appConstants.match) {
                count++;
            }
        }

        return count === appConstants.totalCount;
    }

    /**
     * This function initialize the application or game. 
     * Removes the cards from html
     * reset the counter
     * add the cards for a brand new game
     * sets the click event to each card
     */
    function initialize() {

        resetCounter();
        clearOpenCards();

        $(".deck").children().remove();

        const shuffledCards = shuffle(appConstants.cards);
        for (const item of shuffledCards) {
            addCard(item);
        }

        addEvents();
        initializeTimer();
        initializeStarRating();
        initModal();
    }

    /**
     * initializes the modal dialog
     */
    function initModal() {
        // Get the modal
        var modal = $('#myModal');
        var closeBtn = $('#closeBtnModal');

        $('#closeBtnModal').on("click", function () {
            modal.css({
                display: "none"
            });
            initialize();
        });

        window.onclick = function (event) {
            if (event.target == modal) {
                modal.css({
                    display: "none"
                });
            }
        }
    }

    /**
     * Card click handler 
     * @param {*} card the card html jquery item
     */
    function cardClickHandler(card) {

        if (isOpen(card) || isMatched(card) || isExistingCardPairOpen()) {
            return;
        }

        newOpenCard = !newOpenCard;

        incrementCounter();
        showSymbol(card);

        setTimeout(function () {
            let lastOpenedCard = getLastOpenedCard();

            if (!lastOpenedCard) {
                addToOpenedCards(appConstants.open, card);
                return;
            }

            const currentCardValue = getCardValue(card);
            const lastOpenedCardValue = getCardValue(lastOpenedCard.card);

            if (currentCardValue !== lastOpenedCardValue) {
                animateCard(card);
                animateCard(lastOpenedCard.card);

                hideSymbol(card);
                hideSymbol(lastOpenedCard.card);

                const index = openCards.indexOf(lastOpenedCard);
                if (index > -1) {
                    openCards.splice(index, 1);
                }

            } else {
                setMatch(card);
                setMatch(lastOpenedCard.card);

                animateCard(card);
                animateCard(lastOpenedCard.card);

                addToOpenedCards(appConstants.match, card);
                lastOpenedCard.state = appConstants.match;

                setTimeout(function () {

                    if (isGameFinished()) {
                        showCompletionMessage(getTimeELapsedInSeconds(), moveCounter, starRating);
                    }
                }, appConstants.completionMsgShowDelayInMs);

            }
        }, appConstants.timerIntervalInms);
    }

    /**
     * displays the completion message in modal dialog
     * @param {*} timeElapsed  time elapsed in seconds
     * @param {*} moves number of moves 
     * @param {*} starRating star rating
     */
    function showCompletionMessage(timeElapsed, moves, starRating) {

        clearInterval(timer);
        $("#msg").html(`Congratulations!! You took ${timeElapsed}
                        seconds and ${moves} moves to complete this game. 
                        Your star rating is ${starRating} star.`);

        var modal = $('#myModal');
        modal.css({
            display: "block"
        });
    }

    /*
     * set up the event listener for a card. If a card is clicked:
     *  - display the card's symbol (put this functionality in another function that you call from this one)
     *  - add the card to a *list* of "open" cards (put this functionality in another function that you call from this one)
     *  - if the list already has another card, check to see if the two cards match
     *    + if the cards do match, lock the cards in the open position (put this functionality in another function that you call from this one)
     *    + if the cards do not match, remove the cards from the list and hide the card's symbol (put this functionality in another function that you call from this one)
     *    + increment the move counter and display it on the page (put this functionality in another function that you call from this one)
     *    + if all cards have matched, display a message with the final score (put this functionality in another function that you call from this one)
     */
    function addEvents() {
        let cardItems = $(".card");

        for (const item of cardItems) {
            const card = $(item);
            card.on("click", function () {
                cardClickHandler(card);
            });
        }
    }

    /**
     * flip the card to show the symbol. adds the relevant css class
     * @param {*} card card html jquery element object
     */
    function isOpen(card) {
        return card.hasClass("open show");
    }

    /**
     * Checks whether the card is matched. Returns truw if yes else false.
     * @param {*} card 
     */
    function isMatched(card) {
        return card.hasClass("match");
    }

    /**
     * flip the card to show the symbol. adds the relevant css class
     * @param {*} card card html jquery element object
     */
    function showSymbol(card) {
        card.addClass("open show");
    }

    /**
     * set the card to match
     */
    function setMatch(card) {
        card.addClass("match");
    }
    /**
     * flip the card to hide the symbol. adds the relevant css class to hide.
     * @param {*} card card html jquery element object
     */
    function hideSymbol(card) {
        card.removeClass("open show");
    }

    /**
     * Increment the counter and updates the moves     
     */
    function incrementCounter() {
        if (!newOpenCard) {
            moveCounter++;
            $(".moves").text(moveCounter);
            updateStarRating();
        }
    }

    /**
     * update the star rating
     */
    function updateStarRating() {
        if (moveCounter === appConstants.numberOfMovesToChangeRating) {
            $(".stars").empty();
            $(".stars").append(starHtml);
            $(".stars").append(starHtml);
            starRating--;
        } else if (moveCounter === (appConstants.numberOfMovesToChangeRating * 2)) {
            $(".stars").empty();
            $(".stars").append(starHtml);
            starRating--;
        }
    }

    /**
     * Initialize star ratings
     */
    function initializeStarRating() {
        $(".stars").empty();
        $(".stars").append(starHtml);
        $(".stars").append(starHtml);
        $(".stars").append(starHtml);
        starRating = appConstants.initialStarRating;
    }
    /**
     * Resets the counter and updates the moves     
     */
    function resetCounter() {
        moveCounter = 0;
        $(".moves").text(moveCounter);
    }

    initialize();

    $(".restart").on("click", function () {
        initialize();
    });

});