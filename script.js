// Luodaan AudioContext-objekti, jota käytetään piippauksen soittamiseen
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Käynnistä ajastin -funktio

async function kaynnistaAjastin() {

    var aktiiviaika_ss = haeAika("aktiivijakso", "modifioitu_aktiivijakso");
    var passiiviaika_ss = haeAika("passiivijakso", "modifioitu_passiivijakso");
    var kierrokset = haeAika("kierrokset", "modifioitu_kierrokset");

    var raja_ajat = [0];

    for (let i = 0; i < kierrokset; i++) {
        raja_ajat.push(i * (aktiiviaika_ss + passiiviaika_ss) + aktiiviaika_ss);
        raja_ajat.push((i + 1) * (aktiiviaika_ss + passiiviaika_ss));
    }

    var nollahetki = Date.now();
    var i = 0;

    while (true) {
        var aika_nyt = Date.now();
        var kulunut_aika_ss = Math.floor((aika_nyt - nollahetki) / 1000);
        document.getElementById("ajastin-naytto").textContent = muotoileAika(kulunut_aika_ss); 

        if (kulunut_aika_ss == raja_ajat[i]) {
            if (i % 2 == 1) {
                var jakso = "aktiivinen"; // aktiivinen jakso päättyy
            }
            else if (i % 2 == 0) {
                var jakso = "passiivinen"; // passiivinen jakso päättyy
            }

            if (i != 0) { 
                lisaaRivi(jakso, muotoileAika(raja_ajat[i-1]),muotoileAika(raja_ajat[i]));
            }

            if (kulunut_aika_ss == raja_ajat.at(-1)) {
                soitaPiippaus(262, 2);
                break;
            }
            else if (i % 2 == 1) {
                soitaPiippaus(440, 1);
            }
            else if (i % 2 == 0) {
                soitaPiippaus(659, 1);
            }
            
            i++
        }  
        await odota(100);
    }
}

// Apufunktiot: odota, muotoileAika, lisaaRivi, soitaPiippaus, haeAika

const odota = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function muotoileAika(kokonaissekunnit) {
    const minuutit = Math.floor(kokonaissekunnit / 60);
    const sekunnit = kokonaissekunnit % 60;

    // Lisätään nolla eteen, jos luku on yksinumeroinen (esim. 9 -> 09)
    const mm = String(minuutit).padStart(2, '0');
    const ss = String(sekunnit).padStart(2, '0');

    return `${mm}:${ss}`;
    }

function lisaaRivi(jakso, alku_aika, loppu_aika) {
    const taulukko = document.getElementById("toteutuneet_jaksot");
    const uusiRivi = taulukko.insertRow(-1);
    const solu1 = uusiRivi.insertCell(0);
    const solu2 = uusiRivi.insertCell(1);
    const solu3 = uusiRivi.insertCell(2);

    solu1.textContent = jakso;
    solu2.textContent = alku_aika;
    solu3.textContent = loppu_aika;
    }

function soitaPiippaus(taajuus = 440, kesto = 0.1) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    // Luodaan oskillaattori (äänen lähde) ja vahvistin (äänenvoimakkuus)
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Määritetään äänen tyyppi ('sine', 'square', 'sawtooth', 'triangle')
    oscillator.type = 'sine'; 
    oscillator.frequency.value = taajuus; // Taajuus hertseinä (Hz)

    // Aloitetaan ääni heti
    oscillator.start();
    
    // Lopetetaan ääni määritetyn keston jälkeen ja häivytetään se napsahdusten estämiseksi
    const haivytysAika = 0.02; 
    gainNode.gain.setValueAtTime(1, audioCtx.currentTime + kesto - haivytysAika);
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + kesto);
    oscillator.stop(audioCtx.currentTime + kesto);
}

function haeAika(aikaSelect, aikaInput) {
        if (document.getElementById(aikaSelect).disabled) {
            var aika = parseInt(document.getElementById(aikaInput).value);
        } else {
            var aika = parseInt(document.getElementById(aikaSelect).value);
        }
        return aika;
    }