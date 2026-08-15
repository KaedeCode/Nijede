const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var audioBuffer = null;
var activeSources = [];

var selectedNote = null;
var selectedBar = null;
var noteMenu = null;
var barMenu = null;
var redNote = null;
var tempSelectedBar = null;
var isPlaying = false;
var numNewBar = 0;

var sigT = 4;
var sigB = 4;

var playingTimeOut = [];

const notes = [
    { n: "C", b: 0 }, { n: "C#", b: 1 }, { n: "D", b: 0 }, { n: "D#", b: 1 }, 
    { n: "E", b: 0 }, { n: "F", b: 0 }, { n: "F#", b: 1 }, { n: "G", b: 0 }, 
    { n: "G#", b: 1 }, { n: "A", b: 0 }, { n: "A#", b: 1 }, { n: "B", b: 0 }
];

var chordMenu = null;
var currentChordNote = null;

async function loadNote(url) {
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    } catch (err) {
        console.error("Error loading sound:", err);
    }
}

function createPiano(instrument, startOctave, endOctave, clazzId, noteMenuu, barMenuu) {
    noteMenu = noteMenuu;
    barMenu = barMenuu;
    chordMenu = document.getElementById('chord-menu');

    loadNote("audio/C4_" + instrument + ".flac");
    
    for (let o = startOctave; o <= endOctave; o++) {
        notes.forEach((note, i) => {
            const key = document.createElement("div");
            key.className = `key ${note.b ? "black" : "white"}`;
            key.id = "key" + note.n + o;
            key.textContent = note.n + o;

            const semitones = (o - 4) * 12 + i;
            const rate = Math.pow(2, semitones / 12);

            key.onmousedown = () => {
                if (!audioBuffer) return;

                if (!document.getElementById("check").checked) {
                    activeSources.forEach(src => {
                        try { src.stop(); } catch (e) {}
                    });
                    activeSources = [];
                }

                try {
                    redNote.textContent = note.n + o;
                    redNote.dataset.value += note.n + o + " ";
                    updateNoteDisplay(redNote);

                    const parent = redNote.parentElement;
                    const bar = parent.parentElement; 
                    const rows = bar.querySelectorAll(".bar-row");
                    const topRow = rows[0];

                    const indexN = Array.from(topRow.children).indexOf(redNote);
                    if (indexN + 1 == topRow.children.length) {
                        const staff = bar.parentElement;
                        const indexB = Array.from(staff.children).indexOf(bar);
                        if (indexB + 1 != staff.children.length) {
                            const newRed = staff.children[indexB+1].querySelectorAll(".bar-row")[0].querySelectorAll(".note-item")[0];
                            redNote.style.color = "#000";
                            redNote = newRed;
                            redNote.style.color = "#ff0000";
                        } else {
                            redNote.style.color = "#000";
                            redNote = null;
                        }
                    } else {
                        const newRed = topRow.querySelectorAll(".note-item")[indexN+1];
                        redNote.style.color = "#000";
                        redNote = newRed;
                        redNote.style.color = "#ff0000";
                    }
                } catch {}

                if (audioCtx.state === "suspended") {
                    audioCtx.resume();
                }

                const src = audioCtx.createBufferSource();
                src.buffer = audioBuffer;
                src.playbackRate.value = rate;
                src.connect(audioCtx.destination);

                activeSources.push(src);
                src.onended = () => {
                    activeSources = activeSources.filter(s => s !== src);
                };
                src.start();
            };
            clazzId.appendChild(key);
        });
    }

    var tempo = document.getElementById("tempo");
    tempo.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '');
        let value = parseInt(this.value);
        let max = parseInt(this.getAttribute('max'));
        let min = parseInt(this.getAttribute('min'));
        if (value > max) this.value = max;
    });
    tempo.addEventListener('blur', function() {
        let value = parseInt(this.value);
        let min = parseInt(this.getAttribute('min'));
        if (isNaN(value) || value < min) this.value = min;
    });

    document.addEventListener('keydown', e => {
        if (selectedNote != null) {
            if (e.key == "s") noteMenuSplit();
            else if (e.key == "w") noteMenuMerge();
            else if (e.key == "a") addNoteForKey();
            else if (e.key == "d") delNoteFromKey();
            noteMenu.style.display = 'none';
            selectedNote = null;
        } else if (selectedBar != null) {
            if (e.key == "e") duplicateBar();
            else if (e.key == "r") deleteBar();
            else if (e.key == "ArrowRight") rightBar();
            else if (e.key == "ArrowLeft") leftBar();
            barMenu.style.display = 'none';
            selectedBar = null;
        }
        if (e.key == "t") addBar();
    });

    document.getElementById('chord-close-btn').addEventListener('click', function(e) {
        e.stopPropagation();
        closeChordMenu();
    });
}

