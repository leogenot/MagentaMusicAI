let drumRnn = new mm.MusicRNN('https://storage.googleapis.com/download.magenta.tensorflow.org/tfjs_checkpoints/music_rnn/drum_kit_rnn');
drumRnn.initialize();

var seedPat;
var bpm;

const midiDrums = [36, 38, 42, 46, 41, 43, 45];
const reverseMidiMapping = new Map([
    [36, 0],
    [35, 0],
    [38, 1],
    [27, 1],
    [28, 1],
    [31, 1],
    [32, 1],
    [33, 1],
    [34, 1],
    [37, 1],
    [39, 1],
    [40, 1],
    [56, 1],
    [65, 1],
    [66, 1],
    [75, 1],
    [85, 1],
    [42, 2],
    [44, 2],
    [54, 2],
    [68, 2],
    [69, 2],
    [70, 2],
    [71, 2],
    [73, 2],
    [78, 2],
    [80, 2],
    [46, 3],
    [67, 3],
    [72, 3],
    [74, 3],
    [79, 3],
    [81, 3],
    [45, 4],
    [29, 4],
    [41, 4],
    [61, 4],
    [64, 4],
    [84, 4],
    [48, 5],
    [47, 5],
    [60, 5],
    [63, 5],
    [77, 5],
    [86, 5],
    [87, 5],
    [50, 6],
    [30, 6],
    [43, 6],
    [62, 6],
    [76, 6],
    [83, 6]
]);

const temperature = 1.0;
const patternLength = 16;

var seedPattern = [
    //Pattern Electro
    [0, 2, 5],
    [2],
    [0, 2, 6, 3],
    [2],
    [0, 2],
    [1, 2],
    [0, 1, 2, 6],
    [2],
    [0, 2],
    [2],
    [0, 2, 6, 3],
    [2],
    [0, 2],
    [1, 2],
    [0, 1, 2, 6],
    [2],
];

var seedPattern2 = [
    //Patern trap
    [0, 2],
    [2],
    [2],
    [0, 2],
    [2, 3, 4, 6],
    [2, 4],
    [],
    [2, 4],
    [2],
    [2],
    [0, 1, 2, 4],
    [2],
    [3, 4, 6],
    [2, 4],
    [2],
    [0, 2],
];

var seedPattern3 = [
    //patern 2step
    [0],
    [1],
    [2, 4],
    [],
    [6],
    [],
    [2, 4],
    [0],
    [],
    [],
    [2, 4],
    [],
    [3, 6],
    [1, 2, 4],
    [0, 1],
    [3],
];




let reverb = new Tone.Convolver(`assets/small-drum-room.wav`).toMaster();
reverb.wet.value = 0;

//SOUNDS
let drumKit = [
    new Tone.Player(`assets/KICK-DISCO.wav`).toMaster(), //KICK 0
    new Tone.Player(`assets/FLARE.mp3`).toMaster(), //FLARE 1
    new Tone.Player(`assets/HI-HAT-DRILL.wav`).toMaster(), //HI HAT 2
    new Tone.Player(`assets/CLAP.wav`).toMaster(), //CLAP 3
    new Tone.Player(`assets/HI-HAT-2.wav`).toMaster(), //HI HAT 2 4
    new Tone.Player(`assets/OPEN-HAT.wav`).toMaster(), // OPEN HAT 5
    new Tone.Player(`assets/SNARE-CLUB.wav`).toMaster() // SNARE 6
];


// Conversion de note à séquence

function toNoteSequence(pattern) {
    return mm.sequences.quantizeNoteSequence({
        ticksPerQuarter: 220,
        totalTime: pattern.length / 2,
        timeSignatures: [{
            time: 0,
            numerator: 4,
            denominator: 4
        }],
        tempos: [{
            time: 0,
            qpm: 120
        }],
        notes: _.flatMap(pattern, (step, index) =>
            step.map(d => ({
                pitch: midiDrums[d],
                startTime: index * 0.5,
                endTime: (index + 1) * 0.5
            }))
        )
    },
        1
    );
};

function fromNoteSequence(seq, patternLength) {
    let res = _.times(patternLength, () => []);
    for (let { pitch, quantizedStartStep } of seq.notes) {
        res[quantizedStartStep].push(reverseMidiMapping.get(pitch));
    }
    return res;
}

// Choix du pattern voulu à l'aide des 3 boutons dispo

function buttonPress(e) {

    switch (e) {
        case "electro":
            seedPat = seedPattern;
            //bpm = '8n';

            break;
        case "trap":
            seedPat = seedPattern2;
            //bpm = '10n';

            break;
        case "2step":
            seedPat = seedPattern3;
            //bpm = '16n'

            break;
        default:
            console.log("erreur : " + e)
    }

    createAndPlayPattern(seedPat);
}

// Lecture du pattern choisi
function isPlaying(audio) { return !audio.paused; }
function playPattern(pattern) {
    //console.log("bpm: "+bpm);
    switch (seedPat) {
        case seedPattern:
            bpm = '8n';
            console.log(bpm);
            break;
        case seedPattern2:
            bpm = '10n';
            console.log(bpm);
            break;
        case seedPattern3:
            bpm = '16n'
            console.log(bpm);
            break;
        default:
            console.log("erreur : " + e)
    }
    sequence = new Tone.Sequence(
        (time, { drums, index }) => {
            drums.forEach(d => {
                drumKit[d].start(time)
            });
        },
        pattern.map((drums, index) => ({ drums, index })),
        bpm //TEMPO
    );


    Tone.Transport.start();



    


    //sequence.start();

    // Lancement de la séquence si on l'a arrêtée avec le bouton stop
    var btnPlay = document.getElementById('buttonPlay');
    btnPlay.addEventListener("click", function startSeq() {
        // Si une séquence est déjà lancée, on la stoppe avant d'en lancer une autre
        if (isPlaying(sequence)) {
            sequence.start();
        } else {
            console.log("on stoppe ca lit deja ")
            sequence.stop();
        }
    })

    // Stopper la séquence avec le bouton stop
    var btnStop = document.getElementById('buttonStop');
    btnStop.addEventListener("click", function stopSeq() {
        // Si une séquence est déjà lancée, on la stoppe avant d'en lancer une autre
        if (isPlaying(sequence)) {
            console.log("stop playing")
            sequence.stop();
        } else {
            console.log("is playing")
            sequence.start();
        }
    })
}

// Affichage du pattern de la séquence choisie

function displayPattern(patterns) {

    document.getElementById("pattern-container").innerHTML = "";

    for (let patternIndex = 0; patternIndex < patterns.length; patternIndex++) {
        let pattern = patterns[patternIndex];
        patternBtnGroup = $('<div></div>').addClass('pattern-group');
        if (patternIndex < seedPat.length)
            patternBtnGroup.addClass('seed');

        for (let i = 0; i <= 6; i++) {
            if (pattern.includes(i))
                patternBtnGroup.append($(`<span></span>`).addClass('pattern active'));
            else
                patternBtnGroup.append($(`<span></span>`).addClass('pattern'));
        }
        $('#pattern-container').append(patternBtnGroup)
    }
    return patterns;
}

// Création puis lecture du pattern choisi

function createAndPlayPattern(seedPat) {

    let seedSeq = toNoteSequence(seedPat);
    
    drumRnn
        .continueSequence(seedSeq, patternLength, temperature)
        .then(r => seedPat.concat(fromNoteSequence(r, patternLength)))
        .then(displayPattern)
        .then(playPattern)
}


