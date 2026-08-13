class Novel {
    constructor() {
        this.isVisible = false;
        this.dialogs = [];
        this.currentIndex = 0;
        this.typingInterval = null;
        this.isTyping = false;
        this.fullText = '';
        this.TYPING_SPEED = 30;
        this.hideTimer = null;
        this.bgWasPlaying = false;
        this.activeAudioCount = 0;
        
        const isNijika = window.location.pathname.includes('nijika.html');
        this.spriteBasePath = isNijika 
            ? '../assets/images/sprites/nijika/' 
            : '../assets/images/sprites/kaede/';
        
        this.hasChoices = false;    
        this.tempAudio = null;         
        this.tempImageElement = null;     
        this.tempAudio = new Audio();  
        this.tempAudio.preload = 'auto'; 

        this.initDOM();
    }

    initDOM() {
        if (document.getElementById('novel-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'novel-overlay';
        overlay.className = 'novel-overlay';
        overlay.innerHTML = `
            <div class="novel-container">
                <div class="novel-character">
                    <img class="novel-sprite" id="novel-sprite" src="" alt="Персонаж" draggable="false">
                </div>
                <div class="novel-dialog" id="novel-dialog">
                    <p class="novel-text" id="novel-text"></p>
                    <div class="novel-choices" id="novel-choices" style="display: none;"></div>
                </div>
                <div class="novel-close" id="novel-close">✕</div>
            </div>
            <img class="novel-temp-image" id="novel-temp-image">
        `;
        document.body.appendChild(overlay);

        this.overlay = overlay;
        this.dialogDiv = document.getElementById('novel-dialog');
        this.textElement = document.getElementById('novel-text');
        this.spriteElement = document.getElementById('novel-sprite');
        this.closeBtn = document.getElementById('novel-close');
        this.choicesContainer = document.getElementById('novel-choices');
        this.tempImageElement = document.getElementById('novel-temp-image');

        this.dialogDiv.addEventListener('click', (e) => {
            if (this.hasChoices) return;
            if (e.target === this.choicesContainer || this.choicesContainer.contains(e.target)) return;
            this.next();
        });

        this.closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.hide();
        });

        this.overlay.addEventListener('click', (e) => {
            if (e.target.closest('.novel-dialog, .novel-close, .novel-character')) return;
            if (this.hasChoices) return;
            this.next();
        });
    }

    showTempImage(url) {
        if (!url) return;
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
            this.hideTimer = null;
        }
        this.tempImageElement.src = url;
        this.tempImageElement.classList.add('show');
    }

    hideTempImage() {
        this.tempImageElement.classList.remove('show');
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
            this.hideTimer = null;
        }
        this.hideTimer = setTimeout(() => {
            this.tempImageElement.src = '';
            this.hideTimer = null;
        }, 300);
    }

    playTempAudio(url) {
        if (!url) return;
        this.stopTempAudio();
        this.tempAudio.src = url;
        this.tempAudio.load();
        
        const bgMusic = document.querySelector("#bgMusic");
        if (this.activeAudioCount === 0 && bgMusic && !bgMusic.paused) {
            bgMusic.pause();
            this.bgWasPlaying = true;
        }
        this.activeAudioCount++;
        
        this.tempAudio.onended = () => {
            this.activeAudioCount--;
            if (this.activeAudioCount === 0 && this.bgWasPlaying) {
                const bg = document.querySelector("#bgMusic");
                if (bg) bg.play().catch(() => {});
                this.bgWasPlaying = false;
            }
            this.tempAudio.onended = null;
        };
        
        this.tempAudio.play().catch(e => console.warn('Audio play failed:', e));
    }

    stopTempAudio() {
        if (this.tempAudio) {
            this.tempAudio.pause();
            this.tempAudio.currentTime = 0;
            if (this.tempAudio.onended) {
                this.tempAudio.onended = null;
            }
            if (this.activeAudioCount > 0) {
                this.activeAudioCount--;
                if (this.activeAudioCount === 0 && this.bgWasPlaying) {
                    const bg = document.querySelector("#bgMusic");
                    if (bg) bg.play().catch(() => {});
                    this.bgWasPlaying = false;
                }
            }
        }
    }
    
    show(dialogs) {
        if (!dialogs || dialogs.length === 0) return;
        this.dialogs = dialogs;
        this.currentIndex = 0;
        this.isVisible = true;
        this.overlay.style.display = 'flex';
        this.showCurrentDialog();
    }

    hide() {
        if (!this.isVisible) return;
        this.stopTyping();
        if (this.bgWasPlaying) {
            const bg = document.querySelector("#bgMusic");
            if (bg) bg.play().catch(() => {});
            this.bgWasPlaying = false;
            this.activeAudioCount = 0;
        }
        this.isVisible = false;
        this.hasChoices = false;
        this.overlay.style.display = 'none';
        this.dialogs = [];
        this.currentIndex = 0;
        this.hideTempImage();
        this.stopTempAudio();
        this.clearChoices();
    }

    clearChoices() {
        this.choicesContainer.innerHTML = '';
        this.choicesContainer.style.display = 'none';
        this.hasChoices = false;
    }

    showCurrentDialog() {
        if (!this.isVisible) return;
        const step = this.dialogs[this.currentIndex];
        if (!step) {
            this.hide();
            return;
        }

        if (step.image) {
            this.showTempImage(step.image);
        } else {
            this.hideTempImage();
        }

        if (step.audio) {
            this.playTempAudio(step.audio);
        } else {
            this.stopTempAudio();
        }

        this.updateSprite(step.sprite);

        if (step.type === 'choice' && step.choices && step.choices.length) {
            this.hasChoices = true;
            this.textElement.textContent = step.text;
            this.textElement.style.display = 'block';
            void this.textElement.offsetHeight;
            this.stopTyping();
            this.showChoiceButtons(step.choices);
        } else {
            this.hasChoices = false;
            this.clearChoices();
            this.startTypewriter(step.text);
        }
    }

    showChoiceButtons(choices) {
        this.choicesContainer.innerHTML = '';
        this.choicesContainer.style.display = 'flex';
        choices.forEach(choice => {
            const btn = document.createElement('button');
            btn.className = 'novel-choice-btn';
            btn.textContent = choice.text;
            btn.addEventListener('click', () => {
                if (choice.nextDialogs && choice.nextDialogs.length) {
                    this.show(choice.nextDialogs);
                } else {
                    this.next(); 
                }
            });
            this.choicesContainer.appendChild(btn);
        });
    }

    updateSprite(spriteFile) {
        if (!spriteFile) {
            this.spriteElement.style.display = 'none';
            return;
        }
        this.spriteElement.style.display = 'block';
        const newSrc = this.spriteBasePath + spriteFile;
        if (this.spriteElement.src !== newSrc) {
            this.spriteElement.src = newSrc;
        }
        this.spriteElement.classList.add('novel-sprite-animate');
        setTimeout(() => {
            this.spriteElement.classList.remove('novel-sprite-animate');
        }, 350);
    }

    startTypewriter(text) {
        this.stopTyping();
        this.fullText = text;
        this.textElement.textContent = '';
        if (!text) return;

        this.isTyping = true;
        let pos = 0;
        this.typingInterval = setInterval(() => {
            if (pos < this.fullText.length) {
                this.textElement.textContent += this.fullText[pos];
                pos++;
            } else {
                this.stopTyping();
            }
        }, this.TYPING_SPEED);
    }

    stopTyping() {
        if (this.typingInterval) {
            clearInterval(this.typingInterval);
            this.typingInterval = null;
        }
        this.isTyping = false;
    }

    showFullText() {
        this.stopTyping();
        this.textElement.textContent = this.fullText;
    }

    next() {
        if (!this.isVisible) return;
        if (this.hasChoices) return; 
        if (this.isTyping) {
            this.showFullText();
            return;
        }
        if (this.currentIndex + 1 < this.dialogs.length) {
            this.currentIndex++;
            this.showCurrentDialog();
        } else {
            this.hide();
        }
    }
}

window.novel = new Novel();