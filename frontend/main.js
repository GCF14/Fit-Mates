let map;
let mapboxAccessToken;
let userMarker;
let isDefaultMap = false;
let markers = [];


fetch('/api/mapbox-token')
    .then((response) => response.json())
    .then((data) => {
        mapboxAccessToken = data.token;
        mapboxgl.accessToken = mapboxAccessToken;
    })
    .catch((error) => console.error('Error fetching Mapbox token:', error));


if ("geolocation" in navigator) {
    navigator.geolocation.watchPosition(
        async function (position) {
            const longitude = position.coords.longitude;
            const latitude = position.coords.latitude;

            if (!map) {
                map = new mapboxgl.Map({
                    container: 'map',
                    style: 'mapbox://styles/fruitpunchsamurai9029/cm50yh9cx00cl01sr685j7gc0',
                    center: [longitude, latitude],
                    zoom: 15.87,
                });

                map.on('load', () => {
                    originalMapStyle = map.getStyle();
                    originalMapCenter = map.getCenter();
                    originalMapZoom = map.getZoom();
            
                    userMarker = new mapboxgl.Marker()
                        .setLngLat([longitude, latitude])
                        .addTo(map);
                    
                    markers.push(userMarker);
                });
                
            } else {
                map.setCenter([longitude, latitude]);
                if (userMarker) {
                    userMarker.setLngLat([longitude, latitude]);
                } else {
                    map.on('load', () => {
                        userMarker = new mapboxgl.Marker()
                            .setLngLat([longitude, latitude])
                            .addTo(map);
                    });
                }
            }
        },

        function (error) {
            console.error('Geolocation error:', error.message);

            if (error.code === error.PERMISSION_DENIED ||error.code === error.POSITION_UNAVAILABLE ||error.code === error.TIMEOUT ||
                error.code === error.UNKNOWN_ERROR) {

                    defaultMap();
            }

        },

        { enableHighAccuracy: true }
    );
} else {
    console.error('Geolocation is not supported by this browser.');
}


function defaultMap() {

    isDefaultMap = true;

    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v9',
        projection: 'globe',
        zoom: 1,
        center: [30, 15],
    });

    map.addControl(new mapboxgl.NavigationControl());

    map.on('style.load', () => {
        map.setFog({});
    });

    const secondsPerRevolution = 240;
    const maxSpinZoom = 5;
    const slowSpinZoom = 3;

    let userInteracting = false;
    const spinEnabled = true;

    function spinGlobe() {
        const zoom = map.getZoom();
        if (spinEnabled && !userInteracting && zoom < maxSpinZoom) {
            let distancePerSecond = 360 / secondsPerRevolution;
            if (zoom > slowSpinZoom) {
                const zoomDif =
                    (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
                distancePerSecond *= zoomDif;
            }
            const center = map.getCenter();
            center.lng -= distancePerSecond;
            map.easeTo({ center, duration: 1000, easing: (n) => n });
        }
    }

    map.on('mousedown', () => {
        userInteracting = true;
    });
    map.on('dragstart', () => {
        userInteracting = true;
    });

    map.on('moveend', () => {
        spinGlobe();
    });

    spinGlobe();
}

function toRad(degrees) {
    return degrees * (Math.PI / 180);
}


function calculateBoundingBox(longitude, latitude, radius) {
    const R = 6378; // Earth's radius in kilometers
    const latRad = toRad(latitude);
    const lonRad = toRad(longitude);
    const radiusRad = radius / R;

    const minLatitude = Math.asin(Math.sin(latRad) * Math.cos(radiusRad) -
        Math.cos(latRad) * Math.sin(radiusRad) * Math.cos(toRad(0))) * (180 / Math.PI);
    const maxLatitude = Math.asin(Math.sin(latRad) * Math.cos(radiusRad) +
        Math.cos(latRad) * Math.sin(radiusRad) * Math.cos(toRad(0))) * (180 / Math.PI);

    const dLongitude = Math.asin(Math.sin(radiusRad) * Math.sin(toRad(90))) * (180 / Math.PI);

    const minLongitude = longitude - dLongitude;
    const maxLongitude = longitude + dLongitude;

    return [minLongitude, minLatitude, maxLongitude, maxLatitude];
}


