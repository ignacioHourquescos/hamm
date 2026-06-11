// Mobile Navigation Toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Close mobile menu when clicking on a link
const navLinks = document.querySelectorAll('.nav-menu a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar and WhatsApp visibility on scroll
const navbar = document.querySelector('.navbar');
const whatsappFloat = document.querySelector('.whatsapp-float');
const contactSection = document.getElementById('contacto');
const NAVBAR_SHOW_OFFSET = 50;
let atCharlemos = false;

function getNavbarHeight() {
    return navbar?.offsetHeight || 80;
}

function applyScrollUiVisibility() {
    const isVisible = window.scrollY > NAVBAR_SHOW_OFFSET;

    navbar.classList.toggle('is-visible', isVisible);
    whatsappFloat?.classList.toggle('is-visible', isVisible);

    if (!isVisible) {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    }
}

let charlemosObserver = null;

function setupCharlemosObserver() {
    if (!contactSection) return;

    if (charlemosObserver) {
        charlemosObserver.disconnect();
    }

    charlemosObserver = new IntersectionObserver(
        ([entry]) => {
            atCharlemos = entry.isIntersecting;
            applyScrollUiVisibility();
        },
        {
            threshold: 0,
            rootMargin: `-${getNavbarHeight()}px 0px 0px 0px`
        }
    );
    charlemosObserver.observe(contactSection);
}

setupCharlemosObserver();

window.addEventListener('scroll', applyScrollUiVisibility);
window.addEventListener('resize', () => {
    setupCharlemosObserver();
    applyScrollUiVisibility();
});
applyScrollUiVisibility();

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe service cards and other elements
document.querySelectorAll('.service-card, .servicio-item, .marca-card, .contact-card, .metrica-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Active navigation link highlighting
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-menu a[href="#${sectionId}"]`);

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => link.classList.remove('active'));
            if (navLink) {
                navLink.classList.add('active');
            }
        }
    });
});

// Hero image grid: fixed cells, column up / row sideways random moves
(function initHeroGrid() {
    const gridEl = document.getElementById('heroGrid');
    const heroSection = document.getElementById('home');
    if (!gridEl) return;

    const HERO_INTRO_KEY = 'hamm-hero-intro-seen';

    function shouldPlayHeroIntro() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return false;
        }
        return !sessionStorage.getItem(HERO_INTRO_KEY);
    }

    const playHeroIntro = shouldPlayHeroIntro();

    heroSection?.classList.add('hero--pending');
    if (playHeroIntro) {
        heroSection.classList.add('hero--intro');
    }
    const HERO_SUBTITLE_DELAY_MS = 300;

    const COLS = 8;
    const GRID_GAP = 8;
    const EASE_MOVE = 'cubic-bezier(0.22, 1, 0.36, 1)';
    const ROWS_DESKTOP = 4;
    const ROWS_MOBILE = 4;
    const MOBILE_BREAKPOINT = 768;
    const FILLER_ROWS = 2;
    const MOVE_DURATION_MS = 1400;
    const PAUSE_BETWEEN_MOVES = 200;

    let rows = getRowCount();
    let sequenceTimer = null;

    function getRowCount() {
        return window.innerWidth <= MOBILE_BREAKPOINT ? ROWS_MOBILE : ROWS_DESKTOP;
    }

    let IMAGE_POOL = [];

    const colState = new WeakMap();
    const rowState = {};
    const rowContent = {};
    let imageMatrix = [];
    let steps = { stepX: 0, stepY: 0, cellH: 0, gap: 0, halfX: 0, halfY: 0 };
    let moveIndex = 0;
    let lastVerticalColIndex = null;

    function pickVerticalColumnIndex(colCount) {
        if (colCount <= 1) {
            lastVerticalColIndex = 0;
            return 0;
        }

        const available = [...Array(colCount).keys()].filter(index => index !== lastVerticalColIndex);
        const colIndex = available[Math.floor(Math.random() * available.length)];
        lastVerticalColIndex = colIndex;
        return colIndex;
    }

    function imgPath(file) {
        return `imagenes/hero/${encodeURIComponent(file)}`;
    }

    async function loadImagePool() {
        const response = await fetch('imagenes/hero/manifest.json');
        if (!response.ok) {
            throw new Error('No se pudo cargar imagenes/hero/manifest.json');
        }

        const data = await response.json();
        const images = Array.isArray(data) ? data : data.images;

        if (!Array.isArray(images) || images.length === 0) {
            throw new Error('El manifest del hero no tiene imágenes');
        }

        IMAGE_POOL = images;
    }

    function preloadHeroImages(files, concurrency = 8) {
        if (!files.length) return Promise.resolve();

        const queue = [...files];
        const workerCount = Math.min(concurrency, queue.length);

        const workers = Array.from({ length: workerCount }, () => (async () => {
            while (queue.length) {
                const file = queue.shift();
                if (!file) break;

                await new Promise(resolve => {
                    const img = new Image();
                    img.decoding = 'async';
                    img.onload = resolve;
                    img.onerror = resolve;
                    img.src = imgPath(file);
                });
            }
        })());

        return Promise.all(workers);
    }

    function runHeroIntro() {
        if (!heroSection || !playHeroIntro) return;

        setTimeout(() => {
            heroSection.classList.add('hero--subtitle-in');
        }, HERO_SUBTITLE_DELAY_MS);
    }

    function finishHeroReveal() {
        if (!heroSection) return;

        heroSection.classList.remove('hero--pending', 'hero--intro', 'hero--subtitle-in');
        heroSection.classList.add('hero--ready');

        if (playHeroIntro) {
            sessionStorage.setItem(HERO_INTRO_KEY, '1');
        }
    }

    function shuffleArray(items) {
        const shuffled = [...items];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    function pickUniqueImage(excludeSet) {
        const available = IMAGE_POOL.filter(img => !excludeSet.has(img));
        if (!available.length) {
            return IMAGE_POOL[Math.floor(Math.random() * IMAGE_POOL.length)];
        }
        return available[Math.floor(Math.random() * available.length)];
    }

    function getMatrixUsedExcept(colNum, dataRow, extraExclude = new Set()) {
        const used = new Set(extraExclude);
        for (let c = 0; c < COLS; c++) {
            for (let r = 0; r < rows; r++) {
                if (c === colNum && r === dataRow) continue;
                used.add(imageMatrix[c][r]);
            }
        }
        return used;
    }

    function pickReplacementImage(colNum, dataRow, extraExclude = new Set()) {
        return pickUniqueImage(getMatrixUsedExcept(colNum, dataRow, extraExclude));
    }

    function buildImageMatrix() {
        const shuffled = shuffleArray(IMAGE_POOL);
        const matrix = [];
        let cursor = 0;

        for (let c = 0; c < COLS; c++) {
            matrix[c] = [];
            const usedInCol = new Set();

            for (let r = 0; r < rows; r++) {
                let picked = null;

                for (let i = 0; i < shuffled.length; i++) {
                    const candidate = shuffled[(cursor + i) % shuffled.length];
                    if (!usedInCol.has(candidate)) {
                        picked = candidate;
                        cursor = (cursor + i + 1) % shuffled.length;
                        break;
                    }
                }

                if (!picked) {
                    picked = shuffled[cursor % shuffled.length];
                    cursor++;
                }

                usedInCol.add(picked);
                matrix[c][r] = picked;
            }
        }

        return matrix;
    }

    function ensureUniqueLitImages(entries) {
        const seen = new Set();

        entries.forEach(({ cell, colNum, dataRow }) => {
            let image = imageMatrix[colNum][dataRow];

            if (seen.has(image)) {
                image = pickReplacementImage(colNum, dataRow, seen);
                imageMatrix[colNum][dataRow] = image;
                const secondary = pickReplacementImage(colNum, dataRow, new Set([...seen, image]));
                applyCellImages(cell, image, secondary);
            }

            seen.add(image);
        });
    }

    function getVisibleColumnEntries(colEl) {
        const colNum = parseInt(colEl.dataset.col, 10);
        const entries = [];

        for (let vr = 0; vr < rows; vr++) {
            const cell = getCellsInVisualRow(vr).find(
                rowCell => rowCell.closest('.grid-column') === colEl
            );

            if (cell) {
                entries.push({
                    cell,
                    colNum,
                    dataRow: parseInt(cell.dataset.row, 10)
                });
            }
        }

        return entries;
    }

    function getDupCell(cell) {
        const col = cell.closest('.grid-column');
        return col.querySelector(`.grid-cell--dup[data-row="${cell.dataset.row}"]`);
    }

    function applyCellImages(cell, primaryFile, secondaryFile) {
        const targets = [cell, getDupCell(cell)].filter(Boolean);
        targets.forEach(c => {
            const imgs = c.querySelectorAll('.grid-cell-inner img');
            imgs[0].src = imgPath(primaryFile);
            imgs[1].src = imgPath(secondaryFile);
            setTransform(c.querySelector('.grid-track-h'), 0, 0);
        });
    }

    function getColOrder() {
        return getActiveColumns().map(col => parseInt(col.dataset.col, 10));
    }

    function captureRowContent(visualRow) {
        const cells = getCellsInVisualRow(visualRow);
        rowContent[visualRow] = {};
        cells.forEach(cell => {
            const col = parseInt(cell.closest('.grid-column').dataset.col, 10);
            const dataRow = parseInt(cell.dataset.row, 10);
            rowContent[visualRow][col] = imageMatrix[col][dataRow];
        });
    }

    function applyRowContent(visualRow) {
        const cells = getCellsInVisualRow(visualRow);
        const cols = getColOrder();
        const content = rowContent[visualRow];
        if (!content) return;

        cells.forEach((cell, i) => {
            const col = cols[i];
            const primary = content[col];
            const nextCol = cols[(i + 1) % cols.length];
            const secondary = content[nextCol];
            if (primary && secondary) {
                applyCellImages(cell, primary, secondary);
            }
        });
    }

    function getCellInColumn(colEl, dataRow) {
        const track = colEl.querySelector('.grid-track-v');
        return track?.querySelector(`.grid-cell:not(.grid-cell--dup)[data-row="${dataRow}"]`) || null;
    }

    function setSingleCellLit(cell, lit) {
        if (!cell) return;
        [cell, getDupCell(cell)].filter(Boolean).forEach(c => {
            c.classList.toggle('is-lit', lit);
        });
    }

    function pickUniqueRow(usedRows) {
        const availableRows = [...Array(rows).keys()].filter(row => !usedRows.has(row));
        const dataRow = availableRows.length
            ? availableRows[Math.floor(Math.random() * availableRows.length)]
            : Math.floor(Math.random() * rows);
        usedRows.add(dataRow);
        return dataRow;
    }

    function createCell(src, row, isDup, isFiller = false) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell'
            + (isDup ? ' grid-cell--dup' : '')
            + (isFiller ? ' grid-cell--filler' : '');
        cell.dataset.row = isFiller ? `filler-${row}` : row;

        const hTrack = document.createElement('div');
        hTrack.className = 'grid-track-h';

        for (let copy = 0; copy < 2; copy++) {
            const inner = document.createElement('div');
            inner.className = 'grid-cell-inner';
            const img = document.createElement('img');
            img.decoding = 'async';
            if (!isDup && !isFiller && copy === 0) {
                img.fetchPriority = 'high';
            }
            img.src = imgPath(src);
            img.alt = '';
            inner.appendChild(img);
            hTrack.appendChild(inner);
        }

        cell.appendChild(hTrack);
        return cell;
    }

    function buildGrid() {
        imageMatrix = buildImageMatrix();
        gridEl.innerHTML = '';
        Object.keys(rowState).forEach(key => delete rowState[key]);
        Object.keys(rowContent).forEach(key => delete rowContent[key]);

        for (let c = 0; c < COLS; c++) {
            const col = document.createElement('div');
            col.className = 'grid-column';
            col.dataset.col = c;

            const vTrack = document.createElement('div');
            vTrack.className = 'grid-track-v';

            for (let r = 0; r < rows; r++) {
                vTrack.appendChild(createCell(imageMatrix[c][r], r, false));
            }
            for (let r = 0; r < rows; r++) {
                vTrack.appendChild(createCell(imageMatrix[c][r], r, true));
            }
            for (let f = 0; f < FILLER_ROWS; f++) {
                vTrack.appendChild(createCell(imageMatrix[c][0], f, true, true));
            }

            col.appendChild(vTrack);
            gridEl.appendChild(col);
            colState.set(vTrack, { y: 0 });
        }

        for (let r = 0; r < rows; r++) {
            rowState[r] = { x: 0 };
        }
    }

    function measureSteps() {
        const gap = parseFloat(getComputedStyle(gridEl).gap) || GRID_GAP;
        gridEl.style.setProperty('--grid-gap', `${gap}px`);

        const colCount = getActiveColumns().length;
        const gridRect = gridEl.getBoundingClientRect();
        const fromWidth = (gridRect.width - (colCount - 1) * gap) / colCount;
        const fromHeight = (gridRect.height - (rows - 1) * gap) / rows;
        const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
        const size = Math.floor(isMobile ? fromHeight : Math.min(fromWidth, fromHeight));

        gridEl.style.setProperty('--cell-size', `${size}px`);
        document.documentElement.style.setProperty('--hero-cell-size', `${size}px`);

        const track = gridEl.querySelector('.grid-track-v');
        const cells = track ? [...track.querySelectorAll('.grid-cell')] : [];
        const cell = cells[0];
        if (!cell || cells.length < 2) return;

        cell.offsetHeight;

        const cellH = Math.round(cell.offsetHeight);
        const cellW = Math.round(cell.offsetWidth);
        const measuredStepY = Math.round(cells[1].offsetTop - cells[0].offsetTop);
        const stepY = measuredStepY > 0 ? measuredStepY : cellH + gap;

        steps = {
            stepX: cellW,
            stepY,
            cellH,
            gap,
            halfX: cellW,
            halfY: rows * stepY
        };
    }

    function normalizeTrackY(y) {
        const { stepY, halfY } = steps;
        if (!stepY) return y;

        y = Math.round(y / stepY) * stepY;

        while (y <= -halfY) y += halfY;
        while (y > 0) y -= halfY;

        return y;
    }

    function syncAllColumnPositions() {
        getActiveColumns().forEach(col => {
            const track = col.querySelector('.grid-track-v');
            if (!track) return;

            const state = colState.get(track) || { y: 0 };
            const y = normalizeTrackY(state.y);
            setTransform(track, 0, y);
            colState.set(track, { y });
        });
    }

    function getActiveColumns() {
        return [...gridEl.querySelectorAll('.grid-column')].filter(
            col => getComputedStyle(col).display !== 'none'
        );
    }

    function getVisualRowBand(visualRow) {
        return {
            top: visualRow * steps.stepY,
            bottom: visualRow * steps.stepY + steps.cellH
        };
    }

    function getOverlap(cellTop, cellBottom, bandTop, bandBottom) {
        return Math.min(cellBottom, bandBottom) - Math.max(cellTop, bandTop);
    }

    function getCellViewportTop(cell) {
        const col = cell.closest('.grid-column');
        const track = col.querySelector('.grid-track-v');
        const y = colState.get(track)?.y || 0;
        const cells = [...track.querySelectorAll('.grid-cell:not(.grid-cell--dup)')];
        const index = cells.indexOf(cell);
        return index * steps.stepY + y;
    }

    function getVisualRowForCell(cell) {
        const cellTop = getCellViewportTop(cell);
        const cellBottom = cellTop + steps.cellH;
        let bestRow = 0;
        let bestOverlap = -Infinity;

        for (let vr = 0; vr < rows; vr++) {
            const band = getVisualRowBand(vr);
            const overlap = getOverlap(cellTop, cellBottom, band.top, band.bottom);
            if (overlap > bestOverlap) {
                bestOverlap = overlap;
                bestRow = vr;
            }
        }
        return bestRow;
    }

    function getCellsInVisualRow(visualRow) {
        const band = getVisualRowBand(visualRow);
        const result = [];

        getActiveColumns().forEach(col => {
            const track = col.querySelector('.grid-track-v');
            const y = colState.get(track)?.y || 0;
            const cells = [...track.querySelectorAll('.grid-cell:not(.grid-cell--dup)')];

            let bestCell = null;
            let bestOverlap = -Infinity;

            cells.forEach((cell, index) => {
                const top = index * steps.stepY + y;
                const bottom = top + steps.cellH;
                const overlap = getOverlap(top, bottom, band.top, band.bottom);
                if (overlap > bestOverlap) {
                    bestOverlap = overlap;
                    bestCell = cell;
                }
            });

            if (bestCell) result.push(bestCell);
        });

        return result;
    }

    function refreshAllRowTracks() {
        for (let vr = 0; vr < rows; vr++) {
            captureRowContent(vr);
            applyRowContent(vr);
        }
    }

    function clearAllLit() {
        gridEl.querySelectorAll('.grid-column.is-active').forEach(col => {
            col.classList.remove('is-active');
        });
        gridEl.querySelectorAll('.grid-cell.is-lit').forEach(cell => {
            cell.classList.remove('is-lit');
        });
    }

    function setColumnLit(colEl, lit) {
        colEl.classList.toggle('is-active', lit);
    }

    function animateRowCells(cells, fromX, toX, durationMs) {
        return Promise.all(
            cells.flatMap(cell => {
                const tracks = [cell, getDupCell(cell)]
                    .filter(Boolean)
                    .map(c => c.querySelector('.grid-track-h'));
                return tracks.map(hTrack =>
                    animateTransform(hTrack, fromX, 0, toX, 0, durationMs)
                );
            })
        );
    }

    function setTransform(el, x, y, animate, durationMs) {
        if (animate && durationMs > 0) {
            el.style.transition = `transform ${durationMs}ms ${EASE_MOVE}`;
        } else {
            el.style.transition = 'none';
        }
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        if (!animate) el.offsetHeight;
    }

    function animateTransform(el, fromX, fromY, toX, toY, durationMs) {
        return new Promise(resolve => {
            setTransform(el, fromX, fromY);
            requestAnimationFrame(() => setTransform(el, toX, toY, true, durationMs));

            el.addEventListener('transitionend', function onEnd(e) {
                if (e.propertyName !== 'transform') return;
                el.removeEventListener('transitionend', onEnd);
                resolve();
            });
        });
    }

    function prepareCellHorizontalScroll(cell, colNum, dataRow, direction, newImage) {
        const current = imageMatrix[colNum][dataRow];

        if (direction < 0) {
            applyCellImages(cell, current, newImage);
            return { cell, colNum, dataRow, newImage, fromX: 0, toX: -steps.stepX };
        }

        applyCellImages(cell, newImage, current);
        [cell, getDupCell(cell)].filter(Boolean).forEach(c => {
            setTransform(c.querySelector('.grid-track-h'), -steps.stepX, 0);
        });
        return { cell, colNum, dataRow, newImage, fromX: -steps.stepX, toX: 0 };
    }

    function moveColumnUp(colIndex, durationMs) {
        const columns = getActiveColumns();
        const col = columns[colIndex];
        if (!col) return Promise.resolve();

        measureSteps();

        const track = col.querySelector('.grid-track-v');
        const state = colState.get(track) || { y: 0 };
        const y = normalizeTrackY(state.y);
        const toY = y - steps.stepY;

        clearAllLit();
        ensureUniqueLitImages(getVisibleColumnEntries(col));
        setColumnLit(col, true);

        return animateTransform(track, 0, y, 0, toY, durationMs).then(() => {
            const nextY = normalizeTrackY(toY);
            setTransform(track, 0, nextY);
            colState.set(track, { y: nextY });
            refreshAllRowTracks();
            setColumnLit(col, false);
        });
    }

    function moveAllColumnsHorizontal(direction, durationMs) {
        const columns = getActiveColumns();
        const usedRows = new Set();
        const reservedImages = new Set();
        const scrolls = [];

        clearAllLit();

        const litEntries = [];

        columns.forEach(col => {
            const colNum = parseInt(col.dataset.col, 10);
            const dataRow = pickUniqueRow(usedRows);
            const cell = getCellInColumn(col, dataRow);
            if (!cell) return;

            litEntries.push({ cell, colNum, dataRow });
        });

        ensureUniqueLitImages(litEntries);

        litEntries.forEach(({ cell, colNum, dataRow }) => {
            const newImage = pickReplacementImage(colNum, dataRow, reservedImages);
            reservedImages.add(newImage);

            setSingleCellLit(cell, true);
            scrolls.push(prepareCellHorizontalScroll(cell, colNum, dataRow, direction, newImage));
        });

        if (!scrolls.length) return Promise.resolve();

        const { fromX, toX } = scrolls[0];

        return animateRowCells(
            scrolls.map(scroll => scroll.cell),
            fromX,
            toX,
            durationMs
        ).then(() => {
            scrolls.forEach(({ cell, colNum, dataRow, newImage }) => {
                imageMatrix[colNum][dataRow] = newImage;
                const secondary = pickReplacementImage(colNum, dataRow, new Set([newImage]));
                applyCellImages(cell, newImage, secondary);
                setSingleCellLit(cell, false);
            });
            refreshAllRowTracks();
        });
    }

    function whenImagesReady() {
        const imgs = [...gridEl.querySelectorAll('img')];
        return Promise.all(
            imgs.map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise(resolve => {
                    img.addEventListener('load', resolve, { once: true });
                    img.addEventListener('error', resolve, { once: true });
                });
            })
        );
    }

    async function runSequence() {
        clearAllLit();
        const activeCols = getActiveColumns();
        const moveInCycle = moveIndex % 3;

        if (moveInCycle < 2) {
            const colIndex = pickVerticalColumnIndex(activeCols.length);
            await moveColumnUp(colIndex, MOVE_DURATION_MS);
        } else {
            const direction = Math.random() < 0.5 ? -1 : 1;
            await moveAllColumnsHorizontal(direction, MOVE_DURATION_MS);
        }

        moveIndex++;
        sequenceTimer = setTimeout(runSequence, PAUSE_BETWEEN_MOVES);
    }

    function stopSequence() {
        if (sequenceTimer) {
            clearTimeout(sequenceTimer);
            sequenceTimer = null;
        }
    }

    function startSequence() {
        stopSequence();
        runSequence();
    }

    function initGridLayout() {
        gridEl.style.setProperty('--grid-rows', rows);
        measureSteps();

        return whenImagesReady().then(() => {
            measureSteps();
            syncAllColumnPositions();
            return new Promise(resolve => {
                requestAnimationFrame(() => {
                    measureSteps();
                    syncAllColumnPositions();
                    refreshAllRowTracks();
                    resolve();
                });
            });
        });
    }

    loadImagePool()
        .then(() => {
            buildGrid();
            runHeroIntro();

            return Promise.all([
                preloadHeroImages(IMAGE_POOL, 8),
                initGridLayout()
            ]);
        })
        .then(() => {
            finishHeroReveal();
            startSequence();
        })
        .catch(error => {
            console.error('Hero grid:', error);
            finishHeroReveal();
        });

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const nextRows = getRowCount();
            if (nextRows !== rows) {
                stopSequence();
                rows = nextRows;
                moveIndex = 0;
                lastVerticalColIndex = null;
                buildGrid();
                initGridLayout().then(() => startSequence());
                return;
            }

            measureSteps();
            requestAnimationFrame(() => {
                measureSteps();
                syncAllColumnPositions();
                refreshAllRowTracks();
            });
        }, 150);
    });
})();

// Portfolio: ciclo automático; hover lo frena, al salir sigue
(function initPortfolioHighlight() {
    const section = document.getElementById('nuestros-trabajos');
    const grid = document.querySelector('.portfolio-grid');
    if (!section || !grid) return;

    const items = [...grid.querySelectorAll('.portfolio-item')];
    if (!items.length) return;

    const ON_MS = 1500;
    const OFF_MS = 500;
    const STOP_DEBOUNCE_MS = 350;
    let timer = null;
    let stopDebounce = null;
    let lastIndex = null;
    let isVisible = false;
    let isRunning = false;
    let isPaused = false;

    function checkVisible() {
        const rect = section.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;
        return rect.bottom > 0 && rect.top < vh;
    }

    function pickRandomIndex() {
        if (items.length === 1) return 0;

        const available = items.map((_, index) => index).filter(index => index !== lastIndex);
        const index = available[Math.floor(Math.random() * available.length)];
        lastIndex = index;
        return index;
    }

    function clearActive() {
        items.forEach(item => item.classList.remove('is-active'));
    }

    function setActiveItem(item) {
        clearActive();
        if (item) item.classList.add('is-active');
    }

    function clearTimer() {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    }

    function pauseCycle() {
        if (isPaused) return;
        isPaused = true;
        grid.classList.add('is-paused');
        clearTimer();
    }

    function resumeCycle() {
        if (!isPaused) return;
        isPaused = false;
        grid.classList.remove('is-paused');
        clearActive();
        if (isRunning && isVisible) {
            timer = setTimeout(turnOnNext, 200);
        }
    }

    function turnOnNext() {
        timer = null;
        if (isPaused || !isRunning || !isVisible) return;

        clearActive();
        items[pickRandomIndex()].classList.add('is-active');
        timer = setTimeout(turnOffCurrent, ON_MS);
    }

    function turnOffCurrent() {
        timer = null;
        clearActive();

        if (isPaused || !isRunning || !isVisible) return;

        timer = setTimeout(turnOnNext, OFF_MS);
    }

    function start() {
        if (isRunning) return;
        isRunning = true;
        clearActive();
        timer = setTimeout(turnOnNext, 200);
    }

    function stop() {
        isRunning = false;
        isPaused = false;
        grid.classList.remove('is-paused');
        clearTimer();
        clearActive();
    }

    function setVisible(visible) {
        isVisible = visible;
        if (visible) {
            if (stopDebounce) {
                clearTimeout(stopDebounce);
                stopDebounce = null;
            }
            if (!isPaused) start();
            return;
        }

        if (stopDebounce) clearTimeout(stopDebounce);
        stopDebounce = setTimeout(() => {
            stopDebounce = null;
            if (!isVisible) stop();
        }, STOP_DEBOUNCE_MS);
    }

    grid.addEventListener('mouseenter', pauseCycle);

    grid.addEventListener('mouseleave', (e) => {
        const related = e.relatedTarget;
        if (related && grid.contains(related)) return;
        resumeCycle();
    });

    items.forEach(item => {
        item.addEventListener('mouseenter', () => {
            pauseCycle();
            setActiveItem(item);
        });
    });

    const observer = new IntersectionObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;
        setVisible(entry.isIntersecting && entry.intersectionRatio > 0);
    }, { threshold: 0 });

    observer.observe(section);

    setVisible(checkVisible());
})();

// WhatsApp links (form + float button)
(function initWhatsApp() {
    const WHATSAPP_NUMBERS = ['5491154713868', '5491158487984'];

    function getRandomWhatsAppNumber() {
        return WHATSAPP_NUMBERS[Math.floor(Math.random() * WHATSAPP_NUMBERS.length)];
    }

    function buildWhatsAppUrl(message) {
        const number = getRandomWhatsAppNumber();
        const base = `https://wa.me/${number}`;
        if (!message) return base;
        return `${base}?text=${encodeURIComponent(message)}`;
    }

    function openWhatsApp(message) {
        window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
    }

    document.querySelectorAll('[data-random-wa]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openWhatsApp();
        });
    });

    const charlemosForm = document.getElementById('charlemosForm');
    if (charlemosForm) {
        charlemosForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nombre = document.getElementById('contactNombre')?.value.trim() || '';
            const empresa = document.getElementById('contactEmpresa')?.value.trim() || '';
            const telefono = document.getElementById('contactTelefono')?.value.trim() || '';
            const email = document.getElementById('contactEmail')?.value.trim() || '';
            const mensaje = document.getElementById('contactMensaje')?.value.trim() || '';

            if (!nombre || !empresa || !telefono || !email || !mensaje) {
                charlemosForm.reportValidity();
                return;
            }

            const text = `Soy ${nombre} de ${empresa}, tel: ${telefono}, email: ${email}. Quiero ${mensaje}`;

            openWhatsApp(text);
        });
    }
})();

