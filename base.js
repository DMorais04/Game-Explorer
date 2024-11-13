const RAWG_API_KEY = ''; //Preencher com a sua RAWG_API_KEY
const YOUTUBE_API_KEY = ''; //Preencher com a sua YOUTUBE_API_KEY
const TWITCH_CLIENT_ID = ''; //Preencher com o seu TWITCH_CLIENT_ID
const TWITCH_CLIENT_SECRET = ''; //Preencher com o seu TWITCH_CLIENT_SECRET 

let accessToken = null;
let tokenExpiry = null;

document.getElementById('searchBtn').addEventListener('click', async function() {
    const game = document.getElementById('gameInput').value;

    if (!game) {
        alert("Por favor, introduza um jogo!");
        return;
    }

    try {
        document.querySelector('.gameInfoSection').classList.add('hidden');
        document.querySelector('.trailerSection').classList.add('hidden');
        document.querySelector('.streamsSection').classList.add('hidden');

        const gameData = await fetchGameInfo(game);
        const trailerData = await fetchYouTubeTrailer(game);

        if (!gameData) {
            alert("Jogo não encontrado.");
            return;
        }

        const twitchGameId = await fetchTwitchGameId(gameData.name);

        if (!twitchGameId) {
            alert("Jogo não encontrado no Twitch.");
            return;
        }

        const streamData = await fetchTwitchStreams(twitchGameId);

        displayGameInfo(gameData);
        displayTrailer(trailerData);
        displayStreams(streamData);
    } catch (error) {
        console.error('Erro ao buscar dados do jogo:', error);
    }
});

async function fetchGameInfo(game) {
    const url = `https://api.rawg.io/api/games?search=${game}&key=${RAWG_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Erro na API de jogo');
    const data = await response.json();
    return data.results[0];
}

async function fetchYouTubeTrailer(game) {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${game} trailer&type=video&key=${YOUTUBE_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Erro na API do YouTube');
    const data = await response.json();
    return data.items[0];
}

async function fetchAccessToken() {
    const url = `https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`;

    try {
        const response = await fetch(url, { method: 'POST' });
        const data = await response.json();

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

async function fetchWithTwitchAuth(url) {
    try {
        if (!accessToken || Date.now() >= tokenExpiry) {
            await fetchAccessToken();
        }

        const response = await fetch(url, {
            headers: {
                'Client-ID': TWITCH_CLIENT_ID,
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

async function fetchTwitchStreams(gameId) {
    const url = `https://api.twitch.tv/helix/streams?game_id=${gameId}`;
    const data = await fetchWithTwitchAuth(url);
    return data.data;
}

function displayGameInfo(gameInfo) {
    const infoSection = document.querySelector('.gameInfoSection');
    infoSection.classList.remove('hidden');

    const backgroundImage = gameInfo.background_image 
        ? `<img src="${gameInfo.background_image}" alt="${gameInfo.name} background" style="width: 100%; border-radius: 5px; margin-bottom: 10px;">` 
        : '';

    infoSection.innerHTML = `
        ${backgroundImage}
        <h2>${gameInfo.name}</h2>
        <p><strong>Plataformas:</strong> ${gameInfo.platforms.map(p => p.platform.name).join(', ')}</p>
        <p><strong>Gêneros:</strong> ${gameInfo.genres.map(g => g.name).join(', ')}</p>
        <p><strong>Pontuação Média:</strong> ${gameInfo.score}%</p>
        <p><strong>Data de Lançamento:</strong> ${new Date(gameInfo.released).toLocaleDateString()}</p>
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
    trailerSection.classList.remove('hidden');
    trailerSection.innerHTML = `
        <h3>Trailer</h3>
        <iframe width="560" height="315" src="https://www.youtube.com/embed/${youtubeTrailer.id.videoId}" frameborder="0" allowfullscreen></iframe>
    `;
}

function displayStreams(twitchStreams) {
    const streamsSection = document.querySelector('.streamsSection');
    streamsSection.classList.remove('hidden');
    streamsSection.innerHTML = '<h3>Transmissões ao Vivo</h3>';
    
    if (twitchStreams.length === 0) {
        streamsSection.innerHTML += `<p>Nenhuma transmissão ao vivo encontrada para este jogo.</p>`;
    } else {
        twitchStreams.forEach(stream => {
            const streamUserName = stream.user_name;

            streamsSection.innerHTML += `
                <div style="margin-bottom: 20px;">
                    <p><strong>${streamUserName}</strong> - ${stream.viewer_count} spectators</p>
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