document.getElementById('findGymButton').addEventListener('click', () => {

    if (isDefaultMap) {
        map.off();
        map.remove();
        isDefaultMap = false; 
    }

    

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const longitude = position.coords.longitude;
            const latitude = position.coords.latitude;

            if (map) {
                map.off();
                map.remove();
                map = null;

            }

            

        
            map = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/fruitpunchsamurai9029/cm50yh9cx00cl01sr685j7gc0',
                center: [longitude, latitude],
                zoom: 15.87,
            });

            

            map.on('load', () => {
                originalMapStyle = map.getStyle();
                originalMapCenter = map.getCenter();
                originalMapZoom = map.getZoom();
            });

            userMarker = new mapboxgl.Marker()
                .setLngLat([longitude, latitude])
                .addTo(map);

            markers.push(userMarker);


            try {
                const radius = 1.5;
                const bbox = calculateBoundingBox(longitude, latitude, radius);

                const url = `https://api.mapbox.com/search/searchbox/v1/category/fitness_center?access_token=${mapboxAccessToken}&bbox=${bbox.join(',')}&language=en&limit=24`;

                const gymResponse = await fetch(url);
                const gymData = await gymResponse.json();
                let nearbyGyms = [];

                gymData.features.forEach(element => {
                    nearbyGyms.push({
                        name: element.properties.name,
                        address: element.properties.full_address,
                        coordinates: element.geometry.coordinates,
                        metadata: {
                            open_hours: element.properties.metadata?.open_hours ?? 'Not available',
                            phone: element.properties.metadata?.phone ?? 'Not available',
                            website: element.properties.metadata?.website ?? 'Not available',
                        },
                    });
                });


                const colorOption = {
                    color: '#ff0000', 
                };

                nearbyGyms.forEach(element => {
                    const marker = new mapboxgl.Marker(colorOption)
                        .setLngLat(element.coordinates)
                        .addTo(map);


                    let openingHoursHTML;

                    if (element.metadata.open_hours === 'Not available') {
                        openingHoursHTML = '<p>Not available</p>';
                    } else {
                        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                        openingHoursHTML = element.metadata.open_hours.periods.map((period) => {
                            const day = days[period.open.day];
                            const openTime = `${period.open.time.slice(0, 2)}:${period.open.time.slice(2)}`;
                            const closeTime = `${period.close.time.slice(0, 2)}:${period.close.time.slice(2)}`;
                            return `<p>${day}: ${openTime} - ${closeTime}</p>`;
                        }).join('');
                    }
                
                    const popupHTML = `
                        <h1>Gym Information</h1>
                        <p>Name: ${element.name}</p>
                        <p>Full Address: ${element.address}</p>
                        <p>Additional Information</p>
                        <p>Phone Number: ${element.metadata.phone}</p>
                        <p>Opening Hours:</p>
                        ${openingHoursHTML}
                        <p>Website: ${element.metadata.website}</p>
                        
                    `;
                    
                    const popup = new mapboxgl.Popup({ closeOnClick: false, maxWidth: "300px" })
                        .setHTML(popupHTML);

                    const container = document.createElement('div');
                    container.className = "findRouteContainer";
                    
                    const button = document.createElement('button');
                    button.textContent = "Detailed Route";
                    button.id = "findRouteButton";

                    container.appendChild(button);
                    popup._content.appendChild(container);

                    button.addEventListener('click', () => {
                        if (map) {
                            map.off();
                            map.remove();
                            map = null;
                        
                        }

                        setTimeout(() => {
                            map = new mapboxgl.Map({
                              container: 'map',
                              style: 'mapbox://styles/fruitpunchsamurai9029/cm55mdtxw004j01rg29w7aawx',
                              center: [longitude, latitude],
                              pitch: 65,
                              zoom: 20,
                            });
                        
                            // ... rest of your code ...
                          }, 500); // delay for 500ms

                          const longitude = position.coords.longitude;
                          const latitude = position.coords.latitude;

                          map = new mapboxgl.Map({
                              container: 'map',
                              style: 'mapbox://styles/fruitpunchsamurai9029/cm55mdtxw004j01rg29w7aawx',
                              center: [longitude, latitude],
                              pitch: 65,
                              zoom: 20,
                          });

                          const backButtonId = 'backToMapButton';
                          let backButton = document.getElementById(backButtonId);

                          if (!backButton) {
                              backButton = document.createElement('button');
                              backButton.textContent = 'Back';
                              backButton.id = backButtonId;
                              document.body.appendChild(backButton);
                          }

                          // Add event listener to the back button
                          backButton.addEventListener('click', () => {
                              map.setStyle(originalMapStyle);
                              map.setCenter(originalMapCenter);
                              map.setZoom(originalMapZoom);
                              map.setPitch(0); 

                              // Re-add markers
                              markers.forEach((marker) => {
                                  marker.addTo(map);
                              });

                              // Remove the back button
                              backButton.remove();
                              
                          });
                    });

                    

                    
                    marker.setPopup(popup);
                    markers.push(marker);

                    
                        
                });

                //For deubbuging
                console.log('Gyms within 1.5 km radius:', gymData.features);
            } catch (error) {
                console.error('Error:', error);
            }
        });


        
    }



});