// Métricas: Odometer.js slot-machine counter on scroll
(function initMetricasOdometer() {
    const section = document.getElementById('metricas');
    if (!section) return;

    const counters = [...section.querySelectorAll('.metrica-count')];
    if (!counters.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let hasAnimated = false;
    const instances = [];

    function setupOdometers() {
        if (typeof Odometer === 'undefined') {
            window.setTimeout(setupOdometers, 50);
            return;
        }

        counters.forEach((counter, index) => {
            const target = parseInt(counter.dataset.target, 10) || 0;
            const duration = 2200 + index * 300;

            const odometer = new Odometer({
                el: counter,
                value: 0,
                duration,
                format: 'd',
                theme: 'minimal'
            });

            instances.push({ odometer, target });
        });

        observeAndTrigger();
    }

    function runAnimation() {
        if (hasAnimated) return;
        hasAnimated = true;

        instances.forEach(({ odometer, target }, index) => {
            if (prefersReducedMotion) {
                odometer.update(target);
                return;
            }
            window.setTimeout(() => odometer.update(target), index * 220);
        });
    }

    function observeAndTrigger() {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    runAnimation();
                    observer.disconnect();
                }
            },
            { threshold: 0.2, rootMargin: '0px 0px -40px 0px' }
        );
        observer.observe(section);
    }

    setupOdometers();
})();

// Service card "+ MÁS" toggle
document.querySelectorAll('.service-more-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const details = btn.previousElementSibling; // .service-card-details
        const isOpen = details.classList.contains('open');

        details.classList.toggle('open');
        btn.classList.toggle('active');
        btn.textContent = isOpen ? '+ MÁS' : '− MENOS';
        btn.setAttribute('aria-expanded', !isOpen);
    });
});


