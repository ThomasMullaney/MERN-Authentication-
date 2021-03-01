import React, { useState, useEffect } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import "./map.style.css";
import mapStyles from "./mapStyles";
import { UserRefreshClient } from "google-auth-library";
import { toast } from "react-toastify";
import { formatRelative } from "date-fns";
import usePlacesAutoComplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";
import axios from "axios";
import { updateUser, getCookie} from "../../../helpers/auth";
import "@reach/combobox/styles.css";

const libraries = ["places"];
const mapContainerStyle = {
  width: "100vw",
  height: "100vh",
};
const center = {
  lat: 40,
  lng: 60,
};
const options = {
  styles: mapStyles,
  disableDefaultUI: true,
  zoomControl: true,
};




// -----------------working on toggle of map
// class Mapp extends React.component {
//   constructor() {
//     super()
//     this.state = {
//       isHidden:true
//     }
//   }
//   toggleHidden () {
//     this.setState({
//       isHidden: !this.state.isHidden
//     })
//   }
//   render() {
//     return (
//       <div>
//         <button onClick={this.toggleHidden.bind(this)} >
//           click to toggle map
//         </button>
//         {!this.state.isHidden && <Map />}
//       </div>
//     )
//   }
// }

// --------------------------------------------------------------------

export default function Map() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_KEY,
    libraries,
  });


  // work in progress sending location data to post in db ------------------------------------------------------
  // const [locationData, setLocationData] = useState ({
  //   lat: null,
  //   lng: null,
  //   userAdress: null
  // })

  // const { lat, lng, userAdress} = locationData;
  // const handleChange = (position) => (e) => {
  //   setLocationData({ ...locationData, lat: e.target.value });
  // };

  // const handleLocation = (position, e) => {
  //   const token = getCookie("token");
  //   console.log(token);
  //   e.preventDefault();
  //   setLocationData({ ...locationData});
  //   axios
  //     .put(
  //       `${process.env.REACT_APP_API_URL}/user/update`,
  //       {
  //         lat: position.coords.latitude,
  //         lng: position.coords.longitutde,
  //         userAdress: null,
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     )
  //     .then((res) => {
  //       updateUser(res, () => {
  //           toast.success("Location Updated Successfully");
  //           setLocationData({
  //             ...locationData
  //           });
  //       })
  //     }).catch((err) => {
  //       console.log(err.response)
  //     })
  // }
  // ---------------------------------------------------------------------

  const [markers, setMarkers] = React.useState([]);
  const [selected, setSelected] = React.useState(null);

  const panTo = React.useCallback(({ lat, lng }) => {
    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(14);
  }, []);
  
  const onMapClick = React.useCallback((event) => {
    setMarkers((current) => [
      ...current,
      {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
        time: new Date(),
      },
    ]);
  }, []);

  // use ref allows retain state without rerendering
  const mapRef = React.useRef();
  const onMapLoad = React.useCallback((map) => {
    mapRef.current = map;
  }, []);

  if (loadError) return "error loading maps";
  if (!isLoaded) return "loading";

  return (
    <div>
      <h1 className="maph1">Word on the Street</h1>

      <Search panTo={panTo} />
      <Locate panTo={panTo} />

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={8}
        center={center}
        options={options}
        onClick={onMapClick}
        onLoad={onMapLoad}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.time.toISOString()}
            position={{ lat: marker.lat, lng: marker.lng }}
            icon={{
              url: `/vinylHead.jpg`,
              origin: new window.google.maps.Point(0, 0),
              anchor: new window.google.maps.Point(15, 15),
              scaledSize: new window.google.maps.Size(30, 30),
            }}
            onClick={() => {
              setSelected(marker);
            }}
          />
        ))}

        {selected ? (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => {
              setSelected(null);
            }}
          >
            <div>
              <h2>User</h2>
              <p>Was Here {formatRelative(selected.time, new Date())}</p>
            </div>
          </InfoWindow>
        ) : null}
      </GoogleMap>
    </div>
  );
}

function Locate({ panTo }) {
  return(
  <button className="locate"
  onClick={() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        panTo({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
       () => null
       );
  }}
  >
    <img src="compass.jpg" alt="compass - locate me"/> 
  </button>
  )}

function Search({ panTo }) {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutoComplete({
    requestOptions: {
      location: { lat: () => 40, lng: () => 60 },
      radius: 200 * 1000,
    },
  });

  return (
    <div className="search">
      <Combobox
        onSelect={async (address) => {
          setValue(address, false);
          clearSuggestions();

          try {
            const results = await getGeocode({ address });
            const { lat, lng } = await getLatLng(results[0]);
            panTo({ lat, lng });
          } catch (error) {
            console.log(error);
          }
          console.log(address);
        }}
      >
        <ComboboxInput
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
          disabled={!ready}
          placeholder="Enter an Address"
        />
        <ComboboxPopover>
        <ComboboxList>
          {status === "OK" &&
            data.map(({ id, description }) => (
              <ComboboxOption key={id} value={description} />
            ))}
            </ComboboxList>
        </ComboboxPopover>
      </Combobox>
    </div>
  );
}

// export default Map;
