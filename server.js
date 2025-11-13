const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs'); // Dosya okuma modülü eklendi

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Statik dosyaları sun
app.use(express.static(path.join(__dirname, 'public')));

// --- KELİMELERİ DOSYADAN YÜKLE ---
let cards = [];

function loadWords() {
    try {
        // kelimeler.json dosyasını okuyoruz
        const rawData = fs.readFileSync(path.join(__dirname, 'kelimeler.json'), 'utf-8');
        cards = JSON.parse(rawData);
        console.log(`${cards.length} adet kelime başarıyla yüklendi.`);
    } catch (error) {
        console.error("Kelimeler dosyası okunamadı! Lütfen kelimeler.json dosyasını kontrol edin.", error);
        // Hata olursa oyunun çökmemesi için varsayılan bir kart ekleyelim
        cards = [{ word: "HATA", forbidden: ["Dosya", "Bulunamadı", "JSON", "Bozuk", "Kontrol Et"] }];
    }
}

// Sunucu başlarken kelimeleri yükle
loadWords();

// --- OYUN DURUMU ---
let gameState = {
    scores: { teamA: 0, teamB: 0 },
    currentCard: null,
    turnTeam: 'teamA' 
};

// Rastgele kart seçme
function getRandomCard() {
    if (cards.length === 0) return { word: "BİTTİ", forbidden: [] };
    return cards[Math.floor(Math.random() * cards.length)];
}

// İlk kartı seç
gameState.currentCard = getRandomCard();

io.on('connection', (socket) => {
    console.log('Bir oyuncu bağlandı.');
    
    // Yeni gelene mevcut durumu gönder
    socket.emit('updateGame', gameState);

    // --- OYUN AKSİYONLARI ---
    
    // Doğru Bilindi (+1 Puan)
    socket.on('action_correct', () => {
        if(gameState.turnTeam === 'teamA') gameState.scores.teamA += 1;
        else gameState.scores.teamB += 1;
        
        gameState.currentCard = getRandomCard();
        io.emit('updateGame', gameState);
    });

    // Tabu Yapıldı (-1 Puan)
    socket.on('action_taboo', () => {
        if(gameState.turnTeam === 'teamA') gameState.scores.teamA -= 1;
        else gameState.scores.teamB -= 1;
        
        gameState.currentCard = getRandomCard();
        io.emit('updateGame', gameState);
    });

    // Pas Geçildi (Kart değişir, puan değişmez)
    socket.on('action_pass', () => {
        gameState.currentCard = getRandomCard();
        io.emit('updateGame', gameState);
    });

    // Takım Değiştir
    socket.on('switch_team', () => {
        gameState.turnTeam = gameState.turnTeam === 'teamA' ? 'teamB' : 'teamA';
        io.emit('updateGame', gameState);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Tabu sunucusu ${PORT} portunda çalışıyor.`);
});