function updateNoteDisplay(noteElement) {
    let names = noteElement.dataset.value.split(" ").filter(n => n.trim() !== "");
    if (names.length === 0) {
        noteElement.textContent = "*";
        noteElement.dataset.value = "";
    } else if (names.length === 1) {
        noteElement.textContent = names[0];
    } else {
        noteElement.textContent = names.length;
    }
}

function openChordMenu(noteElement, event) {
    currentChordNote = noteElement;
    let list = document.getElementById('chord-list');
    list.innerHTML = '';
    let noteNames = noteElement.dataset.value.split(" ").filter(n => n.trim() !== "");
    noteNames.forEach((name, index) => {
        let container = document.createElement('div');
        container.style.display = 'flex';
        container.style.justifyContent = 'space-between';
        container.style.alignItems = 'center';
        container.style.margin = '2px 0';
        let span = document.createElement('span');
        span.textContent = name;
        let delBtn = document.createElement('button');
        delBtn.textContent = '✕';
        delBtn.style.background = 'transparent';
        delBtn.style.border = 'none';
        delBtn.style.color = 'red';
        delBtn.style.cursor = 'pointer';
        delBtn.onclick = (e) => {
            e.stopPropagation();
            removeNoteFromChord(index);
        };
        container.appendChild(span);
        container.appendChild(delBtn);
        list.appendChild(container);
    });
    chordMenu.style.cssText = `display: flex; left: ${event.pageX}px; top: ${event.pageY}px;`;
    document.addEventListener('click', closeChordMenuOutside);
}

function closeChordMenuOutside(e) {
    if (!chordMenu.contains(e.target)) {
        closeChordMenu();
    }
    document.removeEventListener('click', closeChordMenuOutside);
}

function closeChordMenu() {
    chordMenu.style.display = 'none';
    currentChordNote = null;
    document.removeEventListener('click', closeChordMenuOutside);
}

function removeNoteFromChord(index) {
    if (!currentChordNote) return;
    let names = currentChordNote.dataset.value.split(" ").filter(n => n.trim() !== "");
    if (index >= 0 && index < names.length) {
        names.splice(index, 1);
        currentChordNote.dataset.value = names.join(" ") + (names.length > 0 ? " " : "");
        updateNoteDisplay(currentChordNote);
        let rect = chordMenu.getBoundingClientRect();
        let event = { pageX: rect.left, pageY: rect.top };
        openChordMenu(currentChordNote, event);
    }
}

function openChordFromNoteMenu() {
    if (!selectedNote) return;
    let names = selectedNote.dataset.value.split(" ").filter(n => n.trim() !== "");
    if (names.length <= 1) {
        document.getElementById('show-chord-btn').style.display = 'none';
        return;
    }
    noteMenu.style.display = 'none';
    const rect = selectedNote.getBoundingClientRect();
    let event = { pageX: rect.left + window.pageXOffset, pageY: rect.bottom + window.pageYOffset };
    openChordMenu(selectedNote, event);
    selectedNote = null;
}

function addBar() {
    const staff = document.getElementById("staff");
    const bar = document.createElement("div");
    bar.className = "bar";

    const text = document.createElement("b");
    text.id = "textOfBar";
    text.textContent = String(++numNewBar);
    bar.appendChild(text);

    const topRow = document.createElement("div");
    topRow.className = "bar-row"; 
    for (let i = 0; i < sigT; i++)
        createNoteElement(topRow, sigB);
    bar.appendChild(topRow);

    const bottomRow = document.createElement("div");
    bottomRow.className = "bar-row";
    for (let i = 0; i < sigT; i++) {
        const img = document.createElement("img");
        img.className = "sig-note-item";
        img.src = `images/stems/${sigB}.png`;
        img.alt = sigB;
        img.dataset.value = sigB;
        img.style.width = "30px";
        img.style.height = "auto";
        bottomRow.appendChild(img);
    }
    bar.appendChild(bottomRow);

    bar.onclick = (e) => {
        if (isPlaying) return;
        e.stopPropagation();
        selectedBar = bar;
        barMenu.style.cssText = `display: flex; left: ${e.pageX}px; top: ${e.pageY}px;`;
        document.addEventListener('click', () => barMenu.style.display = 'none', { once: true });
        noteMenu.style.display = 'none';
    };

    staff.insertBefore(bar, document.getElementById("BAddBar"));
}

