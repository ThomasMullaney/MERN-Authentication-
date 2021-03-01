import React from "react";

class Geo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            latitude: null,
            longitude: null,
            userAddress: null
        };
        this.getLocation = this.getLocation.bind(this)
        this.getCoordinates = this.getCoordinates.bind(this)
        this.reverseGeoCodeCoords = this.reverseGeoCodeCoords.bind(this)
    }
   
    getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this.getCoordinates);
        } else {
            alert("request for geolocation denied");
        }
    }

    getCoordinates(position) {
        console.log(position.coords.latitude);
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        this.reverseGeoCodeCoords();
      };

      reverseGeoCodeCoords() {
          fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${this.state.latitude},${this.state.longitude}&sensor=false&key=${process.env.REACT_APP_GOOGLE_KEY}`)
          .then(response => response.json())
          .then(data => this.setState({
              userAddress: data.results[0].formatted_address
          }))
          .catch(error => alert(error))
      }

render() {
    return (
        <div style={{color: "white"}}>
            <h3>
            location example:
            </h3>
            <div> 
                <h3>
                    Coordinates:
                </h3>
                <button onClick={this.getLocation}> Get Location </button>
                <p>latitude: {this.state.latitude}</p>
                <p>longitude: {this.state.latitude}</p>
                <p>address: {this.state.userAddress}</p>
                
            </div>
        </div>
    )
        
}
}

export default Geo