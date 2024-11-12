document.getElementById('searchBtn').addEventListener('click', async function() {
    const game = document.getElementById('gameInput').value;

    if (!game) {
        alert("Por favor, digite o nome de um jogo!");
        return;
    }

    try {
        const gameData = await fetchGameInfo(game);
        const trailerData = await fetchYouTubeTrailer(game);

        if (!gameData) {
            alert("Jogo não encontrado.");
            return;
        }

        // Encontrar o game_id específico da Twitch com o nome do jogo
        const twitchGameId = await fetchTwitchGameId(gameData.name); 

        if (!twitchGameId) {
            alert("Jogo não encontrado no Twitch.");
            return;
        }

        // Encontrar transmissões ao vivo usando o game_id da Twitch
        const streamData = await fetchTwitchStreams(twitchGameId);

        displayGameInfo(gameData);
        displayTrailer(trailerData);
        displayStreams(streamData);
    } catch (error) {
        console.error('Erro ao buscar dados do jogo:', error);
    }
});

async function fetchGameInfo(game) {
    const url = `https://api.rawg.io/api/games?search=${game}&key=4c67c848c06b406589a1b89459294d37`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Erro na API de jogo');
    const data = await response.json();
    return data.results[0];
}

async function fetchYouTubeTrailer(game) {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${game} trailer&type=video&key=AIzaSyDQWonLNrlHk890r1Sct5HxttR3wydHL30`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Erro na API do YouTube');
    const data = await response.json();
    return data.items[0];
}

// Variáveis para armazenar o token de acesso e seu tempo de expiração
let accessToken = null;
let tokenExpiry = null;

// Função para obter um novo token de acesso
async function fetchAccessToken() {
    const clientId = 'jdd09rs52rnps5uvwzpv3rk91oew3v';
    const clientSecret = 'xkub5s5999lt9thpxuotsrw2f42r44';
    const url = `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`;

    try {
        const response = await fetch(url, { method: 'POST' });
        const data = await response.json();

        // Verificar se o token foi obtido
        if (response.ok && data.access_token) {
            accessToken = data.access_token;
            tokenExpiry = Date.now() + data.expires_in * 1000;
            console.log("Novo token de acesso obtido:", accessToken);
        } else {
            console.error("Erro ao obter token de acesso:", data);
            throw new Error("Falha na autenticação com o Twitch");
        }
    } catch (error) {
        console.error("Erro ao obter o token de acesso:", error);
        throw new Error("Erro crítico ao autenticar com Twitch.");
    }
}

// Função auxiliar para realizar uma requisição autenticada à Twitch
async function fetchWithTwitchAuth(url) {
    try {
        // Verifica se o token é válido antes de cada requisição
        if (!accessToken || Date.now() >= tokenExpiry) {
            await fetchAccessToken(); // Se o token expirar ou não existir, este é renovado
        }

        const response = await fetch(url, {
            headers: {
                'Client-ID': 'jdd09rs52rnps5uvwzpv3rk91oew3v',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Erro na API do Twitch:", errorData);
            throw new Error(`Erro na API do Twitch: ${errorData.message}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Erro ao autenticar com Twitch:", error);
        throw error;
    }
}

async function fetchTwitchGameId(gameName) {
    const url = `https://api.twitch.tv/helix/games?name=${encodeURIComponent(gameName)}`;
    const data = await fetchWithTwitchAuth(url);
    return data.data.length > 0 ? data.data[0].id : null;
}

// Função para encontrar transmissões ao vivo no Twitch usando a função auxiliar
async function fetchTwitchStreams(gameId) {
    const url = `https://api.twitch.tv/helix/streams?game_id=${gameId}`;
    const data = await fetchWithTwitchAuth(url);
    return data.data;
}

function displayGameInfo(gameInfo) {
    const infoSection = document.querySelector('.gameInfoSection');

    const backgroundImage = gameInfo.background_image 
        ? `<img src="${gameInfo.background_image}" alt="${gameInfo.name} background" style="width: 100%; border-radius: 5px; margin-bottom: 10px;">` 
        : '';

    console.log(gameInfo);
    infoSection.innerHTML = `
        ${backgroundImage}
        <h2>${gameInfo.name}</h2>
        <p><strong>Plataforms:</strong> ${gameInfo.platforms.map(p => p.platform.name).join(', ')}</p>
        <p><strong>Genres:</strong> ${gameInfo.genres.map(g => g.name).join(', ')}</p>
        <p><strong>Average Score:</strong> ${gameInfo.score}%</p>
        <p><strong>Release Data:</strong> ${new Date(gameInfo.released).toLocaleDateString()}</p>
    `;


    const screenshotGallery = document.createElement('div');
    screenshotGallery.classList.add('screenshot-gallery');

    gameInfo.short_screenshots.forEach(screenshot => {
        const imgElement = document.createElement('img');
        imgElement.src = screenshot.image;
        imgElement.alt = `Screenshot de ${gameInfo.name}`;
        imgElement.classList.add('screenshot-img');
        screenshotGallery.appendChild(imgElement);
    });

    infoSection.appendChild(screenshotGallery);
}

function displayTrailer(youtubeTrailer) {
    const trailerSection = document.querySelector('.trailerSection');
    trailerSection.innerHTML = `
        <h3>Trailer</h3>
        <iframe width="560" height="315" src="https://www.youtube.com/embed/${youtubeTrailer.id.videoId}" frameborder="0" allowfullscreen></iframe>
    `;
}

function displayStreams(twitchStreams) {
    const streamsSection = document.querySelector('.streamsSection');
    streamsSection.innerHTML = '<h3>Transmissões ao Vivo</h3>';
    if (twitchStreams.length === 0) {
        streamsSection.innerHTML += `<p>Nenhuma transmissão ao vivo encontrada para este jogo.</p>`;
    } else {
        twitchStreams.forEach(stream => {
            const streamUserName = stream.user_name;

            streamsSection.innerHTML += `
                <div style="margin-bottom: 20px;">
                    <p><strong>${streamUserName}</strong> - ${stream.viewer_count} espectadores</p>
                    <iframe 
                        src="https://player.twitch.tv/?channel=${streamUserName}&parent=127.0.0.1&autoplay=false" 
                        height="300" 
                        width="100%" 
                        allowfullscreen
                        style="border: none;">
                    </iframe>
                </div>
            `;
        });
    }
}

