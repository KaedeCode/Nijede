var sigT = 4;
var sigB = 4;

var selectedNote = null;
var selectedBar = null;

var numNewBar = 0;

var isPlaying = false;
var playingTimeOut = [];

/*
0 - bass drum
1 - crash
2 - ride
3 - snare
4 - cHH
5 - oHH
6 - pHH
7 - lTom
8 - mTom
9 - hTom
*/

function createDrums() {
    document.addEventListener('keydown', e => {
        if (selectedNote != null) {
            if (e.key == "s")
                noteMenuSplit();
            else if (e.key == "w")
                noteMenuMerge();
            else if (e.key == "a")
                addNote();
            else if (e.key == "d")
                delNote();
        } else if (selectedBar != null) {
            if (e.key == "e")
                duplicateBar();
            else if (e.key == "r")
                deleteBar();
            else if (e.key == "ArrowRight")
                rightBar();
            else if (e.key == "ArrowLeft")
                leftBar();
        }
        if (e.key == "t") 
            addBar();
    });
}

function addBar() {
    let staff = document.getElementById("staff");
    let bar = document.createElement("div");
    bar.className = "bar";

    let text = document.createElement("b");
    text.id = "textOfBar";
    text.textContent = String(++numNewBar);
    text.addEventListener('click', (e) => {
        e.stopPropagation();
        let menu = document.querySelector(".bar-popup");
        if (menu) {
            menu.style.cssText = `display: flex; left: ${e.pageX}px; top: ${e.pageY}px;`;
            document.addEventListener('click', () => menu.style.display = 'none', { once: true });

            selectedBar = bar;

            document.querySelector(".note-popup").style.display = 'none';
        }
    });
    bar.appendChild(text);

    let bg = document.createElement("img");
    bg.className = "imgBar";
    bg.src = "images/barOfStaff.png";
    bar.appendChild(bg);

    for (let i = 1; i < 9; i++) {
        let row = document.createElement("div");
        row.className = `bar-${i}row`;
        row.dataset.value = "";
        for (let j = 0; j < sigT; j++) {
            let note = document.createElement("img");
            note.className = "note";
            note.addEventListener('click', e => {
                e.stopPropagation()
                let menu = document.querySelector(".note-popup");
                if (menu) {
                    menu.style.cssText = `display: flex; left: ${e.pageX}px; top: ${e.pageY}px;`;
                    document.addEventListener('click', () => menu.style.display = 'none', { once: true });

                    selectedNote = note;

                    document.querySelector(".bar-popup").style.display = 'none';
                }
            });
            if (i == 6)
                note.src = `images/notes/${sigB}pause.png`;
            else 
                note.src = `images/notes/empty.png`;
            row.dataset.value = row.dataset.value + String(Math.log2(sigB)) + " ";
            row.appendChild(note);
        }
        bar.appendChild(row);
    }
    let end = document.createElement("div");
    end.className = "bar-row";
    for (let j = 0; j < sigT; j++) {
        let note = document.createElement("img");
        note.className = "note";
        note.addEventListener('click', e => {
            e.stopPropagation();
            let menu = document.querySelector(".note-popup");
            if (menu) {
                menu.style.cssText = `display: flex; left: ${e.pageX}px; top: ${e.pageY}px;`;
                document.addEventListener('click', () => menu.style.display = 'none', { once: true });
                
                selectedNote = note;
            }
        });
        note.src = `images/notes/empty.png`;
        end.dataset.value = end.dataset.value + String(Math.log2(sigB)) + " ";
        end.appendChild(note);
    }
    bar.appendChild(end);

    staff.insertBefore(bar, document.getElementById("BAddBar"));
}

