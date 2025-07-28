import { LightningElement, wire, api } from "lwc";
import getBoatsByLocation from "@salesforce/apex/BoatDataService.getBoatsByLocation";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

const LABEL_YOU_ARE_HERE = "You are here!";
const ICON_STANDARD_USER = "standard:user";
const ERROR_TITLE = "Error loading Boats Near Me";
const ERROR_VARIANT = "error";

export default class BoatsNearMe extends LightningElement {
  @api boatTypeId = "";
  mapMarkers = [];
  isLoading = true;
  isRendered;
  latitude = 50.52649475739886;
  longitude = 10.02004164522074;

  // Add the wired method from the Apex Class
  // Name it getBoatsByLocation, and use latitude, longitude and boatTypeId
  // Handle the result and calls createMapMarkers
  @wire(getBoatsByLocation, {
    boatTypeId: "$boatTypeId",
    latitude: "$latitude",
    longitude: "$longitude"
  })
  wiredBoatsJSON({ error, data }) {
    if (data) {
      console.log(
        "⛵️ BoatSearch: wiredBoatsJSON",
        this.latitude,
        this.longitude,
        JSON.parse(JSON.stringify(data))
      );
      this.createMapMarkers(JSON.parse(data));
    } else if (error) {
      const event = new ShowToastEvent({
        title: ERROR_TITLE,
        message: error,
        variant: ERROR_VARIANT
      });
      this.dispatchEvent(event);
      this.mapMarkers = [];
    }
    this.isLoading = false;
  }

  // Controls the isRendered property
  // Calls getLocationFromBrowser()
  renderedCallback() {
    if (!this.isRendered) {
      this.getLocationFromBrowser();
      this.isRendered = true;
    }
  }

  // Gets the location from the Browser
  // position => {latitude and longitude}
  getLocationFromBrowser() {
    navigator.geolocation.getCurrentPosition((position) => {
      console.log("🗺️", position);
      this.latitude = position.coords.latitude;
      this.longitude = position.coords.longitude;
    });
  }

  // Creates the map markers
  createMapMarkers(boatData) {
    console.log("createMapMarkers", boatData);
    const newMarkers = boatData.map((boat) => {
      return {
        title: boat.Name,
        location: {
          Latitude: boat.Geolocation__Latitude__s,
          Longitude: boat.Geolocation__Longitude__s
        }
      };
    });
    // TODO: For some reason the LIMIT 10 in BoatDataService is not working.
    this.mapMarkers = newMarkers.slice(0, 10);
    this.mapMarkers.unshift({
      title: LABEL_YOU_ARE_HERE,
      icon: ICON_STANDARD_USER,
      location: {
        Latitude: this.latitude,
        Longitude: this.longitude
      }
    });
    this.isLoading = false;
  }
}
