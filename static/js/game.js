document.addEventListener('DOMContentLoaded', (event) => {
    const crabContainer = document.getElementById('crab');
    const habitats = document.getElementById('habitats');
    const questionContainer = document.getElementById('question');
    const validateButton = document.getElementById('validate');
    const timerBar = document.getElementById('timer');
    const resetButton = document.getElementById('reset');

    const crabList = [
        { name: 'Crabe violoniste', image: 'Crabe_violoniste.jpg' },
        { name: 'Crabe de terre', image: 'Crabe_de_terre.jpg' },
        { name: 'Crabe des palétuviers', image: 'Crabe_des_paletuviers.jpg' },
        { name: 'Crabe babette', image: 'Crabe_babette.jpg' },
        { name: 'Crabe noir', image: 'Crabe_noir.jpg' }
    ];
    const habitatList = ['Mangrove', 'Savane', 'Plage', 'Rivière'];
    let currentCrab, selectedHabitat, score = 0, attempts = 0, startTime, timer;
    let questionCount = 0;
    const QUESTION_TIME = 20;
    let isDragged = false;

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
            div.dataset.habitat = habitat;
            div.innerHTML = `
                <img src="/static/images/${habitat}.jpg" alt="${habitat}">
                <span class="habitat-name">${habitat}</span>
            `;
            habitats.appendChild(div);
        });
    }

    function getCorrectHabitat(crabName) {
        const matches = {
            'Crabe violoniste': 'Rivière',
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
        if (questionCount < 5 ) {
            currentCrab = crabList.shift();
            crabContainer.innerHTML = `
                <img src="/static/images/${currentCrab.image}" alt="${currentCrab.name}" class="crab-image">
            `;
            questionContainer.innerHTML = `
                <p class="glisser">Glissez le <span class="name">"${currentCrab.name}"</span> vers son environnement.</p>
            `;
            questionCount++;
            resetForm();
            displayThreeHabitats();
            isDragged = false;
            initDragAndDrop();
            startTimer();
        } else {
            endGame();
        }
    }

       function initDragAndDrop() {
        const crabImage = crabContainer.querySelector('img');
        let isDragging = false;
        let offsetX = 0, offsetY = 0;
    
        function startDrag(e) {
            e.preventDefault();
            isDragging = true;
            crabImage.style.pointerEvents = 'none'; 
    
            // Calculer l'offset entre le curseur et l'image
            const rect = crabImage.getBoundingClientRect();
            offsetX = (e.clientX || e.touches[0].clientX) - rect.left;
            offsetY = (e.clientY || e.touches[0].clientY) - rect.top;
    
            crabImage.style.position = 'absolute';
            crabImage.style.zIndex = 1000;
           // crabImage.style.pointerEvents = 'none'; // Éviter de bloquer les événements sous l'image
        }
    
        function drag(e) {
            if (!isDragging) return;
    
            e.preventDefault();
            const clientX = e.clientX || e.touches[0].clientX;
            const clientY = e.clientY || e.touches[0].clientY;
    
            crabImage.style.left = `${clientX - offsetX}px`;
            crabImage.style.top = `${clientY - offsetY}px`;
        }
    
        function endDrag(e) {
            crabImage.style.pointerEvents = 'auto';
            if (!isDragging) return;
            isDragging = false;
        
            // Restaurer les styles
            //crabImage.style.pointerEvents = 'auto';
        
            // Identifier la cible du drop
            const clientX = e.clientX || e.changedTouches[0]?.clientX;
            const clientY = e.clientY || e.changedTouches[0]?.clientY;
        
            const dropTarget = document.elementFromPoint(clientX, clientY);
        
            if (dropTarget) {
                console.log('Cible détectée :', dropTarget); // Debugging
            } else {
                console.error('Aucune cible détectée'); // Debugging
            }
        
            const habitats = document.querySelectorAll('.habitat');
            const detectedHabitat = detectHabitat(crabImage, habitats);
            
            if (detectedHabitat) {
                console.log(`Habitat détecté : ${detectedHabitat.dataset.habitat}`);
                drop(detectedHabitat);
            } else {
                console.log('Aucun habitat détecté, retour à la position initiale.');
                resetCrabPosition();
            }
            
        }
        
        
    
        function resetCrabPosition() {
            crabImage.style.position = 'static';
            crabImage.style.left = 'auto';
            crabImage.style.top = 'auto';
        }
    
        crabImage.addEventListener('mousedown', startDrag);
        crabImage.addEventListener('touchstart', startDrag, { passive: false });
    
        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag, { passive: false });
    
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);
    }

    function drop(habitat) {
        selectedHabitat = habitat.dataset.habitat;
        const img = document.createElement('img');
        img.src = crabContainer.querySelector('img').src;
        img.classList.add('dropped-crab');
        img.style.filter = 'none'; 
        img.style.position = 'absolute';
        img.style.top = '0px';
        img.style.right = '2px';
        img.style.left = 'auto';
        img.style.maxWidth = '30%';
        img.style.maxHeight = '100%';
        img.style.zIndex = '1000';
        img.style.webkitFilter = 'none';
        img.style.backdropFilter = 'none';
        img.style.imageRendering = 'crisp-edges';
        img.style.imageRendering = '-webkit-optimize-contrast';
        
        habitat.appendChild(img);
        habitat.classList.add('blur-background');
        habitat.style.filter = 'blur(3px)';
        validateButton.style.display = 'block';
        resetButton.style.display = 'none';
        crabContainer.querySelector('img').style.display = 'none';
        
        //isDragged = true;
        clearInterval(timer);
    }

    function detectHabitat(crab, habitats) {
        const crabRect = crab.getBoundingClientRect();
        for (const habitat of habitats) {
            const habitatRect = habitat.getBoundingClientRect();
            if (
                crabRect.right > habitatRect.left &&
                crabRect.left < habitatRect.right &&
                crabRect.bottom > habitatRect.top &&
                crabRect.top < habitatRect.bottom
            ) {
                return habitat;
            }
        }
        return null;
    }
    
    validateButton.addEventListener('click', () => {
        clearInterval(timer);
        if (checkMatch(currentCrab.name, selectedHabitat)) {
            score += 5;
            resetForm();
        } else {
            resetForm();
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
                    <source src="/static/videos/winq.mp4" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            `;
        }
        
    

        if (!isSuccess) {
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
            if (questionCount > 5) {
                endGame();
            }
        };

            
        if (isGameOver) {
            showNextCrab();
            modal.addEventListener('hidden.bs.modal', function () {
                window.location.href = '/start/';
            });
        } 

        if (!isGameOver) {
            nextButton.onclick = () => {
                const bootstrapModal = bootstrap.Modal.getInstance(modal);
                bootstrapModal.hide();
                showNextCrab();
            };
        }

        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
    }


    function showTimeUpModal() {
        showModal("Temps écoulé!", false, false, false);
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
            'Crabe violoniste': 'Rivière',
            'Crabe de terre': 'Savane',
            'Crabe des palétuviers': 'Mangrove',
            'Crabe babette': 'Mangrove',
            'Crabe noir': 'Plage'
        };

        if (matches[crab] === habitat) {
            showModal(`Bravo, vous avez trouvé l'habitat du <span class="vert">${crab}</span>!`, false, true, true);
            return true;
        } else {
            showModal(`Dommage, ce n'était pas le bon habitat. Le bon habitat pour le ${crab} est ${matches[crab]}.`, false, true);
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
            if (timeLeft > 0 && !isDragged) {
                timeLeft--;
                timerElement.textContent = timeLeft;
                const dashoffset = circumference * (1 - timeLeft / QUESTION_TIME);
                circle.style.strokeDashoffset = dashoffset;
            } else {
                clearInterval(timer);
                if (!isDragged) {
                    showTimeUpModal();
                }
            }
        }, 1000);
    }

    function endGame() {
        const timeTaken = Math.min(Math.round((Date.now() - startTime) / 1000), 75);
        
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