function duplicateBar() {
    const staff = document.getElementById("staff");
    const bar = document.createElement("div");
    bar.className = "bar";

    const text = document.createElement("b");
    text.id = "textOfBar";
    bar.appendChild(text);

    const oldTop = selectedBar.querySelector(".bar-row");
    const topRow = oldTop.cloneNode(true); 
    
    topRow.querySelectorAll('.note-item').forEach(note => {
        note.onclick = (e) => {
            if (isPlaying) return;
            e.stopPropagation();
            selectedNote = note;
            if (note == redNote) {
                redNote = null;
                note.style.color = "#000";
                return;
            }
            noteMenu.style.cssText = `display: flex; left: ${e.pageX}px; top: ${e.pageY}px;`;
            document.addEventListener('click', () => noteMenu.style.display = 'none', { once: true });
            barMenu.style.display = 'none';

            let names = note.dataset.value.split(" ").filter(n => n.trim() !== "");
            const showBtn = document.getElementById('show-chord-btn');
            if (names.length > 1) {
                showBtn.style.display = 'inline-block';
            } else {
                showBtn.style.display = 'none';
            }
        };
    });
    bar.appendChild(topRow);

    const oldBottom = selectedBar.querySelectorAll(".bar-row")[1];
    const bottomRow = oldBottom.cloneNode(true);
    bar.appendChild(bottomRow);

    bar.onclick = (e) => {
        if (isPlaying) return;
        e.stopPropagation();
        selectedBar = bar;
        barMenu.style.cssText = `display: flex; left: ${e.pageX}px; top: ${e.pageY}px;`;
        document.addEventListener('click', () => barMenu.style.display = 'none', { once: true });
        noteMenu.style.display = 'none';
    };

    staff.insertBefore(bar, selectedBar);
    selectedBar = null;
    barMenu.style.display = 'none';

    updateNumBar();
}

function deleteBar() {
    selectedBar.remove();
    selectedBar = null;
    updateNumBar();
}

function rightBar() {
    let staff = document.getElementById("staff");
    let children = Array.from(staff.children);
    let index = children.indexOf(selectedBar);
    if (index == children.length - 2) return;
    staff.insertBefore(selectedBar, staff.children[index + 2]);
    barMenu.style.display = 'none';
    selectedBar = null;
    updateNumBar();
}

function leftBar() {
    let staff = document.getElementById("staff");
    let children = Array.from(staff.children);
    let index = children.indexOf(selectedBar);
    if (index == 1) return;
    staff.insertBefore(selectedBar, staff.children[index - 1]);
    barMenu.style.display = 'none';
    selectedBar = null;
    updateNumBar();
}

function startOfRepeat() {
    if (selectedBar.style.boxShadow == "black -5px 0px") {
        selectedBar.style.boxShadow = "";
        selectedBar = null;
        return;
    }
    if (selectedBar.style.boxShadow == "black 5px 0px") {
        selectedBar.removeAttribute("data-repeat-count");
        selectedBar.querySelector("#repeatsOfBar").remove();
    }
    selectedBar.style.boxShadow = "-5px 0px black";
    selectedBar = null;
}