function noteMenuSplit() {
    let row = selectedNote.parentElement;
    let bar = row.parentElement;
    let staff = bar.parentElement;

    let indexOfNote = Array.from(row.children).indexOf(selectedNote);

    row.dataset.value = row.dataset.value.replace("undefined", "");

    if (row.dataset.value.split(" ")[indexOfNote] == 4)
        return

    let newDur = parseInt(row.dataset.value.split(" ")[indexOfNote])+1;

    for (let i = 0; i < 8; i++) {
        let r = bar.children[i+2]

        let noteInRow = r.children[indexOfNote];
        let l = r.children[indexOfNote]
        for (let j = 0; j < 2; j++) {
            let note = document.createElement("img");
            note.className = "note";
            note.addEventListener('click', e => {
                e.stopPropagation()
                let menu = document.querySelector(".note-popup");
                if (menu) {
                    menu.style.cssText = `display: flex; left: ${e.pageX}px; top: ${e.pageY}px;`;
                    document.addEventListener('click', () => menu.style.display = 'none', { once: true });
                    
                    selectedNote = note;
                }
            });
            let o = noteInRow.src.split("/");
            if (o[o.length-1] != "empty.png")
                note.src = `images/notes/${2**newDur}${o[o.length-1].slice(1)}`;
            else
                note.src = "images/notes/empty.png";
            r.insertBefore(note, l);
        }
        l.remove();

        r.dataset.value = insertAtIndex(r.dataset.value, String(newDur) + " ", indexOfNote*2);
        r.dataset.value = insertAtIndex(r.dataset.value, String(newDur) + " ", indexOfNote*2);
        r.dataset.value = r.dataset.value.slice(0, indexOfNote*2+4) + r.dataset.value.slice(indexOfNote*2+6);
    }

    let r = bar.children[bar.children.length-1];

    let noteInRow = r.children[indexOfNote];
    let l = r.children[indexOfNote]
    for (let j = 0; j < 2; j++) {
        let note = document.createElement("img");
        note.className = "note";
        note.addEventListener('click', e => {
            e.stopPropagation()
            let menu = document.querySelector(".note-popup");
            if (menu) {
                menu.style.cssText = `display: flex; left: ${e.pageX}px; top: ${e.pageY}px;`;
                document.addEventListener('click', () => menu.style.display = 'none', { once: true });
                
                selectedNote = note;
            }
        });
        if (noteInRow.src != "") 
            note.src = `images/notes/empty.png`;
        r.insertBefore(note, l);
    }
    l.remove();

    r.dataset.value = insertAtIndex(r.dataset.value, String(newDur) + " ", indexOfNote*2);
    r.dataset.value = insertAtIndex(r.dataset.value, String(newDur) + " ", indexOfNote*2);
    r.dataset.value = r.dataset.value.slice(0, indexOfNote*2+4) + r.dataset.value.slice(indexOfNote*2+6);

    selectedNote = null;
    document.querySelector(".note-popup").style.display = 'none';
}
function noteMenuMerge() {
    let row = selectedNote.parentElement;
    let bar = row.parentElement;
    let staff = bar.parentElement;

    let indexOfNote = Array.from(row.children).indexOf(selectedNote);

    row.dataset.value = row.dataset.value.replace("undefined", "");

    if (row.dataset.value.split(" ")[indexOfNote] == 0 || row.dataset.value.split(" ")[indexOfNote] != row.dataset.value.split(" ")[indexOfNote+1])
        return

    let newDur = parseInt(row.dataset.value.split(" ")[indexOfNote])-1;

    for (let i = 0; i < 8; i++) {
        let r = bar.children[i+2]

        let noteInRow = r.children[indexOfNote];
        let l = r.children[indexOfNote]

        let note = document.createElement("img");
        note.className = "note";
        note.addEventListener('click', e => {
            e.stopPropagation()
            let menu = document.querySelector(".note-popup");
            if (menu) {
                menu.style.cssText = `display: flex; left: ${e.pageX}px; top: ${e.pageY}px;`;
                document.addEventListener('click', () => menu.style.display = 'none', { once: true });
                
                selectedNote = note;
            }
        });
        let o = noteInRow.src.split("/");
        if (o[o.length-1] != "empty.png") {
            if (o[o.length-1][1] == "6")
                note.src = `images/notes/${2**newDur}${o[o.length-1].slice(2)}`;
            else
                note.src = `images/notes/${2**newDur}${o[o.length-1].slice(1)}`;
        } else 
            note.src = `images/notes/empty.png`;
        r.insertBefore(note, l);
        l.remove();
        r.children[indexOfNote+1].remove();

        
        r.dataset.value = insertAtIndex(r.dataset.value, String(newDur) + " ", indexOfNote*2);
        r.dataset.value = r.dataset.value.slice(0, indexOfNote*2+2) + r.dataset.value.slice(indexOfNote*2+6);
    }

    let r = bar.children[bar.children.length-1];

    let noteInRow = r.children[indexOfNote];
    let l = r.children[indexOfNote]

    let note = document.createElement("img");
    note.className = "note";
    note.addEventListener('click', e => {
        e.stopPropagation()
        let menu = document.querySelector(".note-popup");
        if (menu) {
            menu.style.cssText = `display: flex; left: ${e.pageX}px; top: ${e.pageY}px;`;
            document.addEventListener('click', () => menu.style.display = 'none', { once: true });
            
            selectedNote = note;
        }
    });
    if (noteInRow.src != "") 
        note.src = `images/notes/empty.png`;
    r.insertBefore(note, l);
    l.remove();
    r.children[indexOfNote+1].remove();

    r.dataset.value = insertAtIndex(r.dataset.value, String(newDur) + " ", indexOfNote*2);
    r.dataset.value = r.dataset.value.slice(0, indexOfNote*2+2) + r.dataset.value.slice(indexOfNote*2+6);

    selectedNote = null;
    document.querySelector(".note-popup").style.display = 'none';
}
function addNote() {
    let overlay = document.querySelector(".overlay");
    let clue = document.querySelector(".clue");
    clue.style.display = "flex";
    overlay.style.opacity = "0.5";
    overlay.inert = true;   

    document.addEventListener('keydown', (e) => {
        let row = selectedNote.parentElement;
        let bar = row.parentElement;
        let staff = bar.parentElement;
        let indexOfNote = Array.from(row.children).indexOf(selectedNote);

        if (e.key == "0") {
            let rrow = bar.children[6+2];
            let note = rrow.children[indexOfNote]

            note.src = `images/notes/${2**rrow.dataset.value.split(" ")[indexOfNote]}base.png`;

            let prow = bar.children[7].children[indexOfNote];
            let l = prow.src.split("/");
            if (l[l.length-1].slice(1) == "pause.png" || l[l.length-1].slice(2) == "pause.png")
                prow.src = "images/notes/empty.png";
        } else if (e.key == "1") {
            let rrow = bar.children[2];
            let note = rrow.children[indexOfNote]

            note.src = `images/notes/${2**rrow.dataset.value.split(" ")[indexOfNote]}plate.png`;

            let prow = bar.children[7].children[indexOfNote];
            let l = prow.src.split("/");
            if (l[l.length-1].slice(1) == "pause.png" || l[l.length-1].slice(2) == "pause.png")
                prow.src = "images/notes/empty.png";
        } else if (e.key == "2") {
            let rrow = bar.children[1+2];
            let note = rrow.children[indexOfNote]

            note.src = `images/notes/${2**rrow.dataset.value.split(" ")[indexOfNote]}plate.png`;

            let prow = bar.children[7].children[indexOfNote];
            let l = prow.src.split("/");
            if (l[l.length-1].slice(1) == "pause.png" || l[l.length-1].slice(2) == "pause.png")
                prow.src = "images/notes/empty.png";
        } else if (e.key == "3") {
            let rrow = bar.children[3+2];
            let note = rrow.children[indexOfNote]

            note.src = `images/notes/${2**rrow.dataset.value.split(" ")[indexOfNote]}base.png`;

            let prow = bar.children[7].children[indexOfNote];
            let l = prow.src.split("/");
            if (l[l.length-1].slice(1) == "pause.png" || l[l.length-1].slice(2) == "pause.png")
                prow.src = "images/notes/empty.png";
        } else if (e.key == "4") {
            let rrow = bar.children[1+2];
            let note = rrow.children[indexOfNote]

            note.src = `images/notes/${2**rrow.dataset.value.split(" ")[indexOfNote]}HH.png`;

            let prow = bar.children[7].children[indexOfNote];
            let l = prow.src.split("/");
            if (l[l.length-1].slice(1) == "pause.png" || l[l.length-1].slice(2) == "pause.png")
                prow.src = "images/notes/empty.png";
        } else if (e.key == "5") {
            let rrow = bar.children[1+2];
            let note = rrow.children[indexOfNote]

            note.src = `images/notes/${2**rrow.dataset.value.split(" ")[indexOfNote]}OHH.png`;

            let prow = bar.children[7].children[indexOfNote];
            let l = prow.src.split("/");
            if (l[l.length-1].slice(1) == "pause.png" || l[l.length-1].slice(2) == "pause.png")
                prow.src = "images/notes/empty.png";
        } else if (e.key == "6") {
            let rrow = bar.children[7+2];
            let note = rrow.children[indexOfNote]

            note.src = `images/notes/${2**rrow.dataset.value.split(" ")[indexOfNote]}HH.png`;

            let prow = bar.children[7].children[indexOfNote];
            let l = prow.src.split("/");
            if (l[l.length-1].slice(1) == "pause.png" || l[l.length-1].slice(2) == "pause.png")
                prow.src = "images/notes/empty.png";
        } else if (e.key == "7") {
            let rrow = bar.children[6+2];
            let note = rrow.children[indexOfNote]

            note.src = `images/notes/${2**rrow.dataset.value.split(" ")[indexOfNote]}base.png`;

            let prow = bar.children[7].children[indexOfNote];
            let l = prow.src.split("/");
            if (l[l.length-1].slice(1) == "pause.png" || l[l.length-1].slice(2) == "pause.png")
                prow.src = "images/notes/empty.png";
        } else if (e.key == "8") {
            let rrow = bar.children[5+2];
            let note = rrow.children[indexOfNote]

            note.src = `images/notes/${2**rrow.dataset.value.split(" ")[indexOfNote]}base.png`;

            let prow = bar.children[7].children[indexOfNote];
            let l = prow.src.split("/");
            if (l[l.length-1].slice(1) == "pause.png" || l[l.length-1].slice(2) == "pause.png")
                prow.src = "images/notes/empty.png";
        } else if (e.key == "9") {
            let rrow = bar.children[4+2];
            let note = rrow.children[indexOfNote]

            note.src = `images/notes/${2**rrow.dataset.value.split(" ")[indexOfNote]}base.png`;

            let prow = bar.children[7].children[indexOfNote];
            let l = prow.src.split("/");
            if (l[l.length-1].slice(1) == "pause.png" || l[l.length-1].slice(2) == "pause.png")
                prow.src = "images/notes/empty.png";
        } else if (e.key == "-") {
            let rrow = bar.children[3+2];
            let note = rrow.children[indexOfNote]

            note.src = `images/notes/${2**rrow.dataset.value.split(" ")[indexOfNote]}HH.png`;

            let prow = bar.children[7].children[indexOfNote];
            let l = prow.src.split("/");
            if (l[l.length-1].slice(1) == "pause.png" || l[l.length-1].slice(2) == "pause.png")
                prow.src = "images/notes/empty.png";
        } else if (e.key == "=") {
            let rrow = bar.children[2];
            let note = rrow.children[indexOfNote]

            note.src = `images/notes/${2**rrow.dataset.value.split(" ")[indexOfNote]}HH.png`;

            let prow = bar.children[7].children[indexOfNote];
            let l = prow.src.split("/");
            if (l[l.length-1].slice(1) == "pause.png" || l[l.length-1].slice(2) == "pause.png")
                prow.src = "images/notes/empty.png";
        }

        clue.style.display = "none";
        overlay.style.opacity = "1";
        overlay.inert = false;

        selectedNote = null;
    }, { once: true });

    document.querySelector(".note-popup").style.display = 'none';
}
function delNote() {
    let overlay = document.querySelector(".overlay");
    let clue = document.querySelector(".clue");
    clue.style.display = "flex";
    overlay.style.opacity = "0.5";
    overlay.inert = true;

    document.addEventListener('keydown', (e) => {
        let row = selectedNote.parentElement;
        let bar = row.parentElement;
        let staff = bar.parentElement;
        let indexOfNote = Array.from(row.children).indexOf(selectedNote);

        if (e.key == "0") {
            let rrow = bar.children[6+2];
            let note = rrow.children[indexOfNote]

            note.src = `images/notes/empty.png`;

            let p = true;
            for (let i = 0; i < 8; i++) {
                let r = bar.children[i+2];
                let l = r.children[indexOfNote].src.split("/");
                if (l[l.length-1] != "empty.png")
                    p = false;
            }

            let prow = bar.children[7];
            if (p)
                prow.children[indexOfNote].src = `images/notes/${2**prow.dataset.value.split(" ")[indexOfNote]}pause.png`;
        } else if (e.key == "1") {
            let rrow = bar.children[2];
            let note = rrow.children[indexOfNote]

            note.src = `images/notes/empty.png`;

            let p = true;
            for (let i = 0; i < 8; i++) {
                let r = bar.children[i+2];
                let l = r.children[indexOfNote].src.split("/");
                if (l[l.length-1] != "empty.png")
                    p = false;
            }

            let prow = bar.children[7];
            if (p)
                prow.children[indexOfNote].src = `images/notes/${2**prow.dataset.value.split(" ")[indexOfNote]}pause.png`;
        } else if (e.key == "2") {
            let rrow = bar.children[1+2];
            let note = rrow.children[indexOfNote]

            note.src = `images/notes/empty.png`;

            let p = true;
            for (let i = 0; i < 8; i++) {
                let r = bar.children[i+2];
                let l = r.children[indexOfNote].src.split("/");
                if (l[l.length-1] != "empty.png")
                    p = false;
            }

            let prow = bar.children[7];
            if (p)
                prow.children[indexOfNote].src = `images/notes/${2**prow.dataset.value.split(" ")[indexOfNote]}pause.png`;
        } else if (e.key == "3") {
            let rrow = bar.children[3+2];
            let note = rrow.children[indexOfNote]

            note.src = `images/notes/empty.png`;

            let p = true;
            for (let i = 0; i < 8; i++) {
                let r = bar.children[i+2];
                let l = r.children[indexOfNote].src.split("/");
                if (l[l.length-1] != "empty.png")
                    p = false;
            }

            let prow = bar.children[7];
            if (p)
                prow.children[indexOfNote].src = `images/notes/${2**prow.dataset.value.split(" ")[indexOfNote]}pause.png`;
        } else if (e.key == "4") {
            let rrow = bar.children[1+2];
            let note = rrow.children[indexOfNote]

            note.src = `images/notes/empty.png`;

            let p = true;
            for (let i = 0; i < 8; i++) {
                let r = bar.children[i+2];
                let l = r.children[indexOfNote].src.split("/");
                if (l[l.length-1] != "empty.png")
                    p = false;
            }

            let prow = bar.children[7];
            if (p)
                prow.children[indexOfNote].src = `images/notes/${2**prow.dataset.value.split(" ")[indexOfNote]}pause.png`;
        } else if (e.key == "5") {
            let rrow = bar.children[1+2];
            let note = rrow.children[indexOfNote]

            note.src = `images/notes/empty.png`;

            let p = true;
            for (let i = 0; i < 8; i++) {
                let r = bar.children[i+2];
                let l = r.children[indexOfNote].src.split("/");
                if (l[l.length-1] != "empty.png")
                    p = false;
            }

            let prow = bar.children[7];
            if (p)
                prow.children[indexOfNote].src = `images/notes/${2**prow.dataset.value.split(" ")[indexOfNote]}pause.png`;
                prow.src = "images/notes/empty.png";
        } else if (e.key == "6") {
            let rrow = bar.children[7+2];
            let note = rrow.children[indexOfNote]

            note.src = `images/notes/empty.png`;

            let p = true;
            for (let i = 0; i < 8; i++) {
                let r = bar.children[i+2];
                let l = r.children[indexOfNote].src.split("/");
                if (l[l.length-1] != "empty.png")
                    p = false;
            }

            let prow = bar.children[7];
            if (p)
                prow.children[indexOfNote].src = `images/notes/${2**prow.dataset.value.split(" ")[indexOfNote]}pause.png`;
        } else if (e.key == "7") {
            let rrow = bar.children[6+2];
            let note = rrow.children[indexOfNote]

            note.src = `images/notes/empty.png`;

            let p = true;
            for (let i = 0; i < 8; i++) {
                let r = bar.children[i+2];
                let l = r.children[indexOfNote].src.split("/");
                if (l[l.length-1] != "empty.png")
                    p = false;
            }

            let prow = bar.children[7];
            if (p)
                prow.children[indexOfNote].src = `images/notes/${2**prow.dataset.value.split(" ")[indexOfNote]}pause.png`;
        } else if (e.key == "8") {
            let rrow = bar.children[5+2];
            let note = rrow.children[indexOfNote]

            note.src = `images/notes/empty.png`;

            let p = true;
            for (let i = 0; i < 8; i++) {
                let r = bar.children[i+2];
                let l = r.children[indexOfNote].src.split("/");
                if (l[l.length-1] != "empty.png")
                    p = false;
            }

            let prow = bar.children[7];
            if (p)
                prow.children[indexOfNote].src = `images/notes/${2**prow.dataset.value.split(" ")[indexOfNote]}pause.png`;
        } else if (e.key == "9") {
            let rrow = bar.children[4+2];
            let note = rrow.children[indexOfNote]

            note.src = `images/notes/empty.png`;

            let p = true;
            for (let i = 0; i < 8; i++) {
                let r = bar.children[i+2];
                let l = r.children[indexOfNote].src.split("/");
                if (l[l.length-1] != "empty.png")
                    p = false;
            }

            let prow = bar.children[7];
            if (p)
                prow.children[indexOfNote].src = `images/notes/${2**prow.dataset.value.split(" ")[indexOfNote]}pause.png`;
        } else if (e.key == "-") {
            let rrow = bar.children[3+2];
            let note = rrow.children[indexOfNote]

            note.src = `images/notes/empty.png`;

            let p = true;
            for (let i = 0; i < 8; i++) {
                let r = bar.children[i+2];
                let l = r.children[indexOfNote].src.split("/");
                if (l[l.length-1] != "empty.png")
                    p = false;
            }

            let prow = bar.children[7];
            if (p)
                prow.children[indexOfNote].src = `images/notes/${2**prow.dataset.value.split(" ")[indexOfNote]}pause.png`;
        } else if (e.key == "=") {
            let rrow = bar.children[2];
            let note = rrow.children[indexOfNote]

            note.src = `images/notes/empty.png`;

            let p = true;
            for (let i = 0; i < 8; i++) {
                let r = bar.children[i+2];
                let l = r.children[indexOfNote].src.split("/");
                if (l[l.length-1] != "empty.png")
                    p = false;
            }

            let prow = bar.children[7];
            if (p)
                prow.children[indexOfNote].src = `images/notes/${2**prow.dataset.value.split(" ")[indexOfNote]}pause.png`;
        }

        clue.style.display = "none";
        overlay.style.opacity = "1";
        overlay.inert = false;

        selectedNote == 0;
    }, { once: true });

    document.querySelector(".note-popup").style.display = 'none';
}

