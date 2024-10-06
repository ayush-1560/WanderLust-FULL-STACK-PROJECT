var map = L.map('map').setView(coord, 13);
console.log(coord);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  var marker = L.marker(coord).addTo(map);