function endOfRepeat() {
    if (selectedBar.style.boxShadow == "black 5px 0px") {
        selectedBar.style.boxShadow = "";
        selectedBar.removeAttribute("data-repeat-count");
        selectedBar.querySelector("#repeatsOfBar").remove();
        selectedBar = null;
        return;
    }
    if (selectedBar.style.boxShadow == "black -5px 0px")
        selectedBar.style.boxShadow = "";

    tempSelectedBar = selectedBar;
    const repeatMenu = document.getElementById("countRepeats");
    repeatMenu.style.cssText = `display: flex; left: ${selectedBar.getBoundingClientRect().left}px; top: ${selectedBar.getBoundingClientRect().top - 50}px;`;
    document.addEventListener('click', function closeMenu(e) {
        if (!repeatMenu.contains(e.target) && !e.target.closest('#bar-menu')) {
            repeatMenu.style.display = 'none';
            document.removeEventListener('click', closeMenu);
            tempSelectedBar = null;
        }
    });
    selectedBar = null;
}

function confirmRepeat() {
    const repeatMenu = document.getElementById("countRepeats");
    let count = parseInt(document.getElementById("repeatCount").value);
    if (isNaN(count) || count < 2) count = 2;
    if (tempSelectedBar) {
        tempSelectedBar.style.boxShadow = "5px 0px black";
        tempSelectedBar.dataset.repeatCount = count;
        const text = document.createElement("b");
        text.id = "repeatsOfBar";
        text.textContent = "X" + count;
        tempSelectedBar.appendChild(text);
        tempSelectedBar = null;
    }
    repeatMenu.style.display = 'none';
}

function cancelRepeat() {
    const repeatMenu = document.getElementById("countRepeats");
    repeatMenu.style.display = 'none';
    tempSelectedBar = null;
}

function updateNumBar() {
    numNewBar = 0;
    Array.from(document.getElementById("staff").children).forEach(child => {
        if (child.classList && child.classList.contains("bar"))
            child.querySelector("#textOfBar").textContent = String(++numNewBar);
    });
}

function noteMenuSplit() {
    if (!selectedNote) return;
    const val = +selectedNote.dataset.duration;
    if (val < 16) {
        const parent = selectedNote.parentElement;
        const bar = parent.parentElement; 
        const rows = bar.querySelectorAll(".bar-row");
        const topRow = rows[0];
        const bottomRow = rows[1];

        const nextVal = (val * 2).toString();
        const index = Array.from(topRow.children).indexOf(selectedNote);

        createNoteElement(topRow, nextVal, selectedNote);
        createNoteElement(topRow, nextVal, selectedNote);

        if (bottomRow) {
            const targetStick = bottomRow.children[index];
            const img1 = document.createElement("img");
            img1.className = "sig-note-item";
            img1.src = `images/stems/${nextVal}.png`;
            img1.alt = nextVal;
            img1.dataset.value = nextVal;
            img1.style.width = "30px";
            img1.style.height = "auto";
            bottomRow.insertBefore(img1, targetStick);

            const img2 = document.createElement("img");
            img2.className = "sig-note-item";
            img2.src = `images/stems/${nextVal}.png`;
            img2.alt = nextVal;
            img2.dataset.value = nextVal;
            img2.style.width = "30px";
            img2.style.height = "auto";
            bottomRow.insertBefore(img2, targetStick);
            
            if (targetStick) targetStick.remove();
        }
        selectedNote.remove();
    }
}

function noteMenuMerge() {
    if (!selectedNote) return;
    const val = +selectedNote.dataset.duration;
    if (val <= 1) return;

    const partner = [selectedNote.nextElementSibling, selectedNote.previousElementSibling]
        .find(el => el?.dataset.duration === selectedNote.dataset.duration);

    if (partner) {
        const topRow = selectedNote.parentElement;
        const bar = topRow.parentElement; 
        const bottomRow = bar.querySelectorAll(".bar-row")[1];

        const childrenArray = Array.from(topRow.children);
        const index1 = childrenArray.indexOf(selectedNote);
        const index2 = childrenArray.indexOf(partner);
        
        const prevVal = (val / 2).toString();
        const ref = (partner === selectedNote.nextElementSibling) ? selectedNote : partner;
        createNoteElement(topRow, prevVal, ref);
        
        if (bottomRow) {
            const firstIdx = Math.min(index1, index2);
            const secondIdx = Math.max(index1, index2);
            if (bottomRow.children[secondIdx]) bottomRow.children[secondIdx].remove();
            if (bottomRow.children[firstIdx]) bottomRow.children[firstIdx].remove();

            const stickRef = bottomRow.children[Math.min(index1, index2)];
            const img = document.createElement("img");
            img.className = "sig-note-item";
            img.src = `images/stems/${prevVal}.png`;
            img.alt = prevVal;
            img.dataset.value = prevVal;
            img.style.width = "30px";
            img.style.height = "auto";
            bottomRow.insertBefore(img, stickRef);
        }
        selectedNote.remove();
        partner.remove();
    }
}