function duplicateBar() {
    let staff = selectedBar.parentElement;
    let newBar = selectedBar.cloneNode(true);
    let text = newBar.querySelector("#textOfBar");

    text.addEventListener('click', (e) => {
        e.stopPropagation();
            let menu = document.querySelector(".bar-popup");
            if (menu) {
                menu.style.cssText = `display: flex; left: ${e.pageX}px; top: ${e.pageY}px;`;
                document.addEventListener('click', () => menu.style.display = 'none', { once: true });

                selectedBar = newBar;

                document.querySelector(".note-popup").style.display = 'none';
            }
    });

    for (let i = 1; i < 9; i++) {
        newBar.querySelector(`.bar-${i}row`).querySelectorAll(`.note`).forEach(note => {
            note.addEventListener('click', e => {
                e.stopPropagation()
                let menu = document.querySelector(".note-popup");
                if (menu) {
                    menu.style.cssText = `display: flex; left: ${e.pageX}px; top: ${e.pageY}px;`;
                    document.addEventListener('click', () => menu.style.display = 'none', { once: true });

                    selectedNote = note;

                    document.querySelector(".bar-popup").style.display = 'none';
                }
            });
        });
    }
    staff.insertBefore(newBar, selectedBar);

    selectedBar = null;
    document.querySelector(".bar-popup").style.display = 'none';

    renum();
}
function deleteBar() {
    selectedBar.remove();

    selectedBar = null;
    document.querySelector(".bar-popup").style.display = 'none';

    renum();
}
function rightBar() {
    let staff = selectedBar.parentElement;
    let indexOfBar = Array.from(staff.children).indexOf(selectedBar);

    if (indexOfBar + 2 == staff.children.length)
        return;

    staff.insertBefore(selectedBar, staff.children[indexOfBar+2]);

    selectedBar = null;
    document.querySelector(".bar-popup").style.display = 'none';

    renum();
}
function leftBar() {
    let staff = selectedBar.parentElement;
    let indexOfBar = Array.from(staff.children).indexOf(selectedBar);

    if (indexOfBar == 1)
        return;

    staff.insertBefore(selectedBar, staff.children[indexOfBar-1]);

    selectedBar = null;
    document.querySelector(".bar-popup").style.display = 'none';

    renum();
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
    document.querySelector(".bar-popup").style.display = 'none';
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
        if (!repeatMenu.contains(e.target) && !e.target.closest('.bar-popup')) {
            repeatMenu.style.display = 'none';
            document.removeEventListener('click', closeMenu);
            tempSelectedBar = null;
        }
    });
    selectedBar = null;
    document.querySelector(".bar-popup").style.display = 'none';
}
function confirmRepeat() {
    const repeatMenu = document.getElementById("countRepeats");
    let count = parseInt(document.getElementById("repeatCount").value);
    
    if (isNaN(count) || count < 2) {
        count = 2;
    }
    
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

function play() {
    let bars = document.querySelectorAll(".bar");
    if (bars.length == 0) return;

    if (isPlaying) {
        isPlaying = false;
        
        playingTimeOut.forEach(id => clearTimeout(id));
        playingTimeOut.length = 0;

        document.querySelectorAll(".note").forEach(note => {
            note.style.border = "";
        });

        document.getElementById("imgBPlay").src = "images/play.png";

        return;
    }
    isPlaying = true;
    
    document.getElementById("imgBPlay").src = "images/stop.png";

    let bpm = parseInt(document.getElementById("tempo").value) || 120;
    let quarterNoteTime = 60000 / bpm;
    let currentTime = 0;
    let repeats = [];

    let repBars = [];

    for (let bar of bars) {
        let notes = bar.querySelector(".bar-1row").children.length;

        for (let note = 0; note < notes; note++) {
            let durationValue = 2**parseInt(bar.querySelector(".bar-1row").dataset.value.split(" ")[note]);
            let noteDuration = (4 / durationValue) * quarterNoteTime;
        
            playingTimeOut.push(setTimeout(() => {
                let row1 = bar.querySelector(".bar-1row").children[note].src.split("/");
                let row2 = bar.querySelector(".bar-2row").children[note].src.split("/");
                let row3 = bar.querySelector(".bar-3row").children[note].src.split("/");
                let row4 = bar.querySelector(".bar-4row").children[note].src.split("/");
                let row5 = bar.querySelector(".bar-5row").children[note].src.split("/");
                let row6 = bar.querySelector(".bar-6row").children[note].src.split("/");
                let row7 = bar.querySelector(".bar-7row").children[note].src.split("/");
                let row8 = bar.querySelector(".bar-8row").children[note].src.split("/");

                let redNotes = [];
                if (row6[row6.length-1].slice(1) == "pause.png" || row6[row6.length-1].slice(2) == "pause.png") {
                    let n = bar.querySelector(".bar-6row").children[note];
                    n.style.border = "2px solid red";
                    redNotes.push(n);
                } else {
                    if (row1[row1.length-1].slice(1) == "plate.png" || row1[row1.length-1].slice(2) == "plate.png")
                        redNotes.push(playAudioDrum("crash", bar.querySelector(".bar-1row").children[note]));
                    if (row1[row1.length-1].slice(1) == "HH.png" || row1[row1.length-1].slice(2) == "HH.png")
                        redNotes.push(playAudioDrum("bell", bar.querySelector(".bar-1row").children[note]));
                    if (row2[row2.length-1].slice(1) == "plate.png" || row2[row2.length-1].slice(2) == "plate.png")
                        redNotes.push(playAudioDrum("ride", bar.querySelector(".bar-2row").children[note]));
                    if (row2[row2.length-1].slice(1) == "HH.png" || row2[row2.length-1].slice(2) == "HH.png")
                        redNotes.push(playAudioDrum("cHH", bar.querySelector(".bar-2row").children[note]));
                    if (row2[row2.length-1].slice(1) == "oHH.png" || row2[row2.length-1].slice(2) == "oHH.png")
                        redNotes.push(playAudioDrum("oHH", bar.querySelector(".bar-2row").children[note]));
                    if (row3[row3.length-1].slice(1) == "base.png" || row3[row3.length-1].slice(2) == "base.png")
                        redNotes.push(playAudioDrum("hiTom", bar.querySelector(".bar-3row").children[note]));
                    if (row4[row4.length-1].slice(1) == "base.png" || row4[row4.length-1].slice(2) == "base.png")
                        redNotes.push(playAudioDrum("snare", bar.querySelector(".bar-4row").children[note]));
                    if (row4[row4.length-1].slice(1) == "HH.png" || row3[row3.length-1].slice(2) == "HH.png")
                        redNotes.push(playAudioDrum("stick"), bar.querySelector(".bar-4row").children[note]);
                    if (row5[row5.length-1].slice(1) == "base.png" || row5[row5.length-1].slice(2) == "base.png")
                        redNotes.push(playAudioDrum("midTom", bar.querySelector(".bar-5row").children[note]));
                    if (row6[row6.length-1].slice(1) == "base.png" || row6[row6.length-1].slice(2) == "base.png")
                        redNotes.push(playAudioDrum("lowTom", bar.querySelector(".bar-6row").children[note]));
                    if (row7[row7.length-1].slice(1) == "base.png" || row7[row7.length-1].slice(2) == "base.png")
                        redNotes.push(playAudioDrum("bassDrum", bar.querySelector(".bar-7row").children[note]));
                    if (row8[row8.length-1].slice(1) == "HH.png" || row8[row8.length-1].slice(2) == "HH.png")
                        redNotes.push(playAudioDrum("pHH", bar.querySelector(".bar-8row").children[note]));
                }
                playingTimeOut.push(setTimeout(() => {
                    for (let redNote of redNotes) 
                        redNote.style.border = "";
                }, noteDuration));
            }, currentTime));

            currentTime += noteDuration;
        }
        if (bar.style.boxShadow == "black -5px 0px")
            repBars.push(parseInt(bar.querySelector("#textOfBar").textContent));
        if (bar.style.boxShadow == "black 5px 0px") {
            let staff = document.querySelector("#staff")
            let start = repBars[repBars.length-1];
            let end = parseInt(bar.querySelector("#textOfBar").textContent);
            repBars = repBars.slice(-1, -2);

            for (let i = start; i < end+1; i++) {
                let b = staff.children[i];
                let notes = b.querySelector(".bar-1row").children.length;

                for (let note = 0; note < notes; note++) {
                    let durationValue = 2**parseInt(b.querySelector(".bar-1row").dataset.value.split(" ")[note]);
                    let noteDuration = (4 / durationValue) * quarterNoteTime;
                
                    playingTimeOut.push(setTimeout(() => {
                        let row1 = b.querySelector(".bar-1row").children[note].src.split("/");
                        let row2 = b.querySelector(".bar-2row").children[note].src.split("/");
                        let row3 = b.querySelector(".bar-3row").children[note].src.split("/");
                        let row4 = b.querySelector(".bar-4row").children[note].src.split("/");
                        let row5 = b.querySelector(".bar-5row").children[note].src.split("/");
                        let row6 = b.querySelector(".bar-6row").children[note].src.split("/");
                        let row7 = b.querySelector(".bar-7row").children[note].src.split("/");
                        let row8 = b.querySelector(".bar-8row").children[note].src.split("/");

                        let redNotes = [];
                        if (row6[row6.length-1].slice(1) == "pause.png" || row6[row6.length-1].slice(2) == "pause.png") {
                            let n = b.querySelector(".bar-6row").children[note];
                            n.style.border = "2px solid red";
                            redNotes.push(n);
                        } else {
                            if (row1[row1.length-1].slice(1) == "plate.png" || row1[row1.length-1].slice(2) == "plate.png")
                                redNotes.push(playAudioDrum("crash", b.querySelector(".bar-1row").children[note]));
                            if (row1[row1.length-1].slice(1) == "HH.png" || row1[row1.length-1].slice(2) == "HH.png")
                                redNotes.push(playAudioDrum("bell", b.querySelector(".bar-1row").children[note]));
                            if (row2[row2.length-1].slice(1) == "plate.png" || row2[row2.length-1].slice(2) == "plate.png")
                                redNotes.push(playAudioDrum("ride", b.querySelector(".bar-2row").children[note]));
                            if (row2[row2.length-1].slice(1) == "HH.png" || row2[row2.length-1].slice(2) == "HH.png")
                                redNotes.push(playAudioDrum("cHH", b.querySelector(".bar-2row").children[note]));
                            if (row2[row2.length-1].slice(1) == "oHH.png" || row2[row2.length-1].slice(2) == "oHH.png")
                                redNotes.push(playAudioDrum("oHH", b.querySelector(".bar-2row").children[note]));
                            if (row3[row3.length-1].slice(1) == "base.png" || row3[row3.length-1].slice(2) == "base.png")
                                redNotes.push(playAudioDrum("hiTom", b.querySelector(".bar-3row").children[note]));
                            if (row4[row4.length-1].slice(1) == "base.png" || row4[row4.length-1].slice(2) == "base.png")
                                redNotes.push(playAudioDrum("snare", b.querySelector(".bar-4row").children[note]));
                            if (row4[row4.length-1].slice(1) == "HH.png" || row3[row3.length-1].slice(2) == "HH.png")
                                redNotes.push(playAudioDrum("stick"), b.querySelector(".bar-4row").children[note]);
                            if (row5[row5.length-1].slice(1) == "base.png" || row5[row5.length-1].slice(2) == "base.png")
                                redNotes.push(playAudioDrum("midTom", b.querySelector(".bar-5row").children[note]));
                            if (row6[row6.length-1].slice(1) == "base.png" || row6[row6.length-1].slice(2) == "base.png")
                                redNotes.push(playAudioDrum("lowTom", b.querySelector(".bar-6row").children[note]));
                            if (row7[row7.length-1].slice(1) == "base.png" || row7[row7.length-1].slice(2) == "base.png")
                                redNotes.push(playAudioDrum("bassDrum", b.querySelector(".bar-7row").children[note]));
                            if (row8[row8.length-1].slice(1) == "HH.png" || row8[row8.length-1].slice(2) == "HH.png")
                                redNotes.push(playAudioDrum("pHH", b.querySelector(".bar-8row").children[note]));
                        }
                        playingTimeOut.push(setTimeout(() => {
                            for (let redNote of redNotes) 
                                redNote.style.border = "";
                        }, noteDuration));
                    }, currentTime));

                    currentTime += noteDuration;
                }
            }
        }
    }
    playingTimeOut.push(setTimeout(() => {
        isPlaying = false;
        document.getElementById("imgBPlay").src = "images/play.png";
    }, currentTime));
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
function renum() {
    let staff = document.querySelector("#staff");
    let bars = staff.querySelectorAll(".bar");

    let num = 0;
    
    for (let bar of bars) {
        bar.querySelector("#textOfBar").textContent = ++num;
    }
    numNewBar = num;
}
function insertAtIndex(str, substring, index) {
  return str.slice(0, index) + substring + str.slice(index);
}
function playAudioDrum(name, note) {
    var audio = new Audio(`audio/drums/${name}.flac`);
    audio.play();

    if (note) {
        note.style.border = "2px solid red";
        return note;
    }
}