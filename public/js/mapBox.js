const  locations = JSON.parse(document.getElementById('map').dataset.locations);

 mapboxgl.accessToken = 'pk.eyJ1IjoiYXV0b21hdG9uIiwiYSI6ImNramtxMzJ5cDAzaGwycnFlN3A5Z2wzZm8ifQ.RW9c63KhHQ65FBy2HUTFxA';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11'
});