function addNoteForKey() {
    if (!selectedNote) return;
    selectedNote.style.color = "#ff0000";
    try { redNote.style.color = "#000"; } catch {}
    redNote = selectedNote;
    selectedNote = null;
}

function delNoteFromKey() {
    if (!selectedNote) return;
    let names = selectedNote.dataset.value.split(" ").filter(n => n.trim() !== "");
    if (names.length > 0) {
        names.pop();
        selectedNote.dataset.value = names.join(" ") + (names.length > 0 ? " " : "");
        updateNoteDisplay(selectedNote);
    } else {
        selectedNote.textContent = "*";
    }
    selectedNote = null;
}

function CDTie() {
    if (!selectedNote) return;
    const topRow = selectedNote.parentElement;
    const bar = topRow.parentElement;
    const bottomRow = bar.querySelectorAll(".bar-row")[1];
    const childrenArray = Array.from(topRow.children);
    const index = childrenArray.indexOf(selectedNote);
    const stick = bottomRow.children[index];
    if (!stick) return;
    if (stick.dataset.tie === "true") {
        stick.style.border = "";
        stick.dataset.tie = "false";
    } else {
        stick.style.border = "2px solid red";
        stick.dataset.tie = "true";
    }
    selectedNote = null;
}

function playNoteByName(noteName) {
    if (!audioBuffer) return;
    if (audioCtx.state === "suspended") audioCtx.resume();

    const noteLetter = noteName.slice(0, -1);
    const octave = parseInt(noteName.slice(-1), 10);
    const noteObj = notes.find(n => n.n === noteLetter);
    if (!noteObj) return;

    const semitones = (octave - 4) * 12 + notes.indexOf(noteObj);
    const rate = Math.pow(2, semitones / 12);

    const src = audioCtx.createBufferSource();
    src.buffer = audioBuffer;
    src.playbackRate.value = rate;
    src.connect(audioCtx.destination);

    activeSources.push(src);
    src.onended = () => {
        activeSources = activeSources.filter(s => s !== src);
    };
    src.start();
}

