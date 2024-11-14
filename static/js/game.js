document.addEventListener('DOMContentLoaded', (event) => {
    const crabContainer = document.getElementById('crab');
    const habitats = document.getElementById('habitats');
    const questionContainer = document.getElementById('question');
    const validateButton = document.getElementById('validate');
    const timerBar = document.getElementById('progress');
    const resetButton = document.getElementById('reset');

    const crabList = [
        { name: 'Crabe violoniste', image: 'Crabe_violoniste.jpg' },
        { name: 'Crabe de terre', image: 'Crabe_de_terre.jpg' },
        { name: 'Crabe des palétuviers', image: 'Crabe_des_paletuviers.jpg' },
        { name: 'Crabe babette', image: 'Crabe_babette.jpg' },
        { name: 'Crabe noir', image: 'Crabe_noir.jpg' }
    ];
    const habitatList = ['Mangrove', 'Savane', 'Plage', 'Eau douce'];
    let currentCrab, selectedHabitat, score = 0, attempts = 0, startTime, timer;
    let questionCount = 0;
    const QUESTION_TIME = 10;

    function startGame() {
        habitats.innerHTML = '';
        crabContainer.innerHTML = '';
        questionContainer.innerHTML = '';
        score = 0;
        attempts = 0;
        questionCount = 0;
        startTime = Date.now();

        shuffleArray(crabList);
        showNextCrab();
        startTimer();
    }

    function displayThreeHabitats() {
        habitats.innerHTML = '';
        const correctHabitat = getCorrectHabitat(currentCrab.name);
        const availableHabitats = habitatList.filter(h => h !== correctHabitat);
        shuffleArray(availableHabitats);
        const displayHabitats = [correctHabitat, ...availableHabitats.slice(0, 2)];
        shuffleArray(displayHabitats);

        displayHabitats.forEach(habitat => {
            const div = document.createElement('div');
            div.className = 'habitat';
            div.dataset.habitat = habitat; // Added dataset attribute to store habitat
            div.innerHTML = `
                <img src="/static/images/${habitat}.jpg" alt="${habitat}">
                <span>${habitat}</span>
            `;
            div.addEventListener('dragover', allowDrop);
            div.addEventListener('drop', drop);
            habitats.appendChild(div);
        });
    }

    function getCorrectHabitat(crabName) {
        const matches = {
            'Crabe violoniste': 'Eau douce',
            'Crabe de terre': 'Savane',
            'Crabe des palétuviers': 'Mangrove',
            'Crabe babette': 'Mangrove',
            'Crabe noir': 'Plage'
        };
        return matches[crabName];
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    
    function showNextCrab() {
        clearInterval(timer);
        if (questionCount < 6 && crabList.length > 0) {
            currentCrab = crabList.shift();
            crabContainer.innerHTML = `
                <img src="/static/images/${currentCrab.image}" alt="${currentCrab.name}" draggable="true" class="crab-image">
            `;
            questionContainer.innerHTML = `
                <p class="glisser">Glissez le <span class="name">"${currentCrab.name}"</span> vers son environnement.</p>
            `;
            crabContainer.querySelector('img').addEventListener('dragstart', drag);
            crabContainer.querySelector('img').addEventListener('touchstart', onTouchStart);
            validateButton.style.display = 'none';
            questionCount++;
            resetForm();
            displayThreeHabitats();
            isDragged = false;
            startTimer();
        } else {
            endGame();
        }
    }

    function allowDrop(ev) {
        ev.preventDefault();
    }

    let isDragged = false;

    function drag(ev) {
        ev.dataTransfer.setData("text", currentCrab.name);
        isDragged = true;
        clearInterval(timer);
    }

    function drop(ev) {
        ev.preventDefault();
        const habitat = ev.target.closest('.habitat');
        selectedHabitat = habitat.dataset.habitat;
    
        const img = document.createElement('img');
        img.src = `/static/images/${currentCrab.image}`;
        img.classList.add('dropped-crab');
        habitat.appendChild(img);
    
        habitat.classList.add('blur-background');
        validateButton.style.display = 'block';
        resetButton.style.display = 'block';
    
        crabContainer.querySelector('img').style.display = 'none';
        habitats.querySelectorAll('.habitat').forEach(h => {
            if (h !== habitat) {
                h.removeEventListener('dragover', allowDrop);
                h.removeEventListener('drop', drop);
            }
        });

        isDragged = true;
        clearInterval(timer);
    }
    

    function onTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const img = crabContainer.querySelector('img');
        img.style.position = 'absolute';
        img.style.zIndex = '1000';
    
        moveAt(touch.pageX, touch.pageY);
    
        function moveAt(pageX, pageY) {
            img.style.left = pageX - img.offsetWidth / 2 + 'px';
            img.style.top = pageY - img.offsetHeight / 2 + 'px';
        }
    
        function onTouchMove(e) {
            const touchMove = e.touches[0];
            moveAt(touchMove.pageX, touchMove.pageY);
        }
    
        function onTouchEnd(e) {
    document.removeEventListener('touchmove', onTouchMove);
    img.removeEventListener('touchend', onTouchEnd);

    // Vérification de la position de l'image par rapport aux habitats
    const habitats = document.querySelectorAll('.habitat');
    let dropped = false;

    habitats.forEach(habitat => {
        const habitatRect = habitat.getBoundingClientRect();
        const imgRect = img.getBoundingClientRect();

        // Vérifie si l'image est déposée sur l'habitat
        if (
            imgRect.left < habitatRect.right &&
            imgRect.right > habitatRect.left &&
            imgRect.top < habitatRect.bottom &&
            imgRect.bottom > habitatRect.top
        ) {
            dropped = true;

            // Applique l'effet de blur à l'habitat
            habitat.classList.add('blur-effect');

            // Logique de succès : transition de l'image, score, etc.
            // (à adapter selon la logique de ton jeu)
        }
    });

    if (!dropped) {
        // Logique si l'image n'est pas déposée sur un habitat valide
        // Par exemple, revenir à la position initiale ou afficher un message de "try again".
    }
}

    
        document.addEventListener('touchmove', onTouchMove);
        img.addEventListener('touchend', onTouchEnd);
    }
    
    validateButton.addEventListener('click', () => {
        clearInterval(timer);
        attempts++;
        if (checkMatch(currentCrab.name, selectedHabitat)) {
            score += 5;
            attempts = 0; 
            resetForm();
            showNextCrab();
        } else if (attempts >= 2) {
            resetForm();
            showNextCrab();
        }
        
    startTimer();
    });

    resetButton.addEventListener('click', () => {
        isDragged = false;
        resetForm();
        crabContainer.querySelector('img').style.display = 'block';
        displayThreeHabitats();
    });

    function resetForm() {
        habitats.querySelectorAll('.habitat').forEach(habitat => {
            habitat.innerHTML = habitat.textContent;
            habitat.addEventListener('dragover', allowDrop);
            habitat.addEventListener('drop', drop);
        });
        validateButton.style.display = 'none';
        resetButton.style.display = 'none';
    }

    function showModal(message, isGameOver = false, showFacts = false, isSuccess = false) {
        const modal = document.getElementById('gameModal');
        const modalTitle = modal.querySelector('.modal-title');
        const modalBody = modal.querySelector('.modal-body');
        const nextButton = document.getElementById('nextButton');

        modalTitle.textContent = isGameOver ? 'Fin du jeu' : '';
            
        let content = '';
        
        if (isSuccess) {
            content += `
                <video width="90%" height="260px" autoplay muted class="video">
                    <source src="/static/videos/failed.mp4" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            `;
        }
        
        if (!isSuccess && attempts >= 2) {
            message = `<span class="text-danger">${message}</span>`;
        }

        if (!isSuccess && attempts < 2) {
            content += `
            <div class="text-center">
                <img src="/static/images/triste.png" alt="triste" class="imglose">
            </div>
            `;
        }

        content += `<h5 class="text-center mt-3">${message}</h5>`;
        
        if (showFacts) {
            const facts = getCrabFacts(currentCrab.name);
            content += `
                <h4>Faits intéressants :</h4>
                <ul>
                    <li><strong>Habitat :</strong> ${facts.habitat}</li>
                    <li><strong>Description :</strong> ${facts.description}</li>
                    <li><strong>Lieux de vie :</strong> ${facts.livingPlaces}</li>
                    <li><strong>Habitudes :</strong> ${facts.habits}</li>
                </ul>
            `;
        }
        
        modalBody.innerHTML = content;

        nextButton.style.display = 'block';
        nextButton.onclick = () => {
            const bootstrapModal = bootstrap.Modal.getInstance(modal);
            bootstrapModal.hide();
            if (attempts >= 2 || isGameOver) {
                showNextCrab();
            }
        };

        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();

        if (isGameOver) {
            modal.addEventListener('hidden.bs.modal', function () {
                window.location.href = '/start/';
            });
        }
    }

    
    function getCrabFacts(crabName) {
        const facts = {
            'Crabe violoniste': {
                habitat: 'Mangroves, estuaires et zones intertidales.',
                description: 'Petit crabe avec une pince disproportionnée (chez les mâles), carapace de 2 à 4 cm. Pince orange ou rouge vif.',
                livingPlaces: 'Zones boueuses ou sablonneuses proches d\'eau douce ou saumâtre.',
                habits: 'Les mâles utilisent leur pince pour attirer les femelles. Creusent des terriers et se nourrissent de matière organique.'
            },
            'Crabe de terre': {
                habitat: 'Savanes et plaines inondées.',
                description: 'Crabe terrestre jusqu\'à 12 cm, carapace grise ou bleutée, pattes robustes.',
                livingPlaces: 'Vit près de l\'eau douce ou saumâtre, souvent proche des mangroves ou estuaires.',
                habits: 'Creuse des terriers, se reproduit près de la mer, principalement végétarien.'
            },
            'Crabe des palétuviers': {
                habitat: 'Mangroves.',
                description: 'Petit crabe arboricole, carapace verdâtre ou marron, 3 à 4 cm.',
                livingPlaces: 'Gravit sur les troncs et racines de mangroves.',
                habits: 'Grimpeur, passe la majeure partie de sa vie hors de l\'eau, se nourrit de feuilles, algues, et petits invertébrés.'
            },
            'Crabe babette': {
                habitat: 'Zones côtières et terres humides proches de l\'océan.',
                description: 'Carapace rougeâtre ou orangée, pinces violet foncé ou noires, 7 à 9 cm.',
                livingPlaces: 'Forêts tropicales humides, marais côtiers, se rapproche de la mer pour se reproduire.',
                habits: 'Nocturne, creuse des terriers, omnivore se nourrissant de feuilles, fruits et petits invertébrés.'
            },
            'Crabe noir': {
                habitat: 'Plages.',
                description: 'Crabe terrestre, carapace noire ou violet foncé, jusqu\'à 10 cm.',
                livingPlaces: 'Vit loin de l\'eau, dans des forêts humides ou mangroves, retourne à l\'eau pour se reproduire.',
                habits: 'Nocturne, herbivore se nourrissant de fruits, feuilles et matières végétales.'
            }
        };
        return facts[crabName];
    }
    
    function checkMatch(crab, habitat) {
        const matches = {
            'Crabe violoniste': 'Eau douce',
            'Crabe de terre': 'Savane',
            'Crabe des palétuviers': 'Mangrove',
            'Crabe babette': 'Mangrove',
            'Crabe noir': 'Plage'
        };

        if (matches[crab] === habitat) {
            showModal(`Bravo, vous avez trouvé l'habitat du <span class="vert">${crab}</span>!`, false, true, true);
            return true;
        } else {
            resetForm(); 
            displayThreeHabitats();
            if (attempts < 2) {
                showModal(`Mauvaise réponse ! Il ne vous reste plus qu'un essai.`, false, false);
            } else {
                showModal(`Dommage, ce n'était pas le bon habitat. Le bon habitat pour le ${crab} est ${matches[crab]}.`, false, true);
            }
            crabContainer.querySelector('img').style.display = 'block';
            return false;
        }
    }

    function startTimer() {
        clearInterval(timer);
        let timeLeft = QUESTION_TIME;
        const timerElement = document.getElementById('time-remaining');
        const circle = document.querySelector('#timer circle');
        const circumference = 2 * Math.PI * 18;
        circle.style.strokeDasharray = circumference;

        timer = setInterval(() => {
            if (timeLeft > 0&& !isDragged) {
                timeLeft--;
                timerElement.textContent = timeLeft;
                const dashoffset = circumference * (1 - timeLeft / QUESTION_TIME);
                circle.style.strokeDashoffset = dashoffset;
            } else if (isDragged) {
                clearInterval(timer);
            } else {
                clearInterval(timer);
                showNextCrab();
            }
        }, 1000);
    }

    function endGame() {
        clearInterval(timer);
        const timeTaken = questionCount * QUESTION_TIME - Math.floor(parseFloat(document.getElementById('progress').style.width) / 100 * QUESTION_TIME);
        
        let winPage;
        if (score === 25) {
            winPage = 'win25';
        } else if (score === 20) {
            winPage = 'win20';
        } else if (score === 15) {
            winPage = 'win15';
        } else if (score === 5) {
            winPage = 'win5';
        } else {
            winPage = 'win0';
        }
    
        // Redirect to the appropriate win page
        window.location.href = `/${winPage}/?time=${timeTaken}&score=${score}`;
    }

    startGame();
});
