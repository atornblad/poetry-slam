const paragraphs = [];
const main = document.querySelector('main');
const texts = document.getElementById('texts');
const links = texts.querySelectorAll('li > a');
links.forEach(l => {
    l.addEventListener('click', async (e) => {
        e.preventDefault();
        const response = await fetch(l.href);
        const text = await response.text();
        main.innerHTML = '';
        const lines = text.replace(/\r/g, '').split('\n');

        let p = null;
        let time = 0;
        for (const line of lines) {
            if (line.length == 0) {
                p = null;
            }
            else {
                if (!p) {
                    p = document.createElement('P');
                    paragraphs.push(p);
                    main.appendChild(p);
                }
                const timeMatch = /TIME (.*)/.exec(line);
                if (timeMatch) {
                    const duration = parseTimeToSeconds(timeMatch[1]);
                    p.dataset.starttime = formatTime(time);
                    time += duration;
                    p.dataset.endtime = formatTime(time - 0.1);
                }
                else {
                    if (p.innerHTML != '') {
                        p.appendChild(document.createElement('BR'));
                    }
                    p.appendChild(document.createTextNode(line));
                }
            }
        }

        document.documentElement.requestFullscreen();
    });
});

const reload = document.getElementById('reload');
reload.addEventListener('click', (e) => {
    e.stopPropagation();
    location.reload();
});

const timer = document.getElementById('timer');
const timeDisplay = document.getElementById('time');
let time = 0;
let startTime = null;
let timerInterval = null;
for (let i = 0; i < paragraphs.length; ++i) {
    const p = paragraphs[i];
    p.dataset.starttime = formatTime(time);
    time += parseTimeToSeconds(p.dataset.time);
    p.dataset.endtime = formatTime(time - 1);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
}

function parseTimeToSeconds(timeStr) {
    const [mins, secs] = timeStr.split(':').map(Number);
    return mins * 60 + secs;
}

function updateTimer() {
    const elapsed = (Date.now() - startTime) / 1000;
    timeDisplay.textContent = formatTime(Math.floor(elapsed));

    paragraphs.forEach(p => {
        const startTime = parseTimeToSeconds(p.dataset.starttime);
        const endTime = parseTimeToSeconds(p.dataset.endtime);
        if (elapsed >= startTime && elapsed < endTime) {
            const progress = (elapsed - startTime) / (endTime - startTime);
            p.style.background = `linear-gradient(to bottom, #e9b70b ${progress * 100}%, #fff176 ${progress * 100}%)`;
            p.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            p.style.background = '';
        }
    });
}

timer.addEventListener('click', () => {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        timeDisplay.style.color = '';
        timeDisplay.textContent = formatTime(0);
        paragraphs[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        paragraphs.forEach(p => p.style.background = '');
        //location.reload();
    } else {
        startTime = Date.now();
        timeDisplay.style.color = '#ff4444';
        timerInterval = setInterval(updateTimer, 100);
    }
});