function play() {
    let bars = document.querySelectorAll(".bar");
    if (bars.length == 0) return;

    if (redNote != null) {
        redNote.style.color = "#000";
        redNote = null;
    }

    if (isPlaying) {
        isPlaying = false;
        playingTimeOut.forEach(id => clearTimeout(id));
        playingTimeOut.length = 0;
        activeSources.forEach(src => { try { src.stop(); } catch (e) {} });
        activeSources = [];
        document.querySelectorAll(".note-item").forEach(note => note.style.color = "");
        document.getElementById("imgBPlay").src = "images/play.png";
        return;
    }

    isPlaying = true;
    document.getElementById("imgBPlay").src = "images/stop.png";

    let bpm = parseInt(document.getElementById("tempo").value) || 120;
    let quarterNoteTime = 60000 / bpm;
    let currentTime = 0;
    let repeats = [];

    for (let bar of bars) {
        let notes = bar.querySelector(".bar-row").querySelectorAll(".note-item");
        for (let i = 0; i < notes.length; i++) {
            let note = notes[i];
            let durationValue = parseInt(note.dataset.duration) || parseInt(note.textContent);
            let noteDuration = (4 / durationValue) * quarterNoteTime;

            let bottomRow = note.parentElement.parentElement.querySelectorAll(".bar-row")[1];
            let stick = bottomRow.children[i];
            let isTied = stick.dataset.tie === "true";

            playingTimeOut.push(setTimeout(() => {
                note.style.color = "red";
                let noteNames = note.dataset.value.split(" ").filter(n => n.trim() !== "");
                if (noteNames.length === 0) {
                    if (!isTied) {
                        activeSources.forEach(src => { try { src.stop(); } catch (e) {} });
                        activeSources = [];
                    }
                } else 
                    for (let noteName of noteNames) {
                        if (!isTied) playNoteByName(noteName);
                }
            }, currentTime));

            playingTimeOut.push(setTimeout(() => {
                note.style.color = "";
            }, currentTime + noteDuration));

            currentTime += noteDuration;
        }
        if (bar.style.boxShadow == "black -5px 0px") {
            repeats.push(Array.from(bars).indexOf(bar));
        }
        if (bar.style.boxShadow == "black 5px 0px") {
            if (repeats.length != 0) {
                let repeatCount = parseInt(bar.dataset.repeatCount) || 2;
                let l = Array.from(bars);
                let startIdx = repeats[repeats.length - 1];
                let endIdx = l.indexOf(bar) + 1;
                let repBars = l.slice(startIdx, endIdx);
                
                for (let r = 0; r < repeatCount - 1; r++) {
                    for (let b of repBars) {
                        let notesRep = b.querySelector(".bar-row").querySelectorAll(".note-item");
                        for (let i = 0; i < notesRep.length; i++) {
                            let note = notesRep[i];
                            let durationValue = parseInt(note.dataset.duration) || parseInt(note.textContent);
                            let noteDuration = (4 / durationValue) * quarterNoteTime;

                            let bottomRow = note.parentElement.parentElement.querySelectorAll(".bar-row")[1];
                            let stick = bottomRow.children[i];
                            let isTied = stick.dataset.tie === "true";

                            playingTimeOut.push(setTimeout(() => {
                                note.style.color = "red";
                                let noteNames = note.dataset.value.split(" ").filter(n => n.trim() !== "");
                                if (noteNames.length === 0) {
                                    if (!isTied) {
                                        activeSources.forEach(src => { try { src.stop(); } catch (e) {} });
                                        activeSources = [];
                                    }
                                } else {
                                    for (let noteName of noteNames)
                                        if (!isTied) playNoteByName(noteName);
                                }
                            }, currentTime));

                            playingTimeOut.push(setTimeout(() => {
                                note.style.color = "";
                            }, currentTime + noteDuration));

                            currentTime += noteDuration;
                        }
                    }
                }
                repeats.pop();
            }
        }
    }

    playingTimeOut.push(setTimeout(() => {
        activeSources.forEach(src => { try { src.stop(); } catch (e) {} });
        activeSources = [];
        isPlaying = false;
        document.getElementById("imgBPlay").src = "images/play.png";
    }, currentTime));
}

function createNoteElement(container, value, ref = null) {
    const span = document.createElement("span");
    span.className = "note-item";
    span.textContent = "*";
    span.dataset.value = ""; 
    span.dataset.duration = value;

    span.onclick = (e) => {
        if (isPlaying) return;
        e.stopPropagation();
        selectedNote = span;

        if (span == redNote) {
            redNote = null;
            span.style.color = "#000";
            return;
        }

        noteMenu.style.cssText = `display: flex; left: ${e.pageX}px; top: ${e.pageY}px;`;
        document.addEventListener('click', () => noteMenu.style.display = 'none', { once: true });
        barMenu.style.display = 'none';

        let names = span.dataset.value.split(" ").filter(n => n.trim() !== "");
        const showBtn = document.getElementById('show-chord-btn');
        if (names.length > 1) {
            showBtn.style.display = 'inline-block';
        } else {
            showBtn.style.display = 'none';
        }
    };

    container.insertBefore(span, ref);
}

function sigTop(num) {
    if (document.querySelectorAll(".bar").length != 0) return;
    let sig = Number(num.textContent, 10);
    if (sig < 9) {
        num.innerHTML = "&nbsp;" + String(sig+1);
        sigT++;
    } else if (sig < 16) {
        num.innerHTML = String(sig+1);
        sigT++;
    } else {
        num.innerHTML = "&nbsp;" + "2";
        sigT = 2;
    }
}

function sigBottom(num) {
    if (document.querySelectorAll(".bar").length != 0) return;
    let sig = Number(num.textContent, 10);
    if (sig < 8){
        num.innerHTML = "&nbsp;" + String(sig * 2);
        sigB *= 2;
    } else if (sig == 8){
        num.innerHTML = String(sig * 2);
        sigB *= 2;
    } else {
        num.innerHTML = "&nbsp;" + "2";
        sigB = 2;
    }
}