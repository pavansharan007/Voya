import React ,{useContext}from 'react'
import { UserContext } from '../contexts/userContext';
function Map() {
  const mapRef = useRef(null);
    const [latitude, setLat] = useState(17.691853747193587);
    const [longitude, setLng] = useState(83.17605812414793);
    const [users, setUsers] = useState([]);

    const { loggedIn } = useContext(UserContext);
  
    const customIcon = L.icon({
      iconUrl: "/rider.png",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });

  useEffect(() => {
    // Only initialize socket if user is logged in
    if (!loggedIn) return;

    const socket = io(import.meta.env.VITE_DEPLOY);
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          socket.emit("join", {
            id: "695d3146f69aa66abd0a9bce",
            latitude,
            longitude,
          });
          setLat(latitude);
          setLng(longitude);
        },
        (error) => console.error(error),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 1000 }
      );
    }

    socket.on("recive-locations", (data) => {
      console.log(data);
      setUsers(data);
    });

    socket.on("user-disconnected", (id) => {
      setUsers((prev) => prev.filter((u) => u.socketId !== id));
    });

    return () => socket.disconnect();
  }, [loggedIn]);
  return (
    <div>
      <div className="relative">
            <MapContainer
              center={[latitude, longitude]}
              zoom={13}
              ref={mapRef}
              style={{ height: "100vh", width: "100vw" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[latitude, longitude]}></Marker>
              {users.map((user) => (
                <Marker
                  key={user._id}
                  position={[user.lat, user.long]}
                  icon={customIcon}
                >
                  <Popup>{user._id}</Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
    </div>
  )
}

export default